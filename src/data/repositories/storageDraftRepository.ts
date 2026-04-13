import type { IDraftRepository } from "@/data/repositories/draft.repository";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";
import type { Draft } from "@/domain/draft/types";
import type { JsonStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "noche.drafts.v1";

function readDraftMap(storage: JsonStorage): Record<string, Draft> {
  const raw = storage.getString(STORAGE_KEY);
  return raw ? JSON.parse(raw) as Record<string, Draft> : {};
}

function writeDraftMap(storage: JsonStorage, drafts: Record<string, Draft>): void {
  storage.setString(STORAGE_KEY, JSON.stringify(drafts));
}

function normalizeDraft(draft: Draft): Draft {
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

export function createStorageDraftRepository(storage: JsonStorage): IDraftRepository {
  return {
    async save(draft) {
      const drafts = readDraftMap(storage);
      drafts[draft.slotKey] = normalizeDraft(draft);
      writeDraftMap(storage, drafts);
    },
    async getBySlotKey(slotKey) {
      const draft = readDraftMap(storage)[slotKey];
      return draft ? normalizeDraft(draft) : null;
    },
    async getAll() {
      return Object.values(readDraftMap(storage)).map(normalizeDraft);
    },
    async deleteBySlotKey(slotKey) {
      const drafts = readDraftMap(storage);
      delete drafts[slotKey];
      writeDraftMap(storage, drafts);
    },
  };
}
