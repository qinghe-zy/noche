import type { Pinia } from "pinia";
import { configurePersistenceAdapters } from "@/app/providers/configurePersistenceAdapters";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import type { PrefsRepo } from "@/data/repositories/prefsRepo";

interface BootstrapPersistenceAdapters {
  draftRepository?: IDraftRepository;
  entryRepository?: IEntryRepository;
  prefsRepository?: PrefsRepo;
}

export async function bootstrapAppRuntime(
  pinia: Pinia,
  adapters: BootstrapPersistenceAdapters = {},
): Promise<void> {
  configurePersistenceAdapters({
    draftRepository: adapters.draftRepository ?? createMemoryDraftRepository(),
    entryRepository: adapters.entryRepository ?? createMemoryEntryRepository(),
    prefsRepository: adapters.prefsRepository ?? createMemoryPrefsRepository(),
  });

  const settingsStore = useSettingsStore(pinia);
  const appStore = useAppStore(pinia);

  await settingsStore.hydrate();
  appStore.markReady();
}
