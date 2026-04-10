import { defineStore } from "pinia";
import type { Entry } from "@/domain/entry/types";

interface EntryState {
  entries: Record<string, Entry>;
}

export const useEntryStore = defineStore("entry", {
  state: (): EntryState => ({
    entries: {},
  }),
  getters: {
    entryList(state): Entry[] {
      return Object.values(state.entries);
    },
  },
  actions: {
    upsertEntry(entry: Entry) {
      this.entries[entry.id] = entry;
    },
    removeEntry(entryId: string) {
      delete this.entries[entryId];
    },
  },
});
