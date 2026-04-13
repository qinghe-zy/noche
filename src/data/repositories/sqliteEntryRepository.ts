import type { SQLiteClient } from "@/data/db/sqlite";
import { rebuildProfileCaches } from "@/data/db/migrations";
import { TABLES } from "@/data/db/schema";
import {
  mapAttachmentRecordToEntryAttachment,
  mapAttachmentToEntryRecord,
  mapProfileAlbumItemRecord,
} from "@/data/mappers/attachmentMapper";
import { mapEntryToRecord, mapRecordToEntry } from "@/data/mappers/entryMapper";
import type {
  EntryMailboxCollections,
  EntryProfileStats,
  IEntryRepository,
} from "@/data/repositories/entry.repository";
import { createAttachmentRepo } from "@/data/repositories/attachmentRepo";
import { createEntryRepo, type EntryRecord } from "@/data/repositories/entryRepo";
import type { Entry, EntryType } from "@/domain/entry/types";
import { nowIso } from "@/shared/utils/date";

function hydrateEntryAttachments(
  records: EntryRecord[],
  attachmentGroups: Map<string, Entry["attachments"]>,
): Entry[] {
  return records.map((record) => {
    const entry = mapRecordToEntry(record);
    const attachments = attachmentGroups.get(record.id);

    return attachments
      ? {
          ...entry,
          attachments,
        }
      : entry;
  });
}

async function mapEntriesWithAttachments(
  records: EntryRecord[],
  client: SQLiteClient,
): Promise<Entry[]> {
  const attachmentRepo = createAttachmentRepo(client);
  const attachmentRecords = await attachmentRepo.findByEntryIds(records.map((record) => record.id));
  const attachmentGroups = new Map<string, Entry["attachments"]>();

  for (const attachmentRecord of attachmentRecords) {
    const entryId = attachmentRecord.entry_id;

    if (!entryId) {
      continue;
    }

    const nextGroup = attachmentGroups.get(entryId) ?? [];
    nextGroup.push(mapAttachmentRecordToEntryAttachment(attachmentRecord));
    attachmentGroups.set(entryId, nextGroup);
  }

  return hydrateEntryAttachments(records, attachmentGroups);
}

export function createSQLiteEntryRepository(client: SQLiteClient): IEntryRepository {
  const repo = createEntryRepo(client);
  const attachmentRepo = createAttachmentRepo(client);

  async function listEntriesBySql(sql: string, params: unknown[]): Promise<Entry[]> {
    const records = await client.query<EntryRecord>(sql, params);
    return mapEntriesWithAttachments(records, client);
  }

  async function readProfileStatsCache(): Promise<EntryProfileStats | null> {
    const rows = await client.query<{
      recorded_days: number | string | null;
      total_words: number | string | null;
      diary_count: number | string | null;
    }>(
      `SELECT recorded_days, total_words, diary_count
       FROM ${TABLES.profileStatsCache}
       WHERE cache_key = ? LIMIT 1`,
      ["profile"],
    );
    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      recordedDays: Number(row.recorded_days ?? 0),
      totalWords: Number(row.total_words ?? 0),
      diaryCount: Number(row.diary_count ?? 0),
    };
  }

  return {
    async save(entry: Entry): Promise<void> {
      const record = mapEntryToRecord(entry);
      const attachmentRecords = (entry.attachments ?? []).map(mapAttachmentToEntryRecord);

      await client.transaction(async (transactionClient) => {
        const transactionRepo = createEntryRepo(transactionClient);
        const transactionAttachmentRepo = createAttachmentRepo(transactionClient);

        await transactionRepo.upsert(record);
        await transactionAttachmentRepo.replaceForEntry(entry.id, attachmentRecords);
        await rebuildProfileCaches(transactionClient);
      });
    },

    async getById(id: string): Promise<Entry | null> {
      const record = await repo.findById(id);

      if (!record) {
        return null;
      }

      const entries = await mapEntriesWithAttachments([record], client);
      return entries[0] ?? null;
    },

    async getByDate(recordDate: string): Promise<Entry[]> {
      const records = await repo.findByDate(recordDate);
      return mapEntriesWithAttachments(records, client);
    },

    async getAllActive(): Promise<Entry[]> {
      const records = await repo.listActive();
      return mapEntriesWithAttachments(records, client);
    },

    async getByType(type: EntryType): Promise<Entry[]> {
      const records = await repo.findByType(type);
      return mapEntriesWithAttachments(records, client);
    },

    async deleteById(id: string, options?: { cleanupHook?: () => Promise<void> | void }): Promise<void> {
      await client.transaction(async (transactionClient) => {
        const transactionRepo = createEntryRepo(transactionClient);
        const transactionAttachmentRepo = createAttachmentRepo(transactionClient);

        await transactionRepo.destroyEntry(id, nowIso(), options);
        await transactionAttachmentRepo.deleteByEntryId(id);
        await rebuildProfileCaches(transactionClient);
      });
    },

    async getCalendarMarkedDates(): Promise<string[]> {
      return repo.listCalendarMarkedDates();
    },

    async getProfileStats() {
      const cached = await readProfileStatsCache();

      if (cached) {
        return cached;
      }

      await rebuildProfileCaches(client);
      return (await readProfileStatsCache()) ?? {
        recordedDays: 0,
        totalWords: 0,
        diaryCount: 0,
      };
    },

    async getCalendarPreviewEntries(recordDate: string): Promise<Entry[]> {
      return listEntriesBySql(
        `SELECT *
         FROM ${TABLES.entries}
         WHERE destroyed_at IS NULL
           AND (
             (type IN ('diary', 'jotting') AND record_date = ?)
             OR (type = 'future' AND unlock_date = ?)
           )
         ORDER BY COALESCE(saved_at, created_at) DESC, created_at DESC`,
        [recordDate, recordDate],
      );
    },

    async getUnlockableFutureEntries(recordDate: string): Promise<Entry[]> {
      return listEntriesBySql(
        `SELECT *
         FROM ${TABLES.entries}
         WHERE destroyed_at IS NULL
           AND type = 'future'
           AND status = 'sealed'
           AND unlock_date IS NOT NULL
           AND unlock_date <= ?
         ORDER BY unlock_date ASC, created_at ASC`,
        [recordDate],
      );
    },

    async getMailboxCollections(): Promise<EntryMailboxCollections> {
      const [
        documentaryDiaries,
        documentaryJottings,
        distantOpenedFutures,
        distantPendingFutures,
      ] = await Promise.all([
        this.getByType("diary"),
        this.getByType("jotting"),
        listEntriesBySql(
          `SELECT *
           FROM ${TABLES.entries}
           WHERE destroyed_at IS NULL
             AND type = 'future'
             AND status = 'unlocked'
           ORDER BY record_date DESC, created_at DESC`,
          [],
        ),
        listEntriesBySql(
          `SELECT *
           FROM ${TABLES.entries}
           WHERE destroyed_at IS NULL
             AND type = 'future'
             AND status = 'sealed'
           ORDER BY unlock_date ASC, created_at ASC`,
          [],
        ),
      ]);

      return {
        documentaryDiaries,
        documentaryJottings,
        distantOpenedFutures,
        distantPendingFutures,
      };
    },

    async getProfileAlbumItems(limit?: number) {
      const records = await attachmentRepo.listProfileAlbumItems(limit);
      return records.map(mapProfileAlbumItemRecord);
    },
  };
}
