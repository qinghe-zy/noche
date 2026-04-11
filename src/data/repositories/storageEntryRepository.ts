import type { IEntryRepository } from "@/data/repositories/entry.repository";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";
import type { Entry, EntryType } from "@/domain/entry/types";
import type { JsonStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "noche.entries.v1";

function compareEntryForMailbox(a: Entry, b: Entry): number {
  if (a.recordDate !== b.recordDate) {
    return b.recordDate.localeCompare(a.recordDate);
  }

  return b.createdAt.localeCompare(a.createdAt);
}

function readEntries(storage: JsonStorage): Record<string, Entry> {
  const raw = storage.getString(STORAGE_KEY);
  return raw ? JSON.parse(raw) as Record<string, Entry> : {};
}

function writeEntries(storage: JsonStorage, entries: Record<string, Entry>): void {
  storage.setString(STORAGE_KEY, JSON.stringify(entries));
}

function normalizeEntry(entry: Entry): Entry {
  const diaryPrelude = cloneDiaryPrelude(entry.diaryPrelude);

  return {
    ...entry,
    attachments: entry.attachments ? [...entry.attachments] : [],
    diaryPreludeStatus: entry.type === "diary"
      ? normalizeDiaryPreludeStatus(entry.diaryPreludeStatus, {
          isNewDiaryDraft: false,
          prelude: diaryPrelude,
        })
      : "skipped",
    diaryPrelude,
  };
}

export function createStorageEntryRepository(
  storage: JsonStorage,
  seed: Entry[] = [],
): IEntryRepository {
  const existing = readEntries(storage);

  if (Object.keys(existing).length === 0 && seed.length > 0) {
    const seeded: Record<string, Entry> = {};
    for (const entry of seed) {
      seeded[entry.id] = normalizeEntry(entry);
    }
    writeEntries(storage, seeded);
  }

  const activeEntries = (): Entry[] =>
    Object.values(readEntries(storage))
      .filter((entry) => !entry.destroyedAt)
      .map(normalizeEntry)
      .sort(compareEntryForMailbox);

  return {
    async save(entry) {
      const entries = readEntries(storage);
      entries[entry.id] = normalizeEntry(entry);
      writeEntries(storage, entries);
    },
    async getById(id) {
      const entry = readEntries(storage)[id];
      return entry && !entry.destroyedAt ? normalizeEntry(entry) : null;
    },
    async getByDate(recordDate) {
      return activeEntries().filter((entry) => entry.recordDate === recordDate);
    },
    async getAllActive() {
      return activeEntries();
    },
    async getByType(type: EntryType) {
      return activeEntries().filter((entry) => entry.type === type);
    },
    async deleteById(id) {
      const entries = readEntries(storage);
      delete entries[id];
      writeEntries(storage, entries);
    },
    async getCalendarMarkedDates() {
      return Array.from(
        new Set(
          activeEntries()
            .filter((entry) => entry.type === "diary" || entry.type === "jotting")
            .map((entry) => entry.recordDate),
        ),
      ).sort();
    },
  };
}
