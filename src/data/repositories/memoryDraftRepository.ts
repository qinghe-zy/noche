import type { Draft } from "@/domain/draft/types";
import type { IDraftRepository } from "@/data/repositories/draft.repository";

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
      });
    },

    async getBySlotKey(slotKey) {
      const draft = drafts.get(slotKey);
      return draft
        ? {
            ...draft,
            attachments: draft.attachments ? [...draft.attachments] : [],
          }
        : null;
    },

    async getAll() {
      return Array.from(drafts.values()).map((draft) => ({
        ...draft,
        attachments: draft.attachments ? [...draft.attachments] : [],
      }));
    },

    async deleteBySlotKey(slotKey) {
      drafts.delete(slotKey);
    },
  };
}
