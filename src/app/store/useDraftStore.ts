import { defineStore } from "pinia";
import type { Draft } from "@/domain/draft/types";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { buildDraftSlotKey } from "@/domain/draft/rules";
import type { CreateDraftInput } from "@/domain/services/draftService";
import { createDraft, markDraftBackgroundSaved } from "@/domain/services/draftService";

let draftRepository: IDraftRepository = createMemoryDraftRepository();

export function setDraftRepository(repository: IDraftRepository): void {
  draftRepository = repository;
}

interface SaveDraftPatch {
  title?: string;
  content?: string;
  unlockDate?: string | null;
}

interface DraftState {
  drafts: Record<string, Draft>;
  activeDraftKey: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useDraftStore = defineStore("draft", {
  state: (): DraftState => ({
    drafts: {},
    activeDraftKey: null,
    isLoading: false,
    error: null,
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
    async openDraft(input: CreateDraftInput): Promise<Draft> {
      this.isLoading = true;
      this.error = null;

      const slotKey = buildDraftSlotKey(input.type, {
        recordDate: input.recordDate ?? null,
        linkedEntryId: input.linkedEntryId ?? null,
      });

      try {
        const draft = (await draftRepository.getBySlotKey(slotKey)) ?? createDraft(input);
        await draftRepository.save(draft);
        this.upsertDraft(draft);
        this.setActiveDraftKey(slotKey);
        return draft;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to open draft.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async saveActiveDraft(patch: SaveDraftPatch = {}): Promise<Draft | null> {
      if (!this.activeDraft) {
        return null;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const nextDraft = markDraftBackgroundSaved({
          ...this.activeDraft,
          title: patch.title ?? this.activeDraft.title,
          content: patch.content ?? this.activeDraft.content,
          unlockDate: this.activeDraft.type === "future"
            ? patch.unlockDate ?? this.activeDraft.unlockDate ?? null
            : null,
        });

        await draftRepository.save(nextDraft);
        this.upsertDraft(nextDraft);
        return nextDraft;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to save draft.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async removeDraft(slotKey: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await draftRepository.deleteBySlotKey(slotKey);
        delete this.drafts[slotKey];
        if (this.activeDraftKey === slotKey) {
          this.activeDraftKey = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to remove draft.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    setActiveDraftKey(slotKey: string | null) {
      this.activeDraftKey = slotKey;
    },
  },
});
