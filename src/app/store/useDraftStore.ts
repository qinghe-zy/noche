import { defineStore } from "pinia";
import type { Draft } from "@/domain/draft/types";

interface DraftState {
  drafts: Record<string, Draft>;
  activeDraftKey: string | null;
}

export const useDraftStore = defineStore("draft", {
  state: (): DraftState => ({
    drafts: {},
    activeDraftKey: null,
  }),
  getters: {
    activeDraft(state): Draft | null {
      if (!state.activeDraftKey) {
        return null;
      }

      return state.drafts[state.activeDraftKey] ?? null;
    },
  },
  actions: {
    upsertDraft(draft: Draft) {
      this.drafts[draft.slotKey] = draft;
    },
    setActiveDraftKey(slotKey: string | null) {
      this.activeDraftKey = slotKey;
    },
  },
});
