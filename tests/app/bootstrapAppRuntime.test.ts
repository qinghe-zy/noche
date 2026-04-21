import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it } from "vitest";
import { bootstrapAppRuntime } from "@/app/providers/bootstrapAppRuntime";
import { useAppStore } from "@/app/store/useAppStore";
import { getArchiveRepository } from "@/app/store/archiveRepository";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { getEntryRepository } from "@/app/store/entryRepository";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";
import type { IArchiveRepository } from "@/data/repositories/archive.repository";

describe("bootstrapAppRuntime", () => {
  it("configures repositories, hydrates settings, and marks app ready", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    await bootstrapAppRuntime(pinia, {
      draftRepository: createMemoryDraftRepository(),
      entryRepository: createMemoryEntryRepository(),
      prefsRepository: createMemoryPrefsRepository([
        { key: "theme", value: "dark" },
        { key: "locale", value: "en-US" },
        { key: "weekStartsOn", value: "0" },
      ]),
    });

    const appStore = useAppStore();
    const settingsStore = useSettingsStore();

    expect(appStore.bootStatus).toBe("ready");
    expect(settingsStore.theme).toBe("dark");
    expect(settingsStore.locale).toBe("en-US");
    expect(settingsStore.weekStartsOn).toBe(0);
  });

  it("does not inject demo entries into the default runtime", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    await bootstrapAppRuntime(pinia);

    const entries = await getEntryRepository().getAllActive();

    expect(entries).toEqual([]);
  });

  it("configures the archive repository when provided", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const archiveRepository: IArchiveRepository = {
      saveQuestion: async () => undefined,
      getQuestionByDate: async () => null,
      answerToday: async () => ({
        id: "archive-1",
        date: "2026-04-21",
        question: "今天你最想留下什么？",
        answer: "答案",
        questionSource: "fallback",
        createdAt: "2026-04-21T08:00:00.000Z",
        updatedAt: "2026-04-21T08:00:00.000Z",
        answeredAt: "2026-04-21T08:00:00.000Z",
      }),
      getByDate: async () => null,
      listAnswered: async () => [],
      getOneYearAgo: async () => null,
    };

    await bootstrapAppRuntime(pinia, {
      draftRepository: createMemoryDraftRepository(),
      entryRepository: createMemoryEntryRepository(),
      prefsRepository: createMemoryPrefsRepository(),
      archiveRepository,
    });

    expect(getArchiveRepository()).toBe(archiveRepository);
  });
});
