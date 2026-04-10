import type { EntryType } from "@/domain/entry/types";
import { buildDraftSlotKey } from "@/domain/draft/rules";
import type { Draft } from "@/domain/draft/types";
import { lockRecordDate } from "@/domain/time/rules";
import { nowIso } from "@/shared/utils/date";
import { createId } from "@/shared/utils/id";

export interface CreateDraftInput {
  type: EntryType;
  recordDate?: string | null;
  linkedEntryId?: string | null;
}

export function createDraft(input: CreateDraftInput): Draft {
  const recordDate = input.type === "diary" ? input.recordDate ?? lockRecordDate() : input.recordDate ?? null;
  const timestamp = nowIso();

  return {
    id: createId(),
    type: input.type,
    title: "",
    content: "",
    recordDate,
    slotKey: buildDraftSlotKey(input.type, {
      recordDate,
      linkedEntryId: input.linkedEntryId ?? null,
    }),
    linkedEntryId: input.linkedEntryId ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastBackgroundSavedAt: null,
  };
}

export function markDraftBackgroundSaved(draft: Draft): Draft {
  const timestamp = nowIso();

  return {
    ...draft,
    updatedAt: timestamp,
    lastBackgroundSavedAt: timestamp,
  };
}
