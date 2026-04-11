import type { PreferenceRecord, PrefsRepo } from "@/data/repositories/prefsRepo";
import type { JsonStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "noche.preferences.v1";

function readPrefs(storage: JsonStorage): Record<string, string> {
  const raw = storage.getString(STORAGE_KEY);
  return raw ? JSON.parse(raw) as Record<string, string> : {};
}

function writePrefs(storage: JsonStorage, prefs: Record<string, string>): void {
  storage.setString(STORAGE_KEY, JSON.stringify(prefs));
}

export function createStoragePrefsRepository(storage: JsonStorage): PrefsRepo {
  return {
    async get(key: string): Promise<PreferenceRecord | null> {
      const value = readPrefs(storage)[key];
      return value === undefined ? null : { key, value };
    },
    async set(record: PreferenceRecord): Promise<void> {
      const prefs = readPrefs(storage);
      prefs[record.key] = record.value;
      writePrefs(storage, prefs);
    },
  };
}
