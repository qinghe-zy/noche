import { describe, expect, it } from "vitest";
import { createStorageDraftRepository } from "@/data/repositories/storageDraftRepository";
import { createMemoryJsonStorage } from "@/shared/utils/storage";
import { createDraft } from "@/domain/services/draftService";
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

describe("storageDraftRepository", () => {
  it("persists draft attachments across repository re-creation", async () => {
    const storage = createMemoryJsonStorage();
    const firstRepository = createStorageDraftRepository(storage);
    const draft = {
      ...createDraft({
        type: "diary",
        recordDate: "2026-04-10",
      }),
      content: "   ",
      attachments: [createImageAttachment()],
    };

    await firstRepository.save(draft);

    const secondRepository = createStorageDraftRepository(storage);
    const restoredDraft = await secondRepository.getBySlotKey("draft_diary_2026-04-10");

    expect(restoredDraft?.attachments).toEqual([createImageAttachment()]);
  });
});
