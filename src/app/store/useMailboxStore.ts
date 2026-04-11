import { defineStore } from "pinia";
import type { Entry } from "@/domain/entry/types";
import { getEntryByIdWithFutureState, listActiveEntriesWithFutureState } from "@/app/store/entryReadFacade";
import { buildMailboxCollections } from "@/domain/services/entryQueryService";

interface MailboxState {
  documentaryDiaries: Entry[];
  documentaryJottings: Entry[];
  distantOpenedFutures: Entry[];
  distantPendingFutures: Entry[];
  isLoading: boolean;
  error: string | null;
}

export const useMailboxStore = defineStore("mailbox", {
  state: (): MailboxState => ({
    documentaryDiaries: [],
    documentaryJottings: [],
    distantOpenedFutures: [],
    distantPendingFutures: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    pastEntries(state): Entry[] {
      return [
        ...state.documentaryJottings,
        ...state.documentaryDiaries,
        ...state.distantOpenedFutures,
      ];
    },
    sealedFutureEntries(state): Entry[] {
      return state.distantPendingFutures;
    },
    pendingFutureEntries(state): Entry[] {
      return state.distantPendingFutures;
    },
  },
  actions: {
    async refreshMailbox(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const entries = await listActiveEntriesWithFutureState();
        const collections = buildMailboxCollections(entries);
        this.documentaryDiaries = collections.documentaryDiaries;
        this.documentaryJottings = collections.documentaryJottings;
        this.distantOpenedFutures = collections.distantOpenedFutures;
        this.distantPendingFutures = collections.distantPendingFutures;
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
