import { defineStore } from "pinia";
import type { Entry } from "@/domain/entry/types";
import {
  collectCalendarMarkedDates,
  listDayArchiveEntries,
  resolveCalendarDateSelection,
  type CalendarResolveResult,
} from "@/domain/services/entryQueryService";
import { getEntriesByDateWithFutureState, listActiveEntriesWithFutureState } from "@/app/store/entryReadFacade";

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
        const entries = await listActiveEntriesWithFutureState();
        this.markedDates = collectCalendarMarkedDates(entries);
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
        const entries = await getEntriesByDateWithFutureState(recordDate);
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
        const entries = await getEntriesByDateWithFutureState(recordDate);
        this.selectedDateEntries = listDayArchiveEntries(entries, recordDate);
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
