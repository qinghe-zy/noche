import type { IDraftRepository } from "@/data/repositories/draft.repository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import type { PrefsRepo } from "@/data/repositories/prefsRepo";
import { setDraftRepository } from "@/app/store/useDraftStore";
import { setEntryRepository } from "@/app/store/useEntryStore";
import { setPrefsRepository } from "@/app/store/useSettingsStore";

interface PersistenceAdapters {
  draftRepository?: IDraftRepository;
  entryRepository?: IEntryRepository;
  prefsRepository?: PrefsRepo;
}

export function configurePersistenceAdapters(adapters: PersistenceAdapters): void {
  if (adapters.draftRepository) {
    setDraftRepository(adapters.draftRepository);
  }

  if (adapters.entryRepository) {
    setEntryRepository(adapters.entryRepository);
  }

  if (adapters.prefsRepository) {
    setPrefsRepository(adapters.prefsRepository);
  }
}
