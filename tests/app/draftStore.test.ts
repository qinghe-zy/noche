import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { setDraftRepository, useDraftStore } from "@/app/store/useDraftStore";

describe("draft store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setDraftRepository(createMemoryDraftRepository());
  });

  it("opens drafts by slot, persists edits, and restores them from the repository", async () => {
    const store = useDraftStore();

    const initialDraft = await store.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });

    expect(initialDraft.slotKey).toBe("draft_diary_2026-04-10");

    const editedDraft = await store.saveActiveDraft({
      title: "补记",
      content: "今天下雨，回家很晚。",
    });

    expect(editedDraft?.title).toBe("补记");
    expect(editedDraft?.content).toBe("今天下雨，回家很晚。");
    expect(store.activeDraft?.lastBackgroundSavedAt).toEqual(expect.any(String));

    const restored = await store.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });

    expect(restored.title).toBe("补记");
    expect(restored.content).toBe("今天下雨，回家很晚。");
  });

  it("removes a persisted draft from state and repository", async () => {
    const store = useDraftStore();
    const draft = await store.openDraft({
      type: "jotting",
    });

    await store.removeDraft(draft.slotKey);

    expect(store.activeDraftKey).toBeNull();
    expect(store.activeDraft).toBeNull();
    expect(store.drafts[draft.slotKey]).toBeUndefined();
  });
});
