import type { Draft } from "@/domain/draft/types";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";

function cloneDraft(draft: Draft): Draft {
  const diaryPrelude = cloneDiaryPrelude(draft.diaryPrelude);

  return {
    ...draft,
    attachments: draft.attachments ? [...draft.attachments] : [],
    diaryPreludeStatus: draft.type === "diary"
      ? normalizeDiaryPreludeStatus(draft.diaryPreludeStatus, {
          isNewDiaryDraft: false,
          prelude: diaryPrelude,
        })
      : "skipped",
    diaryPrelude,
  };
}

export function createMemoryDraftRepository(seed: Draft[] = []): IDraftRepository {
  const drafts = new Map<string, Draft>();

  for (const draft of seed) {
    drafts.set(draft.slotKey, cloneDraft(draft));
  }

  return {
    async save(draft) {
      drafts.set(draft.slotKey, cloneDraft(draft));
    },

    async getBySlotKey(slotKey) {
      const draft = drafts.get(slotKey);
      return draft ? cloneDraft(draft) : null;
    },

    async getAll() {
      return Array.from(drafts.values()).map(cloneDraft);
    },

    async deleteBySlotKey(slotKey) {
      drafts.delete(slotKey);
    },
  };
}
