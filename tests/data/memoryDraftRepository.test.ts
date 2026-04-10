import { describe, expect, it } from "vitest";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { createDraft } from "@/domain/services/draftService";

describe("memory draft repository", () => {
  it("saves, restores, lists, and deletes drafts by slot key", async () => {
    const repository = createMemoryDraftRepository();
    const diaryDraft = createDraft({ type: "diary", recordDate: "2026-04-10" });
    const jottingDraft = createDraft({ type: "jotting" });

    await repository.save({
      ...diaryDraft,
      title: "今天",
      content: "先写一点。",
    });
    await repository.save({
      ...jottingDraft,
      content: "突发想法",
    });

    expect(await repository.getBySlotKey(diaryDraft.slotKey)).toMatchObject({
      title: "今天",
      content: "先写一点。",
    });
    expect((await repository.getAll()).map((draft) => draft.slotKey)).toEqual([
      diaryDraft.slotKey,
      jottingDraft.slotKey,
    ]);

    await repository.deleteBySlotKey(diaryDraft.slotKey);

    expect(await repository.getBySlotKey(diaryDraft.slotKey)).toBeNull();
  });
});
