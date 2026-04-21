import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { setArchiveRepository } from "@/app/store/archiveRepository";
import { useArchiveStore } from "@/app/store/useArchiveStore";
import { createStorageArchiveRepository } from "@/data/repositories/storageArchiveRepository";
import { createMemoryJsonStorage } from "@/shared/utils/storage";
import type { ArchiveQuestion } from "@/features/archive/types";

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

  it("reuses the saved daily question before the user answers it", async () => {
    const repository = createStorageArchiveRepository(createMemoryJsonStorage());
    const existingQuestion: ArchiveQuestion = {
      date: "2026-04-21",
      question: "今天最想封存的安静是哪一刻？",
      source: "seeded",
      createdAt: "2026-04-21T08:00:00.000Z",
    };

    await repository.saveQuestion(existingQuestion);
    setArchiveRepository(repository);

    const store = useArchiveStore();
    await store.resolveTodayQuestion("2026-04-21");

    expect(store.todayQuestion).toEqual(existingQuestion);
    expect(store.todayEntry).toBeNull();
  });
});
