import type { Draft } from "@/domain/draft/types";
import type { IDraftRepository } from "@/data/repositories/draft.repository";

export function createMemoryDraftRepository(seed: Draft[] = []): IDraftRepository {
  const drafts = new Map<string, Draft>();

  for (const draft of seed) {
    drafts.set(draft.slotKey, draft);
  }

  return {
    async save(draft) {
      drafts.set(draft.slotKey, draft);
    },

    async getBySlotKey(slotKey) {
      return drafts.get(slotKey) ?? null;
    },

    async getAll() {
      return Array.from(drafts.values());
    },

    async deleteBySlotKey(slotKey) {
      drafts.delete(slotKey);
    },
  };
}
