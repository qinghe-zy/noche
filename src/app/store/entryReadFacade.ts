import type { Entry } from "@/domain/entry/types";
import { getEntryRepository } from "@/app/store/entryRepository";
import {
  sortEntriesByRecordDateDesc,
  syncFutureEntryStatuses,
} from "@/domain/services/entryQueryService";

async function persistChangedEntries(changedEntries: Entry[]): Promise<void> {
  if (changedEntries.length === 0) {
    return;
  }

  const repository = getEntryRepository();

  for (const entry of changedEntries) {
    await repository.save(entry);
  }
}

export async function listActiveEntriesWithFutureState(): Promise<Entry[]> {
  const repository = getEntryRepository();
  const entries = await repository.getAllActive();
  const result = syncFutureEntryStatuses(entries);
  await persistChangedEntries(result.changedEntries);
  return result.entries.sort(sortEntriesByRecordDateDesc);
}

export async function getEntryByIdWithFutureState(entryId: string): Promise<Entry | null> {
  const repository = getEntryRepository();
  const entry = await repository.getById(entryId);

  if (!entry) {
    return null;
  }

  const result = syncFutureEntryStatuses([entry]);
  await persistChangedEntries(result.changedEntries);
  return result.entries[0] ?? null;
}

export async function getEntriesByDateWithFutureState(recordDate: string): Promise<Entry[]> {
  const repository = getEntryRepository();
  const entries = await repository.getByDate(recordDate);
  const result = syncFutureEntryStatuses(entries);
  await persistChangedEntries(result.changedEntries);
  return result.entries.sort(sortEntriesByRecordDateDesc);
}
