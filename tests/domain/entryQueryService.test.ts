import { describe, expect, it } from "vitest";
import type { Entry } from "@/domain/entry/types";
import {
  buildMailboxCollections,
  collectCalendarMarkedDates,
  listCalendarPreviewEntries,
  listDayArchiveEntries,
  syncFutureEntryStatuses,
} from "@/domain/services/entryQueryService";

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

describe("entry query service", () => {
  it("transitions unlockable future letters into unlocked entries", () => {
    const sealedFuture = makeEntry({
      id: "future-open",
      type: "future",
      status: "sealed",
      recordDate: "2026-04-08",
      unlockDate: "2026-04-10",
    });
    const stillLocked = makeEntry({
      id: "future-locked",
      type: "future",
      status: "sealed",
      recordDate: "2026-04-12",
      unlockDate: "2026-04-13",
    });

    const result = syncFutureEntryStatuses(
      [sealedFuture, stillLocked],
      new Date("2026-04-10T09:30:00.000Z"),
    );

    expect(result.changedEntries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      id: "future-open",
      status: "unlocked",
      unlockedAt: "2026-04-10T09:30:00.000Z",
    });
    expect(result.entries[1]).toBe(stillLocked);
  });

  it("builds mailbox modules for documentary and distant letters", () => {
    const diary = makeEntry({
      id: "diary-1",
      type: "diary",
      recordDate: "2026-04-10",
    });
    const jotting = makeEntry({
      id: "jotting-1",
      type: "jotting",
      recordDate: "2026-04-11",
    });
    const unlockedFuture = makeEntry({
      id: "future-open",
      type: "future",
      status: "unlocked",
      recordDate: "2026-04-09",
      unlockDate: "2026-04-10",
      unlockedAt: "2026-04-10T09:30:00.000Z",
    });
    const sealedFuture = makeEntry({
      id: "future-locked",
      type: "future",
      status: "sealed",
      recordDate: "2026-04-12",
      unlockDate: "2026-04-14",
    });

    const result = buildMailboxCollections([diary, sealedFuture, jotting, unlockedFuture]);

    expect(result.documentaryJottings.map((entry) => entry.id)).toEqual(["jotting-1"]);
    expect(result.documentaryDiaries.map((entry) => entry.id)).toEqual(["diary-1"]);
    expect(result.distantOpenedFutures.map((entry) => entry.id)).toEqual(["future-open"]);
    expect(result.distantPendingFutures.map((entry) => entry.id)).toEqual(["future-locked"]);
  });

  it("collects unique marked dates from calendar-visible entries", () => {
    const visibleDiary = makeEntry({
      id: "diary-1",
      type: "diary",
      recordDate: "2026-04-10",
    });
    const visibleFuture = makeEntry({
      id: "future-open",
      type: "future",
      status: "unlocked",
      recordDate: "2026-04-08",
      unlockDate: "2026-04-10",
      unlockedAt: "2026-04-10T09:30:00.000Z",
    });
    const sealedFuture = makeEntry({
      id: "future-locked",
      type: "future",
      status: "sealed",
      recordDate: "2026-04-12",
      unlockDate: "2026-04-14",
    });

    expect(collectCalendarMarkedDates([visibleDiary, visibleFuture, sealedFuture])).toEqual([
      "2026-04-10",
      "2026-04-14",
    ]);
  });

  it("lists calendar preview entries by recordDate for diary/jotting and unlockDate for future", () => {
    const diary = makeEntry({
      id: "diary-1",
      type: "diary",
      recordDate: "2026-04-10",
      savedAt: "2026-04-10T08:00:00.000Z",
    });
    const jotting = makeEntry({
      id: "jotting-1",
      type: "jotting",
      recordDate: "2026-04-10",
      savedAt: "2026-04-10T09:00:00.000Z",
    });
    const pendingFuture = makeEntry({
      id: "future-pending",
      type: "future",
      status: "sealed",
      recordDate: "2026-04-10",
      unlockDate: "2026-04-12",
      savedAt: "2026-04-10T10:00:00.000Z",
    });

    expect(listCalendarPreviewEntries([diary, jotting, pendingFuture], "2026-04-10").map((entry) => entry.id)).toEqual([
      "jotting-1",
      "diary-1",
    ]);

    expect(listCalendarPreviewEntries([diary, jotting, pendingFuture], "2026-04-12").map((entry) => entry.id)).toEqual([
      "future-pending",
    ]);
  });

  it("lists only calendar-visible entries for a day archive in stable order", () => {
    const diary = makeEntry({
      id: "diary-1",
      type: "diary",
      recordDate: "2026-04-10",
      createdAt: "2026-04-10T08:00:00.000Z",
    });
    const jotting = makeEntry({
      id: "jotting-1",
      type: "jotting",
      recordDate: "2026-04-10",
      createdAt: "2026-04-10T09:00:00.000Z",
    });
    const unlockedFuture = makeEntry({
      id: "future-open",
      type: "future",
      status: "unlocked",
      recordDate: "2026-04-10",
      createdAt: "2026-04-10T07:00:00.000Z",
      unlockDate: "2026-04-09",
      unlockedAt: "2026-04-09T00:00:00.000Z",
    });
    const sealedFuture = makeEntry({
      id: "future-locked",
      type: "future",
      status: "sealed",
      recordDate: "2026-04-10",
      createdAt: "2026-04-10T10:00:00.000Z",
      unlockDate: "2026-04-12",
    });

    expect(
      listDayArchiveEntries([diary, jotting, unlockedFuture, sealedFuture], "2026-04-10").map(
        (entry) => entry.id,
      ),
    ).toEqual(["jotting-1", "diary-1", "future-open"]);
  });
});
