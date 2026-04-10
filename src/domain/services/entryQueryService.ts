import dayjs, { type ConfigType } from "dayjs";
import type { Entry } from "@/domain/entry/types";
import { isFutureUnlockable } from "@/domain/time/rules";

export type CalendarResolveResult =
  | { kind: "entry"; entryId: string }
  | { kind: "entry-list"; recordDate: string }
  | { kind: "new-diary"; recordDate: string };

interface FutureStatusSyncResult {
  entries: Entry[];
  changedEntries: Entry[];
}

interface MailboxCollections {
  pastEntries: Entry[];
  sealedFutureEntries: Entry[];
}

function toIso(source: ConfigType): string {
  return dayjs(source).toISOString();
}

export function sortEntriesByRecordDateDesc(a: Entry, b: Entry): number {
  if (a.recordDate !== b.recordDate) {
    return b.recordDate.localeCompare(a.recordDate);
  }

  return b.createdAt.localeCompare(a.createdAt);
}

function isCalendarVisibleEntry(entry: Entry): boolean {
  return entry.type !== "future" || entry.status === "unlocked";
}

function materializeFutureEntryStatus(entry: Entry, now: ConfigType = new Date()): Entry {
  if (
    entry.type !== "future" ||
    entry.status !== "sealed" ||
    !entry.unlockDate ||
    !isFutureUnlockable(entry.unlockDate, now)
  ) {
    return entry;
  }

  const unlockedAt = entry.unlockedAt ?? toIso(now);

  return {
    ...entry,
    status: "unlocked",
    unlockedAt,
    updatedAt: unlockedAt,
  };
}

export function syncFutureEntryStatuses(
  entries: Entry[],
  now: ConfigType = new Date(),
): FutureStatusSyncResult {
  const nextEntries = entries.map((entry) => materializeFutureEntryStatus(entry, now));
  const changedEntries = nextEntries.filter((entry, index) => entry !== entries[index]);

  return {
    entries: nextEntries,
    changedEntries,
  };
}

export function buildMailboxCollections(entries: Entry[]): MailboxCollections {
  const pastEntries = entries
    .filter((entry) => entry.type !== "future" || entry.status === "unlocked")
    .sort(sortEntriesByRecordDateDesc);
  const sealedFutureEntries = entries
    .filter((entry) => entry.type === "future" && entry.status === "sealed")
    .sort(sortEntriesByRecordDateDesc);

  return {
    pastEntries,
    sealedFutureEntries,
  };
}

export function collectCalendarMarkedDates(entries: Entry[]): string[] {
  return Array.from(
    new Set(
      entries
        .filter(isCalendarVisibleEntry)
        .map((entry) => entry.recordDate),
    ),
  ).sort();
}

export function resolveCalendarDateSelection(
  entries: Entry[],
  recordDate: string,
): CalendarResolveResult {
  const visibleEntries = entries
    .filter((entry) => entry.recordDate === recordDate)
    .filter(isCalendarVisibleEntry)
    .sort(sortEntriesByRecordDateDesc);

  if (visibleEntries.length === 0) {
    return {
      kind: "new-diary",
      recordDate,
    };
  }

  if (visibleEntries.length === 1) {
    return {
      kind: "entry",
      entryId: visibleEntries[0].id,
    };
  }

  return {
    kind: "entry-list",
    recordDate,
  };
}
