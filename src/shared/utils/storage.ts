export interface JsonStorage {
  getString(key: string): string | null;
  setString(key: string, value: string): void;
  remove(key: string): void;
}

export function createMemoryJsonStorage(seed: Record<string, string> = {}): JsonStorage {
  const records = new Map<string, string>(Object.entries(seed));

  return {
    getString(key) {
      return records.get(key) ?? null;
    },
    setString(key, value) {
      records.set(key, value);
    },
    remove(key) {
      records.delete(key);
    },
  };
}

const fallbackMemoryStorage = createMemoryJsonStorage();

export function createUniJsonStorage(): JsonStorage {
  return {
    getString(key) {
      if (typeof uni !== "undefined" && typeof uni.getStorageSync === "function") {
        const value = uni.getStorageSync(key);
        return typeof value === "string" ? value : null;
      }

      return fallbackMemoryStorage.getString(key);
    },
    setString(key, value) {
      if (typeof uni !== "undefined" && typeof uni.setStorageSync === "function") {
        uni.setStorageSync(key, value);
        return;
      }

      fallbackMemoryStorage.setString(key, value);
    },
    remove(key) {
      if (typeof uni !== "undefined" && typeof uni.removeStorageSync === "function") {
        uni.removeStorageSync(key);
        return;
      }

      fallbackMemoryStorage.remove(key);
    },
  };
}
