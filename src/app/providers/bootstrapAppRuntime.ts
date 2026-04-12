import type { Pinia } from "pinia";
import { configurePersistenceAdapters } from "@/app/providers/configurePersistenceAdapters";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ensureLatestSQLiteSchema } from "@/data/db/migrations";
import { createSQLiteClient } from "@/data/db/sqlite";
import { createStorageDraftRepository } from "@/data/repositories/storageDraftRepository";
import { createStorageEntryRepository } from "@/data/repositories/storageEntryRepository";
import { createStoragePrefsRepository } from "@/data/repositories/storagePrefsRepository";
import { createSQLiteDraftRepository } from "@/data/repositories/sqliteDraftRepository";
import { createSQLiteEntryRepository } from "@/data/repositories/sqliteEntryRepository";
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

function shouldUseSQLitePersistence(): boolean {
  if (typeof plus !== "undefined" && Boolean(plus.sqlite)) {
    return true;
  }

  if (typeof navigator !== "undefined") {
    return /Html5Plus/iu.test(navigator.userAgent);
  }

  return false;
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
  const storageDraftRepository = createStorageDraftRepository(storage);
  const storageEntryRepository = createStorageEntryRepository(storage, createDefaultBootstrapEntries());
  const storagePrefsRepository = createStoragePrefsRepository(storage);
  let draftRepository = adapters.draftRepository ?? storageDraftRepository;
  let entryRepository = adapters.entryRepository ?? storageEntryRepository;
  const prefsRepository = adapters.prefsRepository ?? storagePrefsRepository;

  if (!adapters.draftRepository && !adapters.entryRepository && shouldUseSQLitePersistence()) {
    try {
      const client = createSQLiteClient();
      await ensureLatestSQLiteSchema(client);
      const sqliteDraftRepository = createSQLiteDraftRepository(client);
      const sqliteEntryRepository = createSQLiteEntryRepository(client);
      const existingEntries = await sqliteEntryRepository.getAllActive();
      const existingDrafts = await sqliteDraftRepository.getAll();

      if (existingEntries.length === 0 && existingDrafts.length === 0) {
        const [legacyEntries, legacyDrafts] = await Promise.all([
          storageEntryRepository.getAllActive(),
          storageDraftRepository.getAll(),
        ]);

        for (const entry of legacyEntries) {
          await sqliteEntryRepository.save(entry);
        }

        for (const draft of legacyDrafts) {
          await sqliteDraftRepository.save(draft);
        }
      }

      const seededEntries = await sqliteEntryRepository.getAllActive();
      if (seededEntries.length === 0) {
        for (const entry of createDefaultBootstrapEntries()) {
          await sqliteEntryRepository.save(entry);
        }
      }

      draftRepository = sqliteDraftRepository;
      entryRepository = sqliteEntryRepository;
    } catch (error) {
      console.warn("[bootstrapAppRuntime] Failed to enable SQLite persistence, falling back to storage.", error);
    }
  }

  configurePersistenceAdapters({
    draftRepository,
    entryRepository,
    prefsRepository,
  });

  const settingsStore = useSettingsStore(pinia);
  const appStore = useAppStore(pinia);

  await settingsStore.hydrate();
  appStore.markReady();
}
