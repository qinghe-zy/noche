import { defineStore } from "pinia";
import type { Entry } from "@/domain/entry/types";
import {
  getEntriesByDateWithFutureState,
  getEntryByIdWithFutureState,
  refreshUnlockableFutureEntries,
} from "@/app/store/entryReadFacade";
import { getEntryRepository, setEntryRepository } from "@/app/store/entryRepository";
import { collectManagedLocalAttachmentPaths, removeManagedLocalFiles } from "@/shared/utils/localFiles";

export { setEntryRepository };

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
        const entries = await getEntriesByDateWithFutureState(recordDate);
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
        await getEntryRepository().save(entry);
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
        const entry = await getEntryRepository().getById(entryId);
        const managedPaths = collectManagedLocalAttachmentPaths(entry?.attachments);

        await getEntryRepository().deleteById(entryId, {
          cleanupHook: async () => {
            await removeManagedLocalFiles(managedPaths);
          },
        });
        this.removeEntry(entryId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to destroy entry.";
      } finally {
        this.isLoading = false;
      }
    },
    async fetchEntryById(entryId: string): Promise<Entry | null> {
      this.isLoading = true;
      this.error = null;

      try {
        const entry = await getEntryByIdWithFutureState(entryId);
        if (entry) {
          this.upsertEntry(entry);
        }
        return entry;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to fetch entry.";
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    async refreshFutureLetterStatus(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const entries = await refreshUnlockableFutureEntries();
        for (const entry of entries) {
          this.upsertEntry(entry);
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to refresh future entry status.";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
