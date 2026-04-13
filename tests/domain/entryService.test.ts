import { describe, expect, it } from "vitest";
import { createDraft } from "@/domain/services/draftService";
import {
  createEntry,
  createEntryFromDraft,
  destroyEntry,
  resolveDraftSaveAction,
} from "@/domain/services/entryService";
import { buildDiaryPreludeMeta } from "@/domain/diaryPrelude/catalog";
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

  it("preserves the original createdAt when formal-saving a resumed draft", () => {
    const draft = {
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
        linkedEntryId: "entry-1",
      }),
      createdAt: "2026-04-09T08:00:00.000Z",
      title: "旧页",
      content: "补写一些内容。",
    };

    const entry = createEntryFromDraft(draft);

    expect(entry.id).toBe("entry-1");
    expect(entry.createdAt).toBe("2026-04-09T08:00:00.000Z");
    expect(entry.updatedAt).toBe(entry.savedAt);
  });

  it("keeps diary and jotting titles empty when the user leaves them blank", () => {
    const diaryDraft = {
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
      }),
      title: "   ",
      content: "今天在地铁上忽然想通了一件事\n第二行继续写",
    };
    const jottingDraft = {
      ...createDraft({
        type: "jotting",
      }),
      title: "",
      content: "刚刚想到一句可以以后再慢慢展开的话。",
    };

    const diaryEntry = createEntryFromDraft(diaryDraft);
    const jottingEntry = createEntryFromDraft(jottingDraft);

    expect(diaryEntry.title).toBeNull();
    expect(jottingEntry.title).toBeNull();
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

  it("allows image-only diary drafts to be formally saved", () => {
    const draft = {
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
      }),
      title: "",
      content: "   ",
      attachments: [createImageAttachment()],
    };

    expect(resolveDraftSaveAction(draft)).toBe("save-entry");
  });

  it("keeps diary prelude on formally saved entries", () => {
    const diaryPrelude = buildDiaryPreludeMeta({
      weatherCode: "cloudy",
      moodCode: "anxious",
    });
    const entry = createEntryFromDraft({
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
      }),
      title: "",
      content: "今天先慢慢写。",
      diaryPreludeStatus: "selected",
      diaryPrelude,
    });

    expect(entry.diaryPrelude).toEqual(diaryPrelude);
    expect(entry.diaryPreludeStatus).toBe("selected");
  });

  it("keeps diary drafts with only prelude as draft-only instead of formal save", () => {
    const draft = {
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
      }),
      title: "",
      content: "   ",
      diaryPreludeStatus: "selected",
      diaryPrelude: buildDiaryPreludeMeta({
        weatherCode: "sunny",
        moodCode: "joyful",
      }),
    };

    expect(resolveDraftSaveAction(draft)).toBe("keep-draft");
  });

  it("uses image fallback titles when a draft has only attachments", () => {
    const diaryEntry = createEntryFromDraft({
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
      }),
      title: "",
      content: "",
      attachments: [createImageAttachment({ draftKey: "draft_diary_2026-04-10" })],
    });
    const jottingEntry = createEntryFromDraft({
      ...createDraft({
        type: "jotting",
      }),
      title: "",
      content: "",
      attachments: [createImageAttachment({ draftKey: "draft_jotting" })],
    });
    const futureEntry = createEntryFromDraft({
      ...createDraft({
        type: "future",
      }),
      title: "",
      content: "",
      unlockDate: "2026-04-11",
      attachments: [createImageAttachment({ draftKey: "draft_future" })],
    });

    expect(diaryEntry.title).toBe("图片日记");
    expect(jottingEntry.title).toBe("图片随笔");
    expect(futureEntry.title).toBe("图片致未来");
  });

  it("creates new diary drafts as unseen and other drafts as skipped", () => {
    expect(
      createDraft({
        type: "diary",
        recordDate: "2026-04-10",
      }).diaryPreludeStatus,
    ).toBe("unseen");
    expect(
      createDraft({
        type: "jotting",
      }).diaryPreludeStatus,
    ).toBe("skipped");
  });
});
