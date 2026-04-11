import { describe, expect, it, vi } from "vitest";
import type { Entry } from "@/domain/entry/types";
import { createSQLiteEntryRepository } from "@/data/repositories/sqliteEntryRepository";
import { FakeSQLiteClient } from "./fakeSQLiteClient";

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: overrides.id ?? "entry-1",
    type: overrides.type ?? "future",
    status: overrides.status ?? "sealed",
    title: overrides.title ?? "future title",
    content: overrides.content ?? "future content",
    recordDate: overrides.recordDate ?? "2026-04-10",
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-10T08:00:00.000Z",
    savedAt: overrides.savedAt ?? "2026-04-10T08:00:00.000Z",
    unlockDate: overrides.unlockDate ?? "2026-04-12",
    unlockedAt: overrides.unlockedAt ?? null,
    destroyedAt: overrides.destroyedAt ?? null,
    attachments: overrides.attachments ?? [],
    diaryPreludeStatus: overrides.diaryPreludeStatus ?? "skipped",
    diaryPrelude: overrides.diaryPrelude ?? null,
  };
}

describe("sqliteEntryRepository", () => {
  it("maps entry queries through the sqlite entry repo", async () => {
    const client = new FakeSQLiteClient();
    client.queryResults.push(
      [makeEntryRecord({ id: "entry-1" })],
      [makeEntryRecord({ id: "entry-1" })],
      [makeEntryRecord({ id: "entry-2", record_date: "2026-04-11" })],
      [makeEntryRecord({ id: "entry-3", type: "jotting", status: "saved", unlock_date: null })],
      [{ record_date: "2026-04-10" }],
    );
    const repository = createSQLiteEntryRepository(client);

    expect(await repository.getAllActive()).toEqual([makeEntry()]);
    expect(await repository.getById("entry-1")).toEqual(makeEntry());
    expect((await repository.getByDate("2026-04-11"))[0]?.recordDate).toBe("2026-04-11");
    expect((await repository.getByType("jotting"))[0]?.type).toBe("jotting");
    expect(await repository.getCalendarMarkedDates()).toEqual(["2026-04-10"]);
  });

  it("saves and deletes entries through mapped sqlite operations", async () => {
    const client = new FakeSQLiteClient();
    const repository = createSQLiteEntryRepository(client);
    const cleanupHook = vi.fn();

    await repository.save(makeEntry());
    await repository.deleteById("entry-1", { cleanupHook });

    expect(client.executed).toHaveLength(2);
    expect(cleanupHook).toHaveBeenCalledTimes(1);
  });
});

function makeEntryRecord(overrides: Partial<{
  id: string;
  type: string;
  status: string;
  title: string | null;
  content: string;
  record_date: string;
  created_at: string;
  updated_at: string;
  saved_at: string | null;
  unlock_date: string | null;
  unlocked_at: string | null;
  destroyed_at: string | null;
  attachments_json: string | null;
  diary_prelude_json: string | null;
}> = {}) {
  return {
    id: overrides.id ?? "entry-1",
    type: overrides.type ?? "future",
    status: overrides.status ?? "sealed",
    title: overrides.title ?? "future title",
    content: overrides.content ?? "future content",
    record_date: overrides.record_date ?? "2026-04-10",
    created_at: overrides.created_at ?? "2026-04-10T08:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-04-10T08:00:00.000Z",
    saved_at: overrides.saved_at ?? "2026-04-10T08:00:00.000Z",
    unlock_date: overrides.unlock_date ?? "2026-04-12",
    unlocked_at: overrides.unlocked_at ?? null,
    destroyed_at: overrides.destroyed_at ?? null,
    attachments_json: overrides.attachments_json ?? "[]",
    diary_prelude_status: overrides.diary_prelude_status ?? "skipped",
    diary_prelude_json: overrides.diary_prelude_json ?? "null",
  };
}
