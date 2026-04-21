import type { IDraftRepository } from "@/data/repositories/draft.repository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import type { PrefsRepo } from "@/data/repositories/prefsRepo";
import { setArchiveRepository } from "@/app/store/archiveRepository";
import { setDraftRepository } from "@/app/store/useDraftStore";
import { setEntryRepository } from "@/app/store/useEntryStore";
import { setPrefsRepository } from "@/app/store/useSettingsStore";

interface PersistenceAdapters {
  draftRepository?: IDraftRepository;
  entryRepository?: IEntryRepository;
  prefsRepository?: PrefsRepo;
  archiveRepository?: IArchiveRepository;
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

  if (adapters.archiveRepository) {
    setArchiveRepository(adapters.archiveRepository);
  }
}
