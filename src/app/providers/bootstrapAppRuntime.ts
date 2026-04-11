import type { Pinia } from "pinia";
import { configurePersistenceAdapters } from "@/app/providers/configurePersistenceAdapters";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";
import { createStorageDraftRepository } from "@/data/repositories/storageDraftRepository";
import { createStorageEntryRepository } from "@/data/repositories/storageEntryRepository";
import { createStoragePrefsRepository } from "@/data/repositories/storagePrefsRepository";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import type { PrefsRepo } from "@/data/repositories/prefsRepo";
import type { Entry } from "@/domain/entry/types";
import { formatDate, nowIso } from "@/shared/utils/date";
import { createUniJsonStorage } from "@/shared/utils/storage";

interface BootstrapPersistenceAdapters {
  draftRepository?: IDraftRepository;
  entryRepository?: IEntryRepository;
  prefsRepository?: PrefsRepo;
}

function createDefaultBootstrapEntries(): Entry[] {
  const recordDate = formatDate(new Date(), "YYYY-MM-DD");
  const createdAt = nowIso();

  return [
    {
      id: "bootstrap-diary-sample",
      type: "diary",
      status: "saved",
      title: "今天的页边写着风声",
      content: "午后的光落在桌沿，像有人轻轻把这一天放慢。我把心里还没说完的话，先安静地写在这里。",
      recordDate,
      createdAt,
      updatedAt: createdAt,
      savedAt: createdAt,
      unlockDate: null,
      unlockedAt: null,
      destroyedAt: null,
      attachments: [],
      diaryPreludeStatus: "skipped",
      diaryPrelude: null,
    },
    {
      id: "bootstrap-jotting-sample",
      type: "jotting",
      status: "saved",
      title: "一句随笔",
      content: "有些念头不需要很大声，只要在这一天里被温柔地记住，就已经很好。",
      recordDate,
      createdAt,
      updatedAt: createdAt,
      savedAt: createdAt,
      unlockDate: null,
      unlockedAt: null,
      destroyedAt: null,
      attachments: [],
      diaryPreludeStatus: "skipped",
      diaryPrelude: null,
    },
  ];
}

export async function bootstrapAppRuntime(
  pinia: Pinia,
  adapters: BootstrapPersistenceAdapters = {},
): Promise<void> {
  const storage = createUniJsonStorage();

  configurePersistenceAdapters({
    draftRepository: adapters.draftRepository ?? createStorageDraftRepository(storage),
    entryRepository: adapters.entryRepository ?? createStorageEntryRepository(storage, createDefaultBootstrapEntries()),
    prefsRepository: adapters.prefsRepository ?? createStoragePrefsRepository(storage),
  });

  const settingsStore = useSettingsStore(pinia);
  const appStore = useAppStore(pinia);

  await settingsStore.hydrate();
  appStore.markReady();
}
