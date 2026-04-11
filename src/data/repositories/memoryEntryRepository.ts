import type { Entry, EntryType } from "@/domain/entry/types";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";

function compareEntryForMailbox(a: Entry, b: Entry): number {
  if (a.recordDate !== b.recordDate) {
    return b.recordDate.localeCompare(a.recordDate);
  }

  return b.createdAt.localeCompare(a.createdAt);
}

export function createMemoryEntryRepository(seed: Entry[] = []): IEntryRepository {
  const entries = new Map<string, Entry>();

  for (const entry of seed) {
    entries.set(entry.id, cloneEntry(entry));
  }

  const activeEntries = () =>
    Array.from(entries.values())
      .filter((entry) => !entry.destroyedAt)
      .sort(compareEntryForMailbox);

  return {
    async save(entry) {
      entries.set(entry.id, cloneEntry(entry));
    },

    async getById(id) {
      const entry = entries.get(id);
      return entry && !entry.destroyedAt ? cloneEntry(entry) : null;
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
      entries.delete(id);
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

function cloneEntry(entry: Entry): Entry {
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
