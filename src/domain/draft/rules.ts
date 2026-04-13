import type { DraftType } from "./types";
import { DRAFT_KEYS } from "@/shared/constants/draftKeys";

export function buildDiaryDraftKey(recordDate: string): string {
  return DRAFT_KEYS.diary(recordDate);
}

export function buildDraftSlotKey(
  type: DraftType,
  options: { recordDate?: string | null; linkedEntryId?: string | null } = {},
): string {
  if (type === "diary") {
    return buildDiaryDraftKey(options.recordDate ?? "unknown");
  }

  if (type === "future") {
    return DRAFT_KEYS.FUTURE;
  }

  return DRAFT_KEYS.JOTTING;
}
