import { canPersistEntry } from "@/domain/entry/rules";
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

export async function destroyEntry(entry: Entry, options: DestroyEntryOptions = {}): Promise<Entry> {
  if (options.cleanupHook) {
    await options.cleanupHook(entry);
  }

  return {
    ...entry,
    destroyedAt: nowIso(),
  };
}
