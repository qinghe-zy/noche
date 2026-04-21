import type { Pinia } from "pinia";
import { configurePersistenceAdapters } from "@/app/providers/configurePersistenceAdapters";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ensureLatestSQLiteSchema } from "@/data/db/migrations";
import { createSQLiteClient } from "@/data/db/sqlite";
import { createStorageArchiveRepository } from "@/data/repositories/storageArchiveRepository";
import { createStorageDraftRepository } from "@/data/repositories/storageDraftRepository";
import { createStorageEntryRepository } from "@/data/repositories/storageEntryRepository";
import { createStoragePrefsRepository } from "@/data/repositories/storagePrefsRepository";
import { createSQLiteArchiveRepository } from "@/data/repositories/sqliteArchiveRepository";
import { createSQLiteDraftRepository } from "@/data/repositories/sqliteDraftRepository";
import { createSQLiteEntryRepository } from "@/data/repositories/sqliteEntryRepository";
import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import type { PrefsRepo } from "@/data/repositories/prefsRepo";
import type { Entry } from "@/domain/entry/types";
import { createUniJsonStorage } from "@/shared/utils/storage";
import { formatDate } from "@/shared/utils/date";
import { prefetchRemoteHomeWelcomeCard } from "@/features/home/homeWelcomeCardRemote";

interface BootstrapPersistenceAdapters {
  draftRepository?: IDraftRepository;
  entryRepository?: IEntryRepository;
  prefsRepository?: PrefsRepo;
  archiveRepository?: IArchiveRepository;
  demoEntries?: Entry[];
}

let runtimeReady = false;
let runtimeReadyPromise: Promise<void>;
let resolveRuntimeReady: (() => void) | null = null;

function createRuntimeReadyPromise(): void {
  runtimeReady = false;
  runtimeReadyPromise = new Promise<void>((resolve) => {
    resolveRuntimeReady = resolve;
  });
}

function beginRuntimeBootstrap(): void {
  runtimeReady = false;

  if (!resolveRuntimeReady) {
    createRuntimeReadyPromise();
  }
}

function markRuntimeReady(): void {
  runtimeReady = true;
  resolveRuntimeReady?.();
  resolveRuntimeReady = null;
}

createRuntimeReadyPromise();

function shouldUseSQLitePersistence(): boolean {
  if (typeof plus !== "undefined" && Boolean(plus.sqlite)) {
    return true;
  }

  if (typeof navigator !== "undefined") {
    return /Html5Plus/iu.test(navigator.userAgent);
  }

  return false;
}

export async function bootstrapAppRuntime(
  pinia: Pinia,
  adapters: BootstrapPersistenceAdapters = {},
): Promise<void> {
  beginRuntimeBootstrap();
  const storage = createUniJsonStorage();
  const storageDraftRepository = createStorageDraftRepository(storage);
  const storageEntryRepository = createStorageEntryRepository(storage, adapters.demoEntries ?? []);
  const storagePrefsRepository = createStoragePrefsRepository(storage);
  const storageArchiveRepository = createStorageArchiveRepository(storage);
  let draftRepository = adapters.draftRepository ?? storageDraftRepository;
  let entryRepository = adapters.entryRepository ?? storageEntryRepository;
  const prefsRepository = adapters.prefsRepository ?? storagePrefsRepository;
  let archiveRepository = adapters.archiveRepository ?? storageArchiveRepository;

  if (!adapters.draftRepository && !adapters.entryRepository && !adapters.archiveRepository && shouldUseSQLitePersistence()) {
    try {
      const client = createSQLiteClient();
      await ensureLatestSQLiteSchema(client);
      const sqliteDraftRepository = createSQLiteDraftRepository(client);
      const sqliteEntryRepository = createSQLiteEntryRepository(client);
      const sqliteArchiveRepository = createSQLiteArchiveRepository(client);
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
      if (seededEntries.length === 0 && (adapters.demoEntries?.length ?? 0) > 0) {
        for (const entry of adapters.demoEntries ?? []) {
          await sqliteEntryRepository.save(entry);
        }
      }

      draftRepository = sqliteDraftRepository;
      entryRepository = sqliteEntryRepository;
      archiveRepository = sqliteArchiveRepository;
    } catch (error) {
      console.warn("[bootstrapAppRuntime] Failed to enable SQLite persistence, falling back to storage.", error);
    }
  }

  configurePersistenceAdapters({
    draftRepository,
    entryRepository,
    prefsRepository,
    archiveRepository,
  });

  const settingsStore = useSettingsStore(pinia);
  const appStore = useAppStore(pinia);

  await settingsStore.hydrate();
  void prefetchRemoteHomeWelcomeCard(formatDate(new Date(), "YYYY-MM-DD"), settingsStore.locale);
  appStore.markReady();
  markRuntimeReady();
}

export function waitForBootstrapAppRuntime(): Promise<void> {
  return runtimeReady ? Promise.resolve() : runtimeReadyPromise;
}
