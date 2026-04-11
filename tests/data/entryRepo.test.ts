import { describe, expect, it, vi } from "vitest";
import { createEntryRepo, type EntryRecord } from "@/data/repositories/entryRepo";
import { FakeSQLiteClient } from "./fakeSQLiteClient";

function makeEntryRecord(overrides: Partial<EntryRecord> = {}): EntryRecord {
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
  };
}

describe("entryRepo", () => {
  it("queries entry records through active/date/type/calendar lookups", async () => {
    const client = new FakeSQLiteClient();
    const active = makeEntryRecord({ id: "entry-1" });
    const byDate = makeEntryRecord({ id: "entry-2", record_date: "2026-04-11" });
    const byType = makeEntryRecord({ id: "entry-3", type: "jotting", status: "saved", unlock_date: null });
    client.queryResults.push([active], [active], [byDate], [byType], [{ record_date: "2026-04-10" }]);
    const repo = createEntryRepo(client);

    expect(await repo.listActive()).toEqual([active]);
    expect(await repo.findById("entry-1")).toEqual(active);
    expect(await repo.findByDate("2026-04-11")).toEqual([byDate]);
    expect(await repo.findByType("jotting")).toEqual([byType]);
    expect(await repo.listCalendarMarkedDates()).toEqual(["2026-04-10"]);
  });

  it("upserts and logically destroys entries with explicit timestamps", async () => {
    const client = new FakeSQLiteClient();
    const record = makeEntryRecord();
    const cleanupHook = vi.fn();
    const repo = createEntryRepo(client);

    await repo.upsert(record);
    await repo.destroyEntry("entry-1", "2026-04-12T08:00:00.000Z", { cleanupHook });

    expect(client.executed[0]).toMatchObject({
      sql: expect.stringContaining("ON CONFLICT(id) DO UPDATE"),
      params: [
        record.id,
        record.type,
        record.status,
        record.title,
        record.content,
        record.record_date,
        record.created_at,
        record.updated_at,
        record.saved_at,
        record.unlock_date,
        record.unlocked_at,
        record.destroyed_at,
        record.attachments_json,
      ],
    });
    expect(cleanupHook).toHaveBeenCalledTimes(1);
    expect(client.executed[1]).toMatchObject({
      sql: expect.stringContaining("UPDATE entries SET destroyed_at = ? WHERE id = ?"),
      params: ["2026-04-12T08:00:00.000Z", "entry-1"],
    });
  });
});
