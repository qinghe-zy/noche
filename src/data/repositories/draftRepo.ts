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
  unlock_date: string | null;
  attachments_json?: string | null;
  diary_prelude_status?: string | null;
  diary_prelude_json?: string | null;
}

export interface DraftRepo {
  findBySlotKey(slotKey: string): Promise<DraftRecord | null>;
  list(): Promise<DraftRecord[]>;
  upsert(record: DraftRecord): Promise<void>;
  deleteBySlotKey(slotKey: string): Promise<void>;
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
    async list() {
      return client.query<DraftRecord>(`SELECT * FROM ${TABLES.drafts}`);
    },
    async upsert(record) {
      await client.execute(
        `INSERT INTO ${TABLES.drafts} (
          slot_key,
          id,
          type,
          title,
          content,
          record_date,
          linked_entry_id,
          created_at,
          updated_at,
          last_background_saved_at,
          unlock_date,
          attachments_json,
          diary_prelude_status,
          diary_prelude_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slot_key) DO UPDATE SET
          id = excluded.id,
          type = excluded.type,
          title = excluded.title,
          content = excluded.content,
          record_date = excluded.record_date,
          linked_entry_id = excluded.linked_entry_id,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          last_background_saved_at = excluded.last_background_saved_at,
          unlock_date = excluded.unlock_date,
          attachments_json = excluded.attachments_json,
          diary_prelude_status = excluded.diary_prelude_status,
          diary_prelude_json = excluded.diary_prelude_json`,
        [
          record.slot_key,
          record.id,
          record.type,
          record.title,
          record.content,
          record.record_date,
          record.linked_entry_id,
          record.created_at,
          record.updated_at,
          record.last_background_saved_at,
          record.unlock_date,
          record.attachments_json ?? "[]",
          record.diary_prelude_status ?? "skipped",
          record.diary_prelude_json ?? "null",
        ],
      );
    },
    async deleteBySlotKey(slotKey) {
      await client.execute(`DELETE FROM ${TABLES.drafts} WHERE slot_key = ?`, [slotKey]);
    },
  };
}
