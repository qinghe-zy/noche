import type { SQLiteClient } from "@/data/db/sqlite";
import {
  ATTACHMENT_AND_STATS_SCHEMA_STATEMENTS,
  ARCHIVE_SCHEMA_STATEMENTS,
  BASE_SCHEMA_STATEMENTS,
  LATEST_DB_VERSION,
  TABLES,
} from "@/data/db/schema";
import { nowIso } from "@/shared/utils/date";
import type { Attachment } from "@/shared/types/attachment";

interface UserVersionRow {
  user_version?: number | string | null;
}

interface LegacyEntryAttachmentRow {
  id: string;
  attachments_json: string | null;
}

interface LegacyDraftAttachmentRow {
  slot_key: string;
  attachments_json: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

function parseAttachmentJson(raw: string | null): Attachment[] {
  if (!raw || raw === "[]" || raw === "null") {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Attachment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function runStatements(client: SQLiteClient, statements: readonly string[]): Promise<void> {
  for (const statement of statements) {
    await client.execute(statement);
  }
}

async function getUserVersion(client: SQLiteClient): Promise<number> {
  const rows = await client.query<UserVersionRow>("PRAGMA user_version");
  return toNumber(rows[0]?.user_version);
}

async function setUserVersion(client: SQLiteClient, version: number): Promise<void> {
  await client.execute(`PRAGMA user_version = ${version}`);
}

async function backfillAttachmentTable(client: SQLiteClient): Promise<void> {
  const attachmentCountRows = await client.query<{ total: number | string | null }>(
    `SELECT COUNT(1) AS total FROM ${TABLES.attachments}`,
  );

  if (toNumber(attachmentCountRows[0]?.total) > 0) {
    return;
  }

  const [entryRows, draftRows] = await Promise.all([
    client.query<LegacyEntryAttachmentRow>(
      `SELECT id, attachments_json
       FROM ${TABLES.entries}
       WHERE attachments_json IS NOT NULL
         AND attachments_json <> '[]'
         AND attachments_json <> 'null'`,
    ),
    client.query<LegacyDraftAttachmentRow>(
      `SELECT slot_key, attachments_json
       FROM ${TABLES.drafts}
       WHERE attachments_json IS NOT NULL
         AND attachments_json <> '[]'
         AND attachments_json <> 'null'`,
    ),
  ]);

  for (const row of entryRows) {
    for (const attachment of parseAttachmentJson(row.attachments_json)) {
      await client.execute(
        `INSERT OR REPLACE INTO ${TABLES.attachments} (
          id,
          type,
          entry_id,
          draft_slot_key,
          local_uri,
          sort_order,
          created_at,
          width,
          height
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          attachment.id,
          attachment.type,
          row.id,
          null,
          attachment.localUri,
          attachment.sortOrder,
          attachment.createdAt,
          attachment.width ?? null,
          attachment.height ?? null,
        ],
      );
    }
  }

  for (const row of draftRows) {
    for (const attachment of parseAttachmentJson(row.attachments_json)) {
      await client.execute(
        `INSERT OR REPLACE INTO ${TABLES.attachments} (
          id,
          type,
          entry_id,
          draft_slot_key,
          local_uri,
          sort_order,
          created_at,
          width,
          height
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          attachment.id,
          attachment.type,
          null,
          row.slot_key,
          attachment.localUri,
          attachment.sortOrder,
          attachment.createdAt,
          attachment.width ?? null,
          attachment.height ?? null,
        ],
      );
    }
  }
}

export async function rebuildProfileCaches(client: SQLiteClient): Promise<void> {
  const cacheKey = "profile";
  const updatedAt = nowIso();
  const [statsRows, dateCounterRows] = await Promise.all([
    client.query<{
      recorded_days: number | string | null;
      total_words: number | string | null;
      diary_count: number | string | null;
    }>(
      `SELECT
         COUNT(DISTINCT record_date) AS recorded_days,
         COALESCE(SUM(LENGTH(content)), 0) AS total_words,
         COALESCE(SUM(CASE WHEN type = 'diary' THEN 1 ELSE 0 END), 0) AS diary_count
       FROM ${TABLES.entries}
       WHERE destroyed_at IS NULL
         AND NOT (type = 'future' AND status = 'sealed')`,
    ),
    client.query<{ record_date: string; active_count: number | string | null }>(
      `SELECT
         record_date,
         COUNT(1) AS active_count
       FROM ${TABLES.entries}
       WHERE destroyed_at IS NULL
       GROUP BY record_date`,
    ),
  ]);

  await client.execute(`DELETE FROM ${TABLES.recordDateCounters}`);

  for (const row of dateCounterRows) {
    await client.execute(
      `INSERT INTO ${TABLES.recordDateCounters} (record_date, active_count) VALUES (?, ?)`,
      [row.record_date, toNumber(row.active_count)],
    );
  }

  const statsRow = statsRows[0];
  await client.execute(
    `INSERT INTO ${TABLES.profileStatsCache} (
      cache_key,
      recorded_days,
      total_words,
      diary_count,
      updated_at
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(cache_key) DO UPDATE SET
      recorded_days = excluded.recorded_days,
      total_words = excluded.total_words,
      diary_count = excluded.diary_count,
      updated_at = excluded.updated_at`,
    [
      cacheKey,
      toNumber(statsRow?.recorded_days),
      toNumber(statsRow?.total_words),
      toNumber(statsRow?.diary_count),
      updatedAt,
    ],
  );
}

export async function migrateSQLiteSchema(client: SQLiteClient): Promise<void> {
  let currentVersion = await getUserVersion(client);

  if (currentVersion < 1) {
    await runStatements(client, BASE_SCHEMA_STATEMENTS);
    await setUserVersion(client, 1);
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    await runStatements(client, ATTACHMENT_AND_STATS_SCHEMA_STATEMENTS);
    await setUserVersion(client, 2);
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    await backfillAttachmentTable(client);
    await rebuildProfileCaches(client);
    await setUserVersion(client, 3);
    currentVersion = 3;
  }

  if (currentVersion < 4) {
    await runStatements(client, ARCHIVE_SCHEMA_STATEMENTS);
    currentVersion = 4;
    await setUserVersion(client, 4);
  }
}

export async function ensureLatestSQLiteSchema(client: SQLiteClient): Promise<void> {
  await migrateSQLiteSchema(client);
  const currentVersion = await getUserVersion(client);

  if (currentVersion !== LATEST_DB_VERSION) {
    throw new Error(`SQLite schema version mismatch: expected ${LATEST_DB_VERSION}, got ${currentVersion}.`);
  }
}
