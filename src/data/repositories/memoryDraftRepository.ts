import type { Draft } from "@/domain/draft/types";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import { cloneDiaryPrelude } from "@/domain/diaryPrelude/catalog";

export function createMemoryDraftRepository(seed: Draft[] = []): IDraftRepository {
  const drafts = new Map<string, Draft>();

  for (const draft of seed) {
    drafts.set(draft.slotKey, draft);
  }

  return {
    async save(draft) {
      drafts.set(draft.slotKey, {
        ...draft,
        attachments: draft.attachments ? [...draft.attachments] : [],
        diaryPrelude: cloneDiaryPrelude(draft.diaryPrelude),
      });
    },

    async getBySlotKey(slotKey) {
      const draft = drafts.get(slotKey);
      return draft
        ? {
            ...draft,
            attachments: draft.attachments ? [...draft.attachments] : [],
            diaryPrelude: cloneDiaryPrelude(draft.diaryPrelude),
          }
        : null;
    },

    async getAll() {
      return Array.from(drafts.values()).map((draft) => ({
        ...draft,
        attachments: draft.attachments ? [...draft.attachments] : [],
        diaryPrelude: cloneDiaryPrelude(draft.diaryPrelude),
      }));
    },

    async deleteBySlotKey(slotKey) {
      drafts.delete(slotKey);
    },
  };
}
