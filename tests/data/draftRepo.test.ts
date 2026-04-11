import { describe, expect, it } from "vitest";
import { createDraftRepo, type DraftRecord } from "@/data/repositories/draftRepo";
import { FakeSQLiteClient } from "./fakeSQLiteClient";

function makeDraftRecord(overrides: Partial<DraftRecord> = {}): DraftRecord {
  return {
    id: overrides.id ?? "draft-1",
    type: overrides.type ?? "future",
    title: overrides.title ?? "future title",
    content: overrides.content ?? "future content",
    record_date: overrides.record_date ?? "2026-04-10",
    slot_key: overrides.slot_key ?? "draft_future",
    linked_entry_id: overrides.linked_entry_id ?? null,
    created_at: overrides.created_at ?? "2026-04-10T08:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-04-10T08:00:00.000Z",
    last_background_saved_at: overrides.last_background_saved_at ?? "2026-04-10T08:30:00.000Z",
    unlock_date: overrides.unlock_date ?? "2026-04-12",
    attachments_json: overrides.attachments_json ?? "[]",
    diary_prelude_json: overrides.diary_prelude_json ?? "null",
  };
}

describe("draftRepo", () => {
  it("finds and upserts drafts including unlock_date", async () => {
    const client = new FakeSQLiteClient();
    const record = makeDraftRecord();
    client.queryResults.push([record]);
    const repo = createDraftRepo(client);

    const found = await repo.findBySlotKey("draft_future");
    await repo.upsert(record);

    expect(found).toEqual(record);
    expect(client.queried[0]).toMatchObject({
      sql: expect.stringContaining("FROM drafts WHERE slot_key = ?"),
      params: ["draft_future"],
    });
    expect(client.executed[0]).toMatchObject({
      sql: expect.stringContaining("ON CONFLICT(slot_key) DO UPDATE"),
      params: [
        record.slot_key,
        record.id,
        record.type,
        record.title,
        record.content,
        record.record_date,
        record.linked_entry_id,
        record.created_at,
        record.updated_at,
        record.last_background_saved_at,
        record.unlock_date,
        record.attachments_json,
        record.diary_prelude_json,
      ],
    });
  });

  it("lists and deletes drafts by slot key", async () => {
    const client = new FakeSQLiteClient();
    const first = makeDraftRecord({ id: "draft-1", slot_key: "draft_jotting", unlock_date: null });
    const second = makeDraftRecord({ id: "draft-2", slot_key: "draft_future" });
    client.queryResults.push([first, second]);
    const repo = createDraftRepo(client);

    const records = await repo.list();
    await repo.deleteBySlotKey("draft_future");

    expect(records).toEqual([first, second]);
    expect(client.queried[0]?.sql).toContain("SELECT * FROM drafts");
    expect(client.executed[0]).toMatchObject({
      sql: expect.stringContaining("DELETE FROM drafts WHERE slot_key = ?"),
      params: ["draft_future"],
    });
  });
});
