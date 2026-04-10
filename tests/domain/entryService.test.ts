import { describe, expect, it } from "vitest";
import { createDraft } from "@/domain/services/draftService";
import {
  createEntry,
  createEntryFromDraft,
  destroyEntry,
  resolveDraftSaveAction,
} from "@/domain/services/entryService";

describe("entry service", () => {
  it("creates saved diary entries with final tech model fields", () => {
    const entry = createEntry({
      type: "diary",
      content: "今天写一封信",
      recordDate: "2026-04-10",
    });

    expect(entry.type).toBe("diary");
    expect(entry.status).toBe("saved");
    expect(entry.recordDate).toBe("2026-04-10");
    expect(entry.unlockDate).toBeNull();
    expect(entry.savedAt).toBeNull();
    expect(entry.unlockedAt).toBeNull();
    expect(entry.destroyedAt).toBeNull();
  });

  it("creates future letters as sealed entries with unlockDate", () => {
    const entry = createEntry({
      type: "future",
      content: "明天见",
      unlockDate: "2026-04-11",
    });

    expect(entry.type).toBe("future");
    expect(entry.status).toBe("sealed");
    expect(entry.unlockDate).toBe("2026-04-11");
  });

  it("creates a formally saved entry from a draft", () => {
    const draft = createDraft({
      type: "future",
    });

    const entry = createEntryFromDraft({
      ...draft,
      title: "给未来的我",
      content: "保持清醒，别着急。",
      unlockDate: "2026-04-11",
    });

    expect(entry.type).toBe("future");
    expect(entry.status).toBe("sealed");
    expect(entry.title).toBe("给未来的我");
    expect(entry.content).toBe("保持清醒，别着急。");
    expect(entry.unlockDate).toBe("2026-04-11");
    expect(entry.savedAt).toEqual(expect.any(String));
    expect(entry.updatedAt).toBe(entry.savedAt);
  });

  it("marks destroyed entries through the destroyEntry use case", async () => {
    const entry = createEntry({
      type: "jotting",
      content: "需要销毁的随笔",
    });

    const destroyed = await destroyEntry(entry);

    expect(destroyed.destroyedAt).toEqual(expect.any(String));
  });

  it("resolves empty fresh drafts to discard instead of formal save", () => {
    const draft = createDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });

    expect(resolveDraftSaveAction(draft)).toBe("discard-empty");
  });

  it("resolves empty linked drafts to destroy entry", () => {
    const draft = {
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
        linkedEntryId: "entry-1",
      }),
      title: "",
      content: "   ",
    };

    expect(resolveDraftSaveAction(draft)).toBe("destroy-entry");
  });

  it("resolves non-empty drafts to formal save", () => {
    const draft = {
      ...createDraft({
        type: "jotting",
      }),
      content: "留下这段话",
    };

    expect(resolveDraftSaveAction(draft)).toBe("save-entry");
  });

  it("resolves future drafts without unlock date to date selection first", () => {
    const draft = {
      ...createDraft({
        type: "future",
      }),
      content: "等以后再打开。",
      unlockDate: null,
    };

    expect(resolveDraftSaveAction(draft)).toBe("pick-future-date");
  });
});
