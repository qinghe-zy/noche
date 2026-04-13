import type { IEntryRepository } from "@/data/repositories/entry.repository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";

let entryRepository: IEntryRepository = createMemoryEntryRepository();

export function getEntryRepository(): IEntryRepository {
  return entryRepository;
}

export function setEntryRepository(repository: IEntryRepository): void {
  entryRepository = repository;
}
