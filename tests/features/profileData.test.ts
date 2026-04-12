import { describe, expect, it } from "vitest";
import type { Entry } from "@/domain/entry/types";
import type { Attachment } from "@/shared/types/attachment";
import {
  buildProfileAlbumItems,
  formatProfileBackupLabel,
  formatProfileTypeLabel,
  formatProfileWordCount,
  resolveProfileInitial,
} from "@/features/profile/profileData";

function createImageAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: overrides.id ?? "attachment-1",
    type: "image",
    draftKey: overrides.draftKey ?? null,
    entryId: overrides.entryId ?? "entry-1",
    localUri: overrides.localUri ?? "file:///noche/image-1.png",
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    width: overrides.width ?? 1200,
    height: overrides.height ?? 900,
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
    attachments: overrides.attachments ?? [],
    diaryPreludeStatus: overrides.diaryPreludeStatus ?? "skipped",
    diaryPrelude: overrides.diaryPrelude ?? null,
  };
}

describe("profileData", () => {
  it("collects album items from diary, jotting, and unlocked future entries only", () => {
    const albumItems = buildProfileAlbumItems([
      makeEntry({
        id: "future-locked",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-12",
        unlockDate: "2026-04-20",
        attachments: [createImageAttachment({ id: "locked-attachment", entryId: "future-locked" })],
      }),
      makeEntry({
        id: "diary-1",
        type: "diary",
        recordDate: "2026-04-11",
        createdAt: "2026-04-11T08:00:00.000Z",
        attachments: [
          createImageAttachment({ id: "diary-1-a", entryId: "diary-1", sortOrder: 0 }),
          createImageAttachment({ id: "diary-1-b", entryId: "diary-1", sortOrder: 1 }),
        ],
      }),
      makeEntry({
        id: "future-open",
        type: "future",
        status: "unlocked",
        recordDate: "2026-04-10",
        unlockDate: "2026-04-15",
        createdAt: "2026-04-10T09:00:00.000Z",
        attachments: [createImageAttachment({ id: "future-open-a", entryId: "future-open" })],
      }),
      makeEntry({
        id: "jotting-1",
        type: "jotting",
        recordDate: "2026-04-09",
        createdAt: "2026-04-09T10:00:00.000Z",
        attachments: [createImageAttachment({ id: "jotting-1-a", entryId: "jotting-1" })],
      }),
    ]);

    expect(albumItems.map((item) => item.attachmentId)).toEqual([
      "diary-1-a",
      "diary-1-b",
      "future-open-a",
      "jotting-1-a",
    ]);
    expect(albumItems[2]).toMatchObject({
      entryId: "future-open",
      type: "future",
      recordDate: "2026-04-10",
    });
  });

  it("formats profile labels with warm lightweight copy", () => {
    expect(formatProfileWordCount(42800)).toBe("42.8k");
    expect(formatProfileWordCount(960)).toBe("960");
    expect(formatProfileTypeLabel("diary")).toBe("日记");
    expect(formatProfileTypeLabel("jotting")).toBe("随笔");
    expect(formatProfileTypeLabel("future")).toBe("致未来");
    expect(formatProfileBackupLabel(null)).toBe("尚未备份");
    expect(formatProfileBackupLabel("2026-04-11T09:30:00.000Z")).toBe("最近一次 2026.04.11 17:30");
    expect(resolveProfileInitial("林间小径")).toBe("林");
    expect(resolveProfileInitial("  ")).toBe("夜");
  });
});
