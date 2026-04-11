import { canPersistEntry } from "@/domain/entry/rules";
import { cloneDiaryPrelude, hasDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";
import type { Draft } from "@/domain/draft/types";
import type { Entry, EntryType } from "@/domain/entry/types";
import { lockRecordDate } from "@/domain/time/rules";
import { nowIso } from "@/shared/utils/date";
import { createId } from "@/shared/utils/id";
import { normalizeAttachments } from "@/domain/entry/rules";
import type { Attachment } from "@/shared/types/attachment";

export interface CreateEntryInput {
  type: EntryType;
  title?: string;
  content?: string;
  recordDate?: string;
  unlockDate?: string | null;
  attachments?: Attachment[];
  diaryPreludeStatus?: Draft["diaryPreludeStatus"];
  diaryPrelude?: Draft["diaryPrelude"];
}

export interface DestroyEntryOptions {
  cleanupHook?: (entry: Entry) => Promise<void> | void;
}

export type DraftSaveAction = "save-entry" | "discard-empty" | "destroy-entry" | "pick-future-date" | "keep-draft";

export function deriveEntryTitle(content: string, maxLength = 13): string | null {
  const firstLine = content
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return null;
  }

  return firstLine.slice(0, maxLength);
}

export function deriveImageOnlyEntryTitle(type: EntryType): string {
  if (type === "future") {
    return "图片未来信";
  }

  return type === "jotting" ? "图片随笔" : "图片日记";
}

export function createEntry(input: CreateEntryInput): Entry {
  const createdAt = nowIso();
  const diaryPrelude = cloneDiaryPrelude(input.diaryPrelude);

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
    attachments: normalizeAttachments(input.attachments),
    diaryPreludeStatus: input.type === "diary"
      ? normalizeDiaryPreludeStatus(input.diaryPreludeStatus, {
          isNewDiaryDraft: false,
          prelude: diaryPrelude,
        })
      : "skipped",
    diaryPrelude,
  };
}

export function shouldSaveEntry(input: Pick<Entry, "title" | "content">): boolean {
  return canPersistEntry(input);
}

export function resolveDraftSaveAction(
  draft: Pick<Draft, "type" | "title" | "content" | "linkedEntryId" | "unlockDate" | "diaryPreludeStatus" | "diaryPrelude" | "attachments">,
): DraftSaveAction {
  if (draft.type === "future" && canPersistEntry(draft) && !draft.unlockDate) {
    return "pick-future-date";
  }

  if (canPersistEntry(draft)) {
    return "save-entry";
  }

  if (
    draft.type === "diary"
    && normalizeDiaryPreludeStatus(draft.diaryPreludeStatus, {
      isNewDiaryDraft: false,
      prelude: draft.diaryPrelude,
    }) === "selected"
    && hasDiaryPrelude(draft.diaryPrelude)
  ) {
    return "keep-draft";
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
  const entryId = draft.linkedEntryId ?? createId();
  const attachments = normalizeAttachments(draft.attachments).map((attachment, index) => ({
    ...attachment,
    draftKey: null,
    entryId,
    sortOrder: index,
  }));
  const derivedTitle = draft.title.trim()
    ? draft.title
    : deriveEntryTitle(draft.content) ?? deriveImageOnlyEntryTitle(draft.type);
  const diaryPrelude = cloneDiaryPrelude(draft.diaryPrelude);

  return {
    id: entryId,
    type: draft.type,
    status: draft.type === "future" ? "sealed" : "saved",
    title: derivedTitle,
    content: draft.content,
    recordDate: draft.recordDate ?? lockRecordDate(),
    createdAt: savedAt,
    updatedAt: savedAt,
    savedAt,
    unlockDate: draft.type === "future" ? draft.unlockDate ?? null : null,
    unlockedAt: null,
    destroyedAt: null,
    attachments,
    diaryPreludeStatus: draft.type === "diary"
      ? normalizeDiaryPreludeStatus(draft.diaryPreludeStatus, {
          isNewDiaryDraft: false,
          prelude: diaryPrelude,
        })
      : "skipped",
    diaryPrelude,
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
