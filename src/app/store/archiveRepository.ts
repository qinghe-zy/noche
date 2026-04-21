import type { IArchiveRepository } from "@/data/repositories/archive.repository";

let archiveRepository: IArchiveRepository | null = null;

export function setArchiveRepository(repository: IArchiveRepository): void {
  archiveRepository = repository;
}

export function getArchiveRepository(): IArchiveRepository {
  if (!archiveRepository) {
    throw new Error("Archive repository has not been configured.");
  }

  return archiveRepository;
}
