import type { EntryType } from "@/domain/entry/types";
import { buildDraftSlotKey } from "@/domain/draft/rules";

export { useDraftStore } from "./useDraftStore";

export function getDraftSlotKey(type: EntryType, recordDate?: string): string {
  return buildDraftSlotKey(type, { recordDate });
}
