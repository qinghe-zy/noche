import { canPersistEntry } from "@/domain/entry/rules";
import type { Entry, EntryType, FutureLetterStatus } from "@/domain/entry/types";
import { isFutureUnlockable, lockRecordDate } from "@/domain/time/rules";
import { nowIso } from "@/shared/utils/date";
import { createId } from "@/shared/utils/id";

export interface CreateEntryInput {
  type: EntryType;
  title?: string;
  content?: string;
  recordDate?: string;
  futureUnlockDate?: string | null;
}

export interface DestroyEntryOptions {
  cleanupHook?: (entry: Entry) => Promise<void> | void;
}

export function createEntry(input: CreateEntryInput): Entry {
  const createdAt = nowIso();
  const futureStatus: FutureLetterStatus | null =
    input.type === "future-letter" && input.futureUnlockDate
      ? isFutureUnlockable(input.futureUnlockDate)
        ? "unlockable"
        : "locked"
      : null;

  return {
    id: createId(),
    type: input.type,
    title: input.title ?? "",
    content: input.content ?? "",
    recordDate: input.recordDate ?? lockRecordDate(),
    createdAt,
    updatedAt: createdAt,
    futureUnlockDate: input.futureUnlockDate ?? null,
    futureStatus,
    destroyedAt: null,
  };
}

export function shouldSaveEntry(input: Pick<Entry, "title" | "content">): boolean {
  return canPersistEntry(input);
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
