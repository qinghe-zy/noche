import type { Entry, EntryType } from "@/domain/entry/types";
import type {
  EntryMailboxCollections,
  EntryProfileStats,
  IEntryRepository,
} from "@/data/repositories/entry.repository";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";
import { buildEntryAlbumItems } from "@/domain/services/entryAlbumService";
import {
  buildMailboxCollections,
  listCalendarPreviewEntries,
} from "@/domain/services/entryQueryService";
import { isFutureUnlockable } from "@/domain/time/rules";

function compareEntryForMailbox(a: Entry, b: Entry): number {
  if (a.recordDate !== b.recordDate) {
    return b.recordDate.localeCompare(a.recordDate);
  }

  return b.createdAt.localeCompare(a.createdAt);
}

function shouldIncludeEntryInProfileStats(entry: Entry): boolean {
  return !(entry.type === "future" && entry.status === "sealed");
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

    async deleteById(id, options) {
      await options?.cleanupHook?.();
      entries.delete(id);
    },

    async getCalendarMarkedDates() {
      return Array.from(
        new Set(
          activeEntries()
            .map((entry) => (entry.type === "future" ? entry.unlockDate : entry.recordDate))
            .filter((date): date is string => Boolean(date)),
        ),
      ).sort();
    },

    async getProfileStats(): Promise<EntryProfileStats> {
      const active = activeEntries().filter(shouldIncludeEntryInProfileStats);

      return {
        recordedDays: new Set(active.map((entry) => entry.recordDate)).size,
        totalWords: active.reduce((sum, entry) => sum + entry.content.length, 0),
        diaryCount: active.filter((entry) => entry.type === "diary").length,
      };
    },

    async getCalendarPreviewEntries(recordDate) {
      return listCalendarPreviewEntries(activeEntries(), recordDate);
    },

    async getUnlockableFutureEntries(recordDate) {
      return activeEntries().filter((entry) =>
        entry.type === "future"
        && entry.status === "sealed"
        && Boolean(entry.unlockDate)
        && isFutureUnlockable(entry.unlockDate!, recordDate),
      );
    },

    async getMailboxCollections(): Promise<EntryMailboxCollections> {
      return buildMailboxCollections(activeEntries());
    },

    async getProfileAlbumItems(limit?: number) {
      const items = buildEntryAlbumItems(activeEntries());
      return typeof limit === "number" ? items.slice(0, limit) : items;
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
