import { defineStore } from "pinia";
import type { Entry } from "@/domain/entry/types";
import { getEntryByIdWithFutureState, listActiveEntriesWithFutureState } from "@/app/store/entryReadFacade";
import { buildMailboxCollections } from "@/domain/services/entryQueryService";

interface MailboxState {
  pastEntries: Entry[];
  sealedFutureEntries: Entry[];
  isLoading: boolean;
  error: string | null;
}

export const useMailboxStore = defineStore("mailbox", {
  state: (): MailboxState => ({
    pastEntries: [],
    sealedFutureEntries: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    pendingFutureEntries(state): Entry[] {
      return state.sealedFutureEntries;
    },
  },
  actions: {
    async refreshMailbox(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const entries = await listActiveEntriesWithFutureState();
        const collections = buildMailboxCollections(entries);
        this.pastEntries = collections.pastEntries;
        this.sealedFutureEntries = collections.sealedFutureEntries;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to refresh mailbox.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPastEntries(): Promise<void> {
      await this.refreshMailbox();
    },
    async fetchSealedFutureEntries(): Promise<void> {
      await this.refreshMailbox();
    },
    async fetchEntryById(entryId: string): Promise<Entry | null> {
      this.isLoading = true;
      this.error = null;

      try {
        return await getEntryByIdWithFutureState(entryId);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to fetch mailbox entry.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
