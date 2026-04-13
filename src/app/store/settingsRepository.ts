import type { PrefsRepo } from "@/data/repositories/prefsRepo";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";

let prefsRepository: PrefsRepo = createMemoryPrefsRepository();

export function getPrefsRepository(): PrefsRepo {
  return prefsRepository;
}

export function setPrefsRepository(repository: PrefsRepo): void {
  prefsRepository = repository;
}
