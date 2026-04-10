import { TABLES } from "@/data/db/schema";
import type { SQLiteClient } from "@/data/db/sqlite";

export interface EntryRecord {
  id: string;
  type: string;
  title: string;
  content: string;
  record_date: string;
  created_at: string;
  updated_at: string;
  future_unlock_date: string | null;
  future_status: string | null;
  destroyed_at: string | null;
}

export interface EntryRepo {
  list(): Promise<EntryRecord[]>;
  findById(entryId: string): Promise<EntryRecord | null>;
  upsert(record: EntryRecord): Promise<void>;
  destroyEntry(
    entryId: string,
    options?: { cleanupHook?: () => Promise<void> | void },
  ): Promise<void>;
}

export function createEntryRepo(client: SQLiteClient): EntryRepo {
  return {
    async list() {
      return client.query<EntryRecord>(`SELECT * FROM ${TABLES.entries} WHERE destroyed_at IS NULL`);
    },
    async findById(entryId) {
      const rows = await client.query<EntryRecord>(
        `SELECT * FROM ${TABLES.entries} WHERE id = ? LIMIT 1`,
        [entryId],
      );

      return rows[0] ?? null;
    },
    async upsert(record) {
      await client.execute(`-- TODO: implement upsert for ${TABLES.entries}`, [record]);
    },
    async destroyEntry(entryId, options) {
      if (options?.cleanupHook) {
        await options.cleanupHook();
      }

      await client.execute(`-- TODO: implement destroyEntry for ${TABLES.entries}`, [entryId]);
    },
  };
}
