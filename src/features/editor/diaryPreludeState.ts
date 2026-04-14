import { hasDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import type { EntryType } from "@/domain/entry/types";

type EditorMode = "edit" | "read";

export function shouldOpenDiaryPreludePicker(input: {
  entryType: EntryType;
  mode: EditorMode;
  diaryPreludeStatus: DiaryPreludeStatus | null | undefined;
  diaryPrelude: DiaryPreludeMeta | null | undefined;
}): boolean {
  return input.entryType === "diary"
    && input.mode === "edit"
    && normalizeDiaryPreludeStatus(input.diaryPreludeStatus, {
      isNewDiaryDraft: false,
      prelude: input.diaryPrelude,
    }) === "unseen";
}

// The prelude header meta (weather/mood chips) is a display element that is
// meaningful in both edit and read modes, so mode is intentionally not gated
// here. Edit access to the prelude is controlled separately by
// shouldAllowDiaryPreludeEdit.
export function shouldRenderDiaryPreludeHeaderMeta(
  diaryPreludeStatus: DiaryPreludeStatus | null | undefined,
  diaryPrelude: DiaryPreludeMeta | null | undefined,
): boolean {
  return normalizeDiaryPreludeStatus(diaryPreludeStatus, {
    isNewDiaryDraft: false,
    prelude: diaryPrelude,
  }) === "selected" && hasDiaryPrelude(diaryPrelude);
}

export function shouldAllowDiaryPreludeEdit(
  mode: EditorMode,
  diaryPreludeStatus: DiaryPreludeStatus | null | undefined,
): boolean {
  return mode === "edit"
    && normalizeDiaryPreludeStatus(diaryPreludeStatus, {
      isNewDiaryDraft: false,
    }) === "selected";
}
