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
      diaryPrelude: buildDiaryPreludeMeta({
        weatherCode: "cloudy",
        moodCode: "anxious",
      }),
    };

    await firstRepository.save(entry);

    const secondRepository = createStorageEntryRepository(storage);
    const restoredEntry = await secondRepository.getById(entry.id);

    expect(restoredEntry?.diaryPrelude).toEqual(entry.diaryPrelude);
  });
});
