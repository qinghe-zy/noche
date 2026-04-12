import { defineStore } from "pinia";
import type { Entry } from "@/domain/entry/types";
import {
  listCalendarPreviewEntries,
  resolveCalendarDateSelection,
  type CalendarResolveResult,
} from "@/domain/services/entryQueryService";
import { getCalendarPreviewEntriesWithFutureState } from "@/app/store/entryReadFacade";
import { getEntryRepository } from "@/app/store/entryRepository";

interface CalendarState {
  markedDates: string[];
  selectedDateEntries: Entry[];
  isLoading: boolean;
  error: string | null;
}

export { type CalendarResolveResult };

export const useCalendarStore = defineStore("calendar", {
  state: (): CalendarState => ({
    markedDates: [],
    selectedDateEntries: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchMarkedDates(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        this.markedDates = await getEntryRepository().getCalendarMarkedDates();
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to fetch marked dates.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async resolveDate(recordDate: string): Promise<CalendarResolveResult> {
      this.isLoading = true;
      this.error = null;

      try {
        const entries = await getCalendarPreviewEntriesWithFutureState(recordDate);
        return resolveCalendarDateSelection(entries, recordDate);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to resolve calendar date.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchSelectedDateEntries(recordDate: string): Promise<Entry[]> {
      this.isLoading = true;
      this.error = null;

      try {
        const entries = await getCalendarPreviewEntriesWithFutureState(recordDate);
        this.selectedDateEntries = listCalendarPreviewEntries(entries, recordDate);
        return this.selectedDateEntries;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to fetch selected date entries.";
        this.selectedDateEntries = [];
        return [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});
