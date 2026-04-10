import type { DraftType } from "./types";

export function buildDiaryDraftKey(recordDate: string): string {
  return `diary:${recordDate}`;
}

export function buildDraftSlotKey(
  type: DraftType,
  options: { recordDate?: string | null; linkedEntryId?: string | null } = {},
): string {
  if (type === "diary") {
    return buildDiaryDraftKey(options.recordDate ?? "unknown");
  }

  if (options.linkedEntryId) {
    return `${type}:${options.linkedEntryId}`;
  }

  return `${type}:default`;
}
