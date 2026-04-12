import { describe, expect, it } from "vitest";
import { createStorageEntryRepository } from "@/data/repositories/storageEntryRepository";
import { createMemoryJsonStorage } from "@/shared/utils/storage";
import { buildDiaryPreludeMeta } from "@/domain/diaryPrelude/catalog";
import { createEntry } from "@/domain/services/entryService";
import type { Attachment } from "@/shared/types/attachment";

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

describe("storageEntryRepository", () => {
  it("persists entry attachments across repository re-creation", async () => {
    const storage = createMemoryJsonStorage();
    const firstRepository = createStorageEntryRepository(storage);
    const entry = {
      ...createEntry({
        type: "diary",
        content: "",
        recordDate: "2026-04-10",
      }),
      title: "图片日记",
      attachments: [createImageAttachment({ entryId: "entry-1" })],
    };

    await firstRepository.save(entry);

    const secondRepository = createStorageEntryRepository(storage);
    const restoredEntry = await secondRepository.getById(entry.id);

    expect(restoredEntry?.attachments).toEqual([createImageAttachment({ entryId: "entry-1" })]);
  });

  it("persists diary prelude across repository re-creation", async () => {
    const storage = createMemoryJsonStorage();
    const firstRepository = createStorageEntryRepository(storage);
    const entry = {
      ...createEntry({
        type: "diary",
        content: "今天有风。",
        recordDate: "2026-04-10",
      }),
      diaryPreludeStatus: "selected",
      diaryPrelude: buildDiaryPreludeMeta({
        weatherCode: "cloudy",
        moodCode: "anxious",
      }),
    };

    await firstRepository.save(entry);

    const secondRepository = createStorageEntryRepository(storage);
    const restoredEntry = await secondRepository.getById(entry.id);

    expect(restoredEntry?.diaryPrelude).toEqual(entry.diaryPrelude);
    expect(restoredEntry?.diaryPreludeStatus).toBe("selected");
  });

  it("aggregates local profile stats from persisted entries", async () => {
    const storage = createMemoryJsonStorage();
    const repository = createStorageEntryRepository(storage);

    await repository.save(createEntry({
      type: "diary",
      content: "今天写下风声",
      recordDate: "2026-04-10",
    }));
    await repository.save(createEntry({
      type: "jotting",
      content: "一行随笔",
      recordDate: "2026-04-10",
    }));
    await repository.save(createEntry({
      type: "future",
      content: "写给明天",
      recordDate: "2026-04-11",
      unlockDate: "2026-04-12",
    }));

    expect(await repository.getProfileStats()).toEqual({
      recordedDays: 1,
      totalWords: "今天写下风声一行随笔".length,
      diaryCount: 1,
    });
  });
});
