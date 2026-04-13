import { describe, expect, it } from "vitest";
import type { Draft } from "@/domain/draft/types";
import type { Entry } from "@/domain/entry/types";
import { resolveDiaryEntryOpenTarget } from "@/domain/services/editorService";

function makeDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    id: overrides.id ?? "draft-1",
    type: overrides.type ?? "diary",
    title: overrides.title ?? "",
    content: overrides.content ?? "",
    recordDate: overrides.recordDate ?? "2026-04-10",
    slotKey: overrides.slotKey ?? "draft_diary_2026-04-10",
    linkedEntryId: overrides.linkedEntryId ?? null,
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-10T08:00:00.000Z",
    lastBackgroundSavedAt: overrides.lastBackgroundSavedAt ?? null,
    unlockDate: overrides.unlockDate ?? null,
  };
}

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: overrides.id ?? "entry-1",
    type: overrides.type ?? "diary",
    status: overrides.status ?? "saved",
    title: overrides.title ?? null,
    content: overrides.content ?? "content",
    recordDate: overrides.recordDate ?? "2026-04-10",
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-10T08:00:00.000Z",
    savedAt: overrides.savedAt ?? "2026-04-10T08:00:00.000Z",
    unlockDate: overrides.unlockDate ?? null,
    unlockedAt: overrides.unlockedAt ?? null,
    destroyedAt: overrides.destroyedAt ?? null,
  };
}

describe("editor service", () => {
  it("prefers restoring an existing diary draft", () => {
    const draft = makeDraft({
      title: "未封存的今天",
      content: "还没写完。",
    });
    const entry = makeEntry({
      id: "entry-1",
      title: "已经保存的今天",
    });

    expect(
      resolveDiaryEntryOpenTarget({
        draft,
        entries: [entry],
        recordDate: "2026-04-10",
      }),
    ).toEqual({
      kind: "draft",
      slotKey: "draft_diary_2026-04-10",
    });
  });

  it("falls back to saved diary read mode when no draft exists", () => {
    const entry = makeEntry({
      id: "entry-1",
      title: "已经保存的今天",
    });

    expect(
      resolveDiaryEntryOpenTarget({
        draft: null,
        entries: [entry],
        recordDate: "2026-04-10",
      }),
    ).toEqual({
      kind: "entry",
      entryId: "entry-1",
    });
  });

  it("creates a new diary only when neither draft nor saved diary exists", () => {
    expect(
      resolveDiaryEntryOpenTarget({
        draft: null,
        entries: [],
        recordDate: "2026-04-10",
      }),
    ).toEqual({
      kind: "new-draft",
      recordDate: "2026-04-10",
    });
  });
});
