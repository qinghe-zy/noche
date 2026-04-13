import type { PreferenceRecord, PrefsRepo } from "@/data/repositories/prefsRepo";

export function createMemoryPrefsRepository(seed: PreferenceRecord[] = []): PrefsRepo {
  const records = new Map<string, string>();

  for (const record of seed) {
    records.set(record.key, record.value);
  }

  return {
    async get(key: string): Promise<PreferenceRecord | null> {
      const value = records.get(key);
      return value === undefined ? null : { key, value };
    },
    async set(record: PreferenceRecord): Promise<void> {
      records.set(record.key, record.value);
    },
  };
}
