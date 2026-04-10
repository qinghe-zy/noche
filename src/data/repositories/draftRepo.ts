import { TABLES } from "@/data/db/schema";
import type { SQLiteClient } from "@/data/db/sqlite";

export interface DraftRecord {
  id: string;
  type: string;
  title: string;
  content: string;
  record_date: string | null;
  slot_key: string;
  linked_entry_id: string | null;
  created_at: string;
  updated_at: string;
  last_background_saved_at: string | null;
}

export interface DraftRepo {
  findBySlotKey(slotKey: string): Promise<DraftRecord | null>;
  upsert(record: DraftRecord): Promise<void>;
}

export function createDraftRepo(client: SQLiteClient): DraftRepo {
  return {
    async findBySlotKey(slotKey) {
      const rows = await client.query<DraftRecord>(
        `SELECT * FROM ${TABLES.drafts} WHERE slot_key = ? LIMIT 1`,
        [slotKey],
      );

      return rows[0] ?? null;
    },
    async upsert(record) {
      await client.execute(`-- TODO: implement upsert for ${TABLES.drafts}`, [record]);
    },
  };
}
