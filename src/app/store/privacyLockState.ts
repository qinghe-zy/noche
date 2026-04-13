import { STORAGE_KEY as PREFS_STORAGE_KEY } from "@/data/repositories/storagePrefsRepository";
import { createUniJsonStorage } from "@/shared/utils/storage";

export function readStoredPrivacyLockEnabled(): boolean {
  try {
    const storage = createUniJsonStorage();
    const raw = storage.getString(PREFS_STORAGE_KEY);

    if (!raw) {
      return false;
    }

    const prefs = JSON.parse(raw) as Record<string, string>;
    return prefs.privacyLockEnabled === "1";
  } catch {
    return false;
  }
}
