import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { Entry } from "@/domain/entry/types";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import { setEntryRepository } from "@/app/store/useEntryStore";
import { useCalendarStore } from "@/app/store/useCalendarStore";

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: overrides.id ?? "entry-1",
    type: overrides.type ?? "diary",
    status: overrides.status ?? "saved",
    title: overrides.title ?? null,
    content: overrides.content ?? "content",
    recordDate: overrides.recordDate ?? "2026-04-10",
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-10T08:00:00.000Z",
    savedAt: overrides.savedAt ?? "2026-04-10T08:00:00.000Z",
    unlockDate: overrides.unlockDate ?? null,
    unlockedAt: overrides.unlockedAt ?? null,
    destroyedAt: overrides.destroyedAt ?? null,
  };
}

describe("calendar store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches marked dates from calendar-visible entries only", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "diary-1",
        type: "diary",
        recordDate: "2026-04-10",
      }),
      makeEntry({
        id: "future-open",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-08",
        unlockDate: "2026-04-10",
      }),
      makeEntry({
        id: "future-locked",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-12",
        unlockDate: "2026-04-14",
      }),
    ]);
    setEntryRepository(repository);
    const store = useCalendarStore();

    await store.fetchMarkedDates();

    expect(store.markedDates).toEqual(["2026-04-10", "2026-04-14"]);
  });

  it("resolves a single visible entry date to direct entry navigation", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "future-open",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-08",
        unlockDate: "2026-04-10",
      }),
    ]);
    setEntryRepository(repository);
    const store = useCalendarStore();

    await expect(store.resolveDate("2026-04-10")).resolves.toEqual({
      kind: "entry",
      entryId: "future-open",
    });
  });

  it("resolves multiple visible entries on the same date to entry-list", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "diary-1",
        type: "diary",
        recordDate: "2026-04-10",
      }),
      makeEntry({
        id: "jotting-1",
        type: "jotting",
        recordDate: "2026-04-10",
      }),
    ]);
    setEntryRepository(repository);
    const store = useCalendarStore();

    await expect(store.resolveDate("2026-04-10")).resolves.toEqual({
      kind: "entry-list",
      recordDate: "2026-04-10",
    });
  });

  it("resolves dates without visible entries to new diary creation", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "future-locked",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-12",
        unlockDate: "2026-04-14",
      }),
    ]);
    setEntryRepository(repository);
    const store = useCalendarStore();

    await expect(store.resolveDate("2026-04-12")).resolves.toEqual({
      kind: "new-diary",
      recordDate: "2026-04-12",
    });
  });

  it("fetches the selected date entries for inline day preview", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "diary-1",
        type: "diary",
        recordDate: "2026-04-10",
      }),
      makeEntry({
        id: "jotting-1",
        type: "jotting",
        recordDate: "2026-04-10",
        createdAt: "2026-04-10T09:00:00.000Z",
      }),
      makeEntry({
        id: "future-locked",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-10",
        unlockDate: "2026-04-14",
      }),
    ]);
    setEntryRepository(repository);
    const store = useCalendarStore();

    await expect(store.fetchSelectedDateEntries("2026-04-10")).resolves.toHaveLength(2);
    expect(store.selectedDateEntries.map((entry) => entry.id)).toEqual(["jotting-1", "diary-1"]);
  });

  it("includes future letters on their unlockDate when loading the selected day preview", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "future-open",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-08",
        createdAt: "2026-04-08T09:00:00.000Z",
        unlockDate: "2026-04-10",
      }),
    ]);
    setEntryRepository(repository);
    const store = useCalendarStore();

    await expect(store.fetchSelectedDateEntries("2026-04-10")).resolves.toHaveLength(1);
    expect(store.selectedDateEntries.map((entry) => entry.id)).toEqual(["future-open"]);
  });

  it("degrades to an empty selected-date preview instead of throwing when reading fails", async () => {
    const brokenRepository: IEntryRepository = {
      async save() {},
      async getById() { return null; },
      async getByDate() { throw new Error("broken"); },
      async getAllActive() { return []; },
      async getByType() { return []; },
      async deleteById() {},
      async getCalendarMarkedDates() { return []; },
      async getProfileStats() {
        return {
          recordedDays: 0,
          totalWords: 0,
          diaryCount: 0,
        };
      },
      async getCalendarPreviewEntries() { throw new Error("broken"); },
      async getUnlockableFutureEntries() { return []; },
      async getMailboxCollections() {
        return {
          documentaryDiaries: [],
          documentaryJottings: [],
          distantOpenedFutures: [],
          distantPendingFutures: [],
        };
      },
      async getProfileAlbumItems() { return []; },
    };
    setEntryRepository(brokenRepository);
    const store = useCalendarStore();

    await expect(store.fetchSelectedDateEntries("2026-04-10")).resolves.toEqual([]);
    expect(store.selectedDateEntries).toEqual([]);
    expect(store.error).toBe("broken");
  });
});
