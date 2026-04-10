import { defineStore } from "pinia";
import type { Entry } from "@/domain/entry/types";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";

let entryRepository: IEntryRepository = createMemoryEntryRepository();

export function setEntryRepository(repository: IEntryRepository): void {
  entryRepository = repository;
}

interface EntryState {
  entries: Record<string, Entry>;
  isLoading: boolean;
  error: string | null;
}

export const useEntryStore = defineStore("entry", {
  state: (): EntryState => ({
    entries: {},
    isLoading: false,
    error: null,
  }),
  getters: {
    entryList(state): Entry[] {
      return Object.values(state.entries);
    },
  },
  actions: {
    upsertEntry(entry: Entry): void {
      this.entries[entry.id] = entry;
    },
    removeEntry(entryId: string): void {
      delete this.entries[entryId];
    },
    async fetchEntriesByDate(recordDate: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const entries = await entryRepository.getByDate(recordDate);
        for (const entry of entries) {
          this.upsertEntry(entry);
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to fetch entries.";
      } finally {
        this.isLoading = false;
      }
    },
    async saveEntry(entry: Entry): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await entryRepository.save(entry);
        this.upsertEntry(entry);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to save entry.";
      } finally {
        this.isLoading = false;
      }
    },
    async destroyEntry(entryId: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await entryRepository.deleteById(entryId);
        this.removeEntry(entryId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to destroy entry.";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
