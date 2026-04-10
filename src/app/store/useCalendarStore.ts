import { defineStore } from "pinia";
import { collectCalendarMarkedDates, resolveCalendarDateSelection, type CalendarResolveResult } from "@/domain/services/entryQueryService";
import { getEntriesByDateWithFutureState, listActiveEntriesWithFutureState } from "@/app/store/entryReadFacade";

interface CalendarState {
  markedDates: string[];
  isLoading: boolean;
  error: string | null;
}

export { type CalendarResolveResult };

export const useCalendarStore = defineStore("calendar", {
  state: (): CalendarState => ({
    markedDates: [],
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
  },
});
