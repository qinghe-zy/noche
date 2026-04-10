import { TABLES } from "@/data/db/schema";
import type { SQLiteClient } from "@/data/db/sqlite";

export interface PreferenceRecord {
  key: string;
  value: string;
}

export interface PrefsRepo {
  get(key: string): Promise<PreferenceRecord | null>;
  set(record: PreferenceRecord): Promise<void>;
}

export function createPrefsRepo(client: SQLiteClient): PrefsRepo {
  return {
    async get(key) {
      const rows = await client.query<PreferenceRecord>(
        `SELECT * FROM ${TABLES.preferences} WHERE key = ? LIMIT 1`,
        [key],
      );

      return rows[0] ?? null;
    },
    async set(record) {
      await client.execute(
        `INSERT INTO ${TABLES.preferences} (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [record.key, record.value],
      );
    },
  };
}
