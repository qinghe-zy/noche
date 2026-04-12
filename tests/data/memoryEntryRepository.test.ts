import { describe, expect, it } from "vitest";
import { createEntry } from "@/domain/services/entryService";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import type { Attachment } from "@/shared/types/attachment";

function createImageAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: overrides.id ?? "attachment-1",
    type: "image",
    draftKey: overrides.draftKey ?? null,
    entryId: overrides.entryId ?? "entry-1",
    localUri: overrides.localUri ?? "_doc/noche/image-1.png",
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    width: overrides.width ?? 1200,
    height: overrides.height ?? 900,
  };
}

describe("memory entry repository", () => {
  it("saves, queries, sorts, and deletes active entries", async () => {
    const repository = createMemoryEntryRepository();
    const older = createEntry({ type: "diary", content: "older", recordDate: "2026-04-09" });
    const newer = createEntry({ type: "jotting", content: "newer", recordDate: "2026-04-10" });
    const future = createEntry({
      type: "future",
      content: "future",
      recordDate: "2026-04-08",
      unlockDate: "2026-04-11",
    });

    await repository.save(older);
    await repository.save(newer);
    await repository.save(future);

    expect((await repository.getAllActive()).map((entry) => entry.id)).toEqual([
      newer.id,
      older.id,
      future.id,
    ]);
    expect(await repository.getByType("future")).toEqual([future]);
    expect(await repository.getCalendarMarkedDates()).toEqual(["2026-04-09", "2026-04-10", "2026-04-11"]);
    expect(await repository.getProfileStats()).toEqual({
      recordedDays: 2,
      totalWords: "oldernewer".length,
      diaryCount: 1,
    });

    await repository.deleteById(newer.id);

    expect(await repository.getById(newer.id)).toBeNull();
  });

  it("returns profile album items for diary, jotting, and unlocked future entries with local images", async () => {
    const repository = createMemoryEntryRepository();
    const diary = createEntry({
      type: "diary",
      content: "diary",
      recordDate: "2026-04-10",
      attachments: [createImageAttachment({ entryId: "diary-entry" })],
    });
    const jotting = createEntry({
      type: "jotting",
      content: "jotting",
      recordDate: "2026-04-09",
      attachments: [createImageAttachment({ id: "attachment-2", entryId: "jotting-entry", localUri: "_doc/noche/image-2.png" })],
    });
    const future = {
      ...createEntry({
        type: "future",
        content: "future",
        recordDate: "2026-04-08",
        unlockDate: "2026-04-11",
        attachments: [createImageAttachment({ id: "attachment-3", entryId: "future-entry", localUri: "_doc/noche/image-3.png" })],
      }),
      status: "unlocked" as const,
    };
    const sealedFuture = createEntry({
      type: "future",
      content: "sealed future",
      recordDate: "2026-04-07",
      unlockDate: "2026-04-12",
      attachments: [createImageAttachment({ id: "attachment-4", entryId: "future-entry-2", localUri: "_doc/noche/image-4.png" })],
    });

    await repository.save(diary);
    await repository.save(jotting);
    await repository.save(future);
    await repository.save(sealedFuture);

    expect((await repository.getProfileAlbumItems()).map((item) => item.localUri)).toEqual([
      "_doc/noche/image-1.png",
      "_doc/noche/image-2.png",
      "_doc/noche/image-3.png",
    ]);
  });
});
