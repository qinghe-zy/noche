import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { buildDiaryPreludeMeta } from "@/domain/diaryPrelude/catalog";
import { createEntry } from "@/domain/services/entryService";
import { setEntryRepository, useEntryStore } from "@/app/store/useEntryStore";
import { setDraftRepository, useDraftStore } from "@/app/store/useDraftStore";
import type { Attachment } from "@/shared/types/attachment";

function createImageAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: overrides.id ?? "attachment-1",
    type: "image",
    draftKey: overrides.draftKey ?? "draft_diary_2026-04-10",
    entryId: overrides.entryId ?? null,
    localUri: overrides.localUri ?? "file:///noche/image-1.png",
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    width: overrides.width ?? 1200,
    height: overrides.height ?? 900,
  };
}

describe("draft store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setDraftRepository(createMemoryDraftRepository());
    setEntryRepository(createMemoryEntryRepository());
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

  it("formalizes the active draft into an entry and removes the draft", async () => {
    const draftStore = useDraftStore();
    const entryStore = useEntryStore();

    await draftStore.openDraft({
      type: "future",
    });
    await draftStore.saveActiveDraft({
      title: "给未来的我",
      content: "记得慢一点。",
      unlockDate: "2026-04-12",
    });

    const entry = await draftStore.saveActiveDraftAsEntry();

    expect(entry).toMatchObject({
      type: "future",
      status: "sealed",
      title: "给未来的我",
      content: "记得慢一点。",
      unlockDate: "2026-04-12",
    });
    expect(draftStore.activeDraft).toBeNull();
    expect(draftStore.activeDraftKey).toBeNull();
    expect(entry ? entryStore.entries[entry.id] : null).toEqual(entry);
  });

  it("restores an entry into an active draft for continued writing", async () => {
    const draftStore = useDraftStore();
    const entry = createEntry({
      type: "future",
      title: "旧信",
      content: "已经写过的内容",
      recordDate: "2026-04-10",
      unlockDate: "2026-04-12",
    });

    const draft = await draftStore.restoreEntryAsActiveDraft(entry);

    expect(draftStore.activeDraftKey).toBe("draft_future");
    expect(draft).toMatchObject({
      linkedEntryId: entry.id,
      title: "旧信",
      content: "已经写过的内容",
      unlockDate: "2026-04-12",
    });
  });

  it("resumes a saved diary entry by restoring it into the matching draft slot", async () => {
    const draftStore = useDraftStore();
    const entryStore = useEntryStore();
    const entry = createEntry({
      type: "diary",
      title: "旧日记",
      content: "那天的风很轻。",
      recordDate: "2026-04-09",
    });

    await entryStore.saveEntry(entry);
    const draft = await draftStore.resumeEntry(entry.id);

    expect(draft).toMatchObject({
      slotKey: "draft_diary_2026-04-09",
      linkedEntryId: entry.id,
      title: "旧日记",
      content: "那天的风很轻。",
      recordDate: "2026-04-09",
    });
    expect(draftStore.activeDraftKey).toBe("draft_diary_2026-04-09");
  });

  it("does not resume a future letter into editable draft state", async () => {
    const draftStore = useDraftStore();
    const entryStore = useEntryStore();
    const entry = createEntry({
      type: "future",
      title: "封存的信",
      content: "等以后再看。",
      recordDate: "2026-04-09",
      unlockDate: "2026-04-12",
    });

    await entryStore.saveEntry(entry);
    const draft = await draftStore.resumeEntry(entry.id);

    expect(draft).toBeNull();
    expect(draftStore.activeDraft).toBeNull();
    expect(draftStore.error).toBe("Future letters cannot be resumed for editing.");
  });

  it("saves a resumed diary back into the original entry id", async () => {
    const draftStore = useDraftStore();
    const entryStore = useEntryStore();
    const entry = createEntry({
      type: "diary",
      title: "旧页",
      content: "最初写下来的内容。",
      recordDate: "2026-04-09",
    });

    await entryStore.saveEntry({
      ...entry,
      savedAt: "2026-04-09T08:00:00.000Z",
    });

    await draftStore.resumeEntry(entry.id);
    await draftStore.saveActiveDraft({
      title: "旧页续写",
      content: "最初写下来的内容。\n后来又补了一段。",
    });

    const savedEntry = await draftStore.saveActiveDraftAsEntry();
    const reloadedEntry = await entryStore.fetchEntryById(entry.id);

    expect(savedEntry?.id).toBe(entry.id);
    expect(savedEntry).toMatchObject({
      id: entry.id,
      title: "旧页续写",
      content: "最初写下来的内容。\n后来又补了一段。",
      recordDate: "2026-04-09",
    });
    expect(reloadedEntry).toMatchObject({
      id: entry.id,
      title: "旧页续写",
      content: "最初写下来的内容。\n后来又补了一段。",
    });
    expect(draftStore.activeDraft).toBeNull();
  });

  it("peeks an existing jotting draft without activating it", async () => {
    const draftStore = useDraftStore();

    await draftStore.openDraft({
      type: "jotting",
    });
    await draftStore.saveActiveDraft({
      title: "随手记",
      content: "刚刚想到一句话。",
    });

    draftStore.setActiveDraftKey(null);
    const draft = await draftStore.peekDraft({
      type: "jotting",
    });

    expect(draft).toMatchObject({
      slotKey: "draft_jotting",
      title: "随手记",
      content: "刚刚想到一句话。",
    });
    expect(draftStore.activeDraft).toBeNull();
  });

  it("persists image attachments when saving and reopening a diary draft", async () => {
    const draftStore = useDraftStore();

    await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });
    await draftStore.saveActiveDraft({
      title: "",
      content: "",
      attachments: [createImageAttachment()],
    });

    draftStore.setActiveDraftKey(null);
    const restored = await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });

    expect(restored.attachments).toEqual([createImageAttachment()]);
  });

  it("persists diary prelude when saving and reopening a diary draft", async () => {
    const draftStore = useDraftStore();
    const diaryPrelude = buildDiaryPreludeMeta({
      weatherCode: "sunny",
      moodCode: "calm",
    });

    await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });
    await draftStore.saveActiveDraft({
      title: "",
      content: "",
      diaryPreludeStatus: "selected",
      diaryPrelude,
    });

    draftStore.setActiveDraftKey(null);
    const restored = await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });

    expect(restored.diaryPrelude).toEqual(diaryPrelude);
    expect(restored.diaryPreludeStatus).toBe("selected");
  });

  it("formalizes image-only drafts into entries with attachments intact", async () => {
    const draftStore = useDraftStore();

    await draftStore.openDraft({
      type: "jotting",
    });
    await draftStore.saveActiveDraft({
      title: "",
      content: "",
      attachments: [createImageAttachment({ draftKey: "draft_jotting" })],
    });

    const entry = await draftStore.saveActiveDraftAsEntry();

    expect(entry).toMatchObject({
      type: "jotting",
      title: "图片随笔",
      attachments: [
        expect.objectContaining({
          type: "image",
          localUri: "file:///noche/image-1.png",
        }),
      ],
    });
  });

  it("formalizes diary prelude into an entry and restores it on resume", async () => {
    const draftStore = useDraftStore();
    const entryStore = useEntryStore();
    const diaryPrelude = buildDiaryPreludeMeta({
      weatherCode: "cloudy",
      moodCode: "anxious",
    });

    await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });
    await draftStore.saveActiveDraft({
      title: "",
      content: "今天心里很满。",
      diaryPreludeStatus: "selected",
      diaryPrelude,
    });

    const entry = await draftStore.saveActiveDraftAsEntry();
    const reloadedEntry = entry ? await entryStore.fetchEntryById(entry.id) : null;

    expect(entry?.diaryPrelude).toEqual(diaryPrelude);
    expect(entry?.diaryPreludeStatus).toBe("selected");
    expect(reloadedEntry?.diaryPrelude).toEqual(diaryPrelude);
    expect(reloadedEntry?.diaryPreludeStatus).toBe("selected");

    const resumedDraft = entry ? await draftStore.resumeEntry(entry.id) : null;
    expect(resumedDraft?.diaryPrelude).toEqual(diaryPrelude);
    expect(resumedDraft?.diaryPreludeStatus).toBe("selected");
  });

  it("persists skipped diary prelude status without creating a synthetic prelude", async () => {
    const draftStore = useDraftStore();

    await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });
    await draftStore.saveActiveDraft({
      diaryPreludeStatus: "skipped",
      diaryPrelude: null,
    });

    draftStore.setActiveDraftKey(null);
    const restored = await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });

    expect(restored.diaryPreludeStatus).toBe("skipped");
    expect(restored.diaryPrelude).toBeNull();
  });
});
