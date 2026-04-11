import { describe, expect, it } from "vitest";
import type { Draft } from "@/domain/draft/types";
import { createSQLiteDraftRepository } from "@/data/repositories/sqliteDraftRepository";
import { FakeSQLiteClient } from "./fakeSQLiteClient";

function makeDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    id: overrides.id ?? "draft-1",
    type: overrides.type ?? "future",
    title: overrides.title ?? "future title",
    content: overrides.content ?? "future content",
    recordDate: overrides.recordDate ?? "2026-04-10",
    slotKey: overrides.slotKey ?? "draft_future",
    linkedEntryId: overrides.linkedEntryId ?? null,
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-10T08:00:00.000Z",
    lastBackgroundSavedAt: overrides.lastBackgroundSavedAt ?? "2026-04-10T08:30:00.000Z",
    unlockDate: overrides.unlockDate ?? "2026-04-12",
    attachments: overrides.attachments ?? [],
  };
}

describe("sqliteDraftRepository", () => {
  it("maps domain drafts through the sqlite draft repo", async () => {
    const client = new FakeSQLiteClient();
    client.queryResults.push([
      {
        id: "draft-1",
        type: "future",
        title: "future title",
        content: "future content",
        record_date: "2026-04-10",
        slot_key: "draft_future",
        linked_entry_id: null,
        created_at: "2026-04-10T08:00:00.000Z",
        updated_at: "2026-04-10T08:00:00.000Z",
        last_background_saved_at: "2026-04-10T08:30:00.000Z",
        unlock_date: "2026-04-12",
        attachments_json: "[]",
      },
    ]);
    const repository = createSQLiteDraftRepository(client);

    const found = await repository.getBySlotKey("draft_future");
    await repository.save(makeDraft());

    expect(found).toEqual(makeDraft());
    expect(client.executed[0]?.params).toContain("2026-04-12");
    expect(await repository.getAll()).toEqual([]);
  });
});
