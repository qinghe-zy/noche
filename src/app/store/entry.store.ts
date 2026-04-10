import { defineStore } from 'pinia';
import type { Entry, EntryType } from '@/domain/entry/types';

export const useEntryStore = defineStore('entry', {
  state: () => ({
    entries: [] as Entry[],
    isLoading: false,
    error: null as string | null,
  }),
  
  actions: {
    /**
     * 加载特定日期的所有条目
     */
    async fetchEntriesByDate(date: string) {
      this.isLoading = true;
      try {
        // TODO: 调用 repository
        console.log(`Fetching entries for ${date}`);
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 保存正式条目
     */
    async saveEntry(entry: Entry) {
      this.isLoading = true;
      try {
        // TODO: 调用 repository
        console.log(`Saving entry: ${entry.id}`);
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 逻辑销毁
     */
    async destroyEntry(id: string) {
      try {
        // TODO: 调用 repository
        console.log(`Destroying entry: ${id}`);
      } catch (e: any) {
        this.error = e.message;
      }
    }
  }
});
