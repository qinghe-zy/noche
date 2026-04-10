import { canPersistEntry } from "@/domain/entry/rules";
import type { Draft } from "@/domain/draft/types";
import type { Entry, EntryType } from "@/domain/entry/types";
import { lockRecordDate } from "@/domain/time/rules";
import { nowIso } from "@/shared/utils/date";
import { createId } from "@/shared/utils/id";

export interface CreateEntryInput {
  type: EntryType;
  title?: string;
  content?: string;
  recordDate?: string;
  unlockDate?: string | null;
}

export interface DestroyEntryOptions {
  cleanupHook?: (entry: Entry) => Promise<void> | void;
}

export type DraftSaveAction = "save-entry" | "discard-empty" | "destroy-entry";

export function createEntry(input: CreateEntryInput): Entry {
  const createdAt = nowIso();

  return {
    id: createId(),
    type: input.type,
    status: input.type === "future" ? "sealed" : "saved",
    title: input.title ?? null,
    content: input.content ?? "",
    recordDate: input.recordDate ?? lockRecordDate(),
    createdAt,
    updatedAt: createdAt,
    savedAt: null,
    unlockDate: input.unlockDate ?? null,
    unlockedAt: null,
    destroyedAt: null,
  };
}

export function shouldSaveEntry(input: Pick<Entry, "title" | "content">): boolean {
  return canPersistEntry(input);
}

export function resolveDraftSaveAction(draft: Pick<Draft, "title" | "content" | "linkedEntryId">): DraftSaveAction {
  if (canPersistEntry(draft)) {
    return "save-entry";
  }

  return draft.linkedEntryId ? "destroy-entry" : "discard-empty";
}

export function createEntryFromDraft(draft: Draft): Entry {
  if (!canPersistEntry(draft)) {
    throw new Error("Cannot save an empty draft.");
  }

  if (draft.type === "future" && !draft.unlockDate) {
    throw new Error("Future drafts require unlockDate before saving.");
  }

  const savedAt = nowIso();

  return {
    id: draft.linkedEntryId ?? createId(),
    type: draft.type,
    status: draft.type === "future" ? "sealed" : "saved",
    title: draft.title.trim() ? draft.title : null,
    content: draft.content,
    recordDate: draft.recordDate ?? lockRecordDate(),
    createdAt: savedAt,
    updatedAt: savedAt,
    savedAt,
    unlockDate: draft.type === "future" ? draft.unlockDate ?? null : null,
    unlockedAt: null,
    destroyedAt: null,
  };
}

export async function destroyEntry(entry: Entry, options: DestroyEntryOptions = {}): Promise<Entry> {
  if (options.cleanupHook) {
    await options.cleanupHook(entry);
  }

  return {
    ...entry,
    destroyedAt: nowIso(),
  };
}
