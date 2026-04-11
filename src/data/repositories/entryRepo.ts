import { TABLES } from "@/data/db/schema";
import type { SQLiteClient } from "@/data/db/sqlite";

export interface EntryRecord {
  id: string;
  type: string;
  status: string;
  title: string | null;
  content: string;
  record_date: string;
  created_at: string;
  updated_at: string;
  saved_at: string | null;
  unlock_date: string | null;
  unlocked_at: string | null;
  destroyed_at: string | null;
  attachments_json?: string | null;
  diary_prelude_status?: string | null;
  diary_prelude_json?: string | null;
}

export interface EntryRepo {
  listActive(): Promise<EntryRecord[]>;
  findById(entryId: string): Promise<EntryRecord | null>;
  findByDate(recordDate: string): Promise<EntryRecord[]>;
  findByType(type: string): Promise<EntryRecord[]>;
  listCalendarMarkedDates(): Promise<string[]>;
  upsert(record: EntryRecord): Promise<void>;
  destroyEntry(
    entryId: string,
    destroyedAt: string,
    options?: { cleanupHook?: () => Promise<void> | void },
  ): Promise<void>;
}

export function createEntryRepo(client: SQLiteClient): EntryRepo {
  return {
    async listActive() {
      return client.query<EntryRecord>(
        `SELECT * FROM ${TABLES.entries} WHERE destroyed_at IS NULL ORDER BY record_date DESC, created_at DESC`,
      );
    },
    async findById(entryId) {
      const rows = await client.query<EntryRecord>(
        `SELECT * FROM ${TABLES.entries} WHERE id = ? AND destroyed_at IS NULL LIMIT 1`,
        [entryId],
      );

      return rows[0] ?? null;
    },
    async findByDate(recordDate) {
      return client.query<EntryRecord>(
        `SELECT * FROM ${TABLES.entries} WHERE record_date = ? AND destroyed_at IS NULL ORDER BY record_date DESC, created_at DESC`,
        [recordDate],
      );
    },
    async findByType(type) {
      return client.query<EntryRecord>(
        `SELECT * FROM ${TABLES.entries} WHERE type = ? AND destroyed_at IS NULL ORDER BY record_date DESC, created_at DESC`,
        [type],
      );
    },
    async listCalendarMarkedDates() {
      const rows = await client.query<{ record_date: string }>(
        `SELECT DISTINCT record_date FROM ${TABLES.entries}
         WHERE destroyed_at IS NULL
           AND (type IN ('diary', 'jotting') OR (type = 'future' AND status = 'unlocked'))
         ORDER BY record_date ASC`,
      );

      return rows.map((row) => row.record_date);
    },
    async upsert(record) {
      await client.execute(
        `INSERT INTO ${TABLES.entries} (
          id,
          type,
          status,
          title,
          content,
          record_date,
          created_at,
          updated_at,
          saved_at,
          unlock_date,
          unlocked_at,
          destroyed_at,
          attachments_json,
          diary_prelude_status,
          diary_prelude_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          type = excluded.type,
          status = excluded.status,
          title = excluded.title,
          content = excluded.content,
          record_date = excluded.record_date,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          saved_at = excluded.saved_at,
          unlock_date = excluded.unlock_date,
          unlocked_at = excluded.unlocked_at,
          destroyed_at = excluded.destroyed_at,
          attachments_json = excluded.attachments_json,
          diary_prelude_status = excluded.diary_prelude_status,
          diary_prelude_json = excluded.diary_prelude_json`,
        [
          record.id,
          record.type,
          record.status,
          record.title,
          record.content,
          record.record_date,
          record.created_at,
          record.updated_at,
          record.saved_at,
          record.unlock_date,
          record.unlocked_at,
          record.destroyed_at,
          record.attachments_json ?? "[]",
          record.diary_prelude_status ?? "skipped",
          record.diary_prelude_json ?? "null",
        ],
      );
    },
    async destroyEntry(entryId, destroyedAt, options) {
      if (options?.cleanupHook) {
        await options.cleanupHook();
      }

      await client.execute(`UPDATE ${TABLES.entries} SET destroyed_at = ? WHERE id = ?`, [
        destroyedAt,
        entryId,
      ]);
    },
  };
}
