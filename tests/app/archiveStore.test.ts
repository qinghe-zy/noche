import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { setArchiveRepository } from "@/app/store/archiveRepository";
import { useArchiveStore } from "@/app/store/useArchiveStore";
import { createStorageArchiveRepository } from "@/data/repositories/storageArchiveRepository";
import { createMemoryJsonStorage } from "@/shared/utils/storage";

describe("archive store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setArchiveRepository(createStorageArchiveRepository(createMemoryJsonStorage()));
  });

  it("loads today's question and answers it once", async () => {
    const store = useArchiveStore();
    await store.resolveTodayQuestion("2026-04-21");

    expect(store.todayQuestion?.question.length).toBeGreaterThan(0);

    await store.answerToday("今天想留下安静。");

    expect(store.todayEntry?.answer).toBe("今天想留下安静。");
    expect(store.hasAnsweredToday).toBe(true);
  });

  it("deletes an answered archive entry and refreshes today's answered state", async () => {
    const store = useArchiveStore();
    await store.resolveTodayQuestion("2026-04-21");
    await store.answerToday("今天想留下安静。");

    await store.deleteArchiveEntry("2026-04-21");

    expect(store.todayEntry).toBeNull();
    expect(store.hasAnsweredToday).toBe(false);
    expect(store.history).toEqual([]);
  });
});
