import type { SQLiteClient } from "@/data/db/sqlite";
import { mapEntryToRecord, mapRecordToEntry } from "@/data/mappers/entryMapper";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import { createEntryRepo } from "@/data/repositories/entryRepo";
import type { Entry, EntryType } from "@/domain/entry/types";
import { nowIso } from "@/shared/utils/date";

export function createSQLiteEntryRepository(client: SQLiteClient): IEntryRepository {
  const repo = createEntryRepo(client);

  return {
    async save(entry: Entry): Promise<void> {
      await repo.upsert(mapEntryToRecord(entry));
    },
    async getById(id: string): Promise<Entry | null> {
      const record = await repo.findById(id);
      return record ? mapRecordToEntry(record) : null;
    },
    async getByDate(recordDate: string): Promise<Entry[]> {
      const records = await repo.findByDate(recordDate);
      return records.map(mapRecordToEntry);
    },
    async getAllActive(): Promise<Entry[]> {
      const records = await repo.listActive();
      return records.map(mapRecordToEntry);
    },
    async getByType(type: EntryType): Promise<Entry[]> {
      const records = await repo.findByType(type);
      return records.map(mapRecordToEntry);
    },
    async deleteById(id: string, options?: { cleanupHook?: () => Promise<void> | void }): Promise<void> {
      await repo.destroyEntry(id, nowIso(), options);
    },
    async getCalendarMarkedDates(): Promise<string[]> {
      return repo.listCalendarMarkedDates();
    },
  };
}
