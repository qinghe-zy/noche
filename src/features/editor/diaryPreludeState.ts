import { hasDiaryPrelude } from "@/domain/diaryPrelude/catalog";
import type { DiaryPreludeMeta } from "@/domain/diaryPrelude/types";
import type { EntryType } from "@/domain/entry/types";

type EditorMode = "edit" | "read";

export function shouldOpenDiaryPreludePicker(input: {
  entryType: EntryType;
  mode: EditorMode;
  diaryPrelude: DiaryPreludeMeta | null | undefined;
}): boolean {
  return input.entryType === "diary" && input.mode === "edit" && !hasDiaryPrelude(input.diaryPrelude);
}

export function shouldRenderDiaryPreludeInlineCard(
  mode: EditorMode,
  diaryPrelude: DiaryPreludeMeta | null | undefined,
): boolean {
  return mode === "edit" || hasDiaryPrelude(diaryPrelude);
}
