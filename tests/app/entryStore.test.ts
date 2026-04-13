import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { createEntry } from "@/domain/services/entryService";
import type { Entry } from "@/domain/entry/types";
import { setEntryRepository, useEntryStore } from "@/app/store/useEntryStore";
import type { Attachment } from "@/shared/types/attachment";

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

function makeAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: overrides.id ?? "attachment-1",
    type: overrides.type ?? "image",
    entryId: overrides.entryId ?? "entry-1",
    draftKey: overrides.draftKey ?? null,
    localUri: overrides.localUri ?? "_doc/noche/image-1.png",
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    width: overrides.width ?? null,
    height: overrides.height ?? null,
  };
}

describe("entry store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setEntryRepository(createMemoryEntryRepository());
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("persists entries through the configured repository", async () => {
    const store = useEntryStore();
    const entry = createEntry({ type: "diary", content: "store entry", recordDate: "2026-04-10" });

    await store.saveEntry(entry);
    await store.fetchEntriesByDate("2026-04-10");

    expect(store.entryList).toEqual([entry]);

    await store.destroyEntry(entry.id);

    expect(store.entryList).toEqual([]);
  });

  it("materializes unlockable future entries when fetching by id", async () => {
    const future = makeEntry({
      id: "future-open",
      type: "future",
      status: "sealed",
      recordDate: "2026-04-08",
      unlockDate: "2026-04-10",
    });
    setEntryRepository(createMemoryEntryRepository([future]));
    const store = useEntryStore();

    const entry = await store.fetchEntryById("future-open");

    expect(entry).toMatchObject({
      id: "future-open",
      status: "unlocked",
    });
    expect(store.entries["future-open"]?.status).toBe("unlocked");
  });

  it("cleans up managed local attachment files when destroying an entry", async () => {
    const removeSavedFile = vi.fn(({ success }: { filePath: string; success?: () => void }) => {
      success?.();
    });
    vi.stubGlobal("uni", {
      removeSavedFile,
    });
    const entry = makeEntry({
      id: "entry-with-file",
      attachments: [
        makeAttachment({
          entryId: "entry-with-file",
          localUri: "_doc/noche/image-1.png",
        }),
        makeAttachment({
          id: "attachment-2",
          entryId: "entry-with-file",
          localUri: "data:image/png;base64,abc",
        }),
      ],
    });
    setEntryRepository(createMemoryEntryRepository([entry]));
    const store = useEntryStore();

    await store.destroyEntry("entry-with-file");

    expect(removeSavedFile).toHaveBeenCalledTimes(1);
    expect(removeSavedFile).toHaveBeenCalledWith(
      expect.objectContaining({
        filePath: "_doc/noche/image-1.png",
      }),
    );
  });
});
