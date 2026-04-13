<template>
  <DiaryPreludePicker
    v-if="entryType === 'diary' && isDiaryPreludePickerOpen"
    :initial-prelude="diaryPrelude"
    :can-skip="canSkipDiaryPrelude"
    @go-back="handleDiaryPreludePickerBack"
    @skip="handleDiaryPreludeSkip"
    @confirm="handleDiaryPreludeConfirm"
  />

  <DiaryEditorShell
    v-else-if="entryType === 'diary'"
    :mode="mode"
    :atmosphere-line="diaryAtmosphereLine"
    :headline-date="diaryHeadlineDate"
    :header-subtitle="diaryHeaderSubtitle"
    :header-time-label="diaryHeaderTime"
    :title="title"
    :title-placeholder="copy.editor.diaryTitlePlaceholder"
    :content="content"
    :body-placeholder="bodyPlaceholder"
    :saved-hint-label="copy.editor.savedHint"
    :error-message="errorMessage"
    :show-saved-hint="showSavedHint"
    :can-continue-write="canContinueWrite"
    :continue-write-label="copy.editor.continueWrite"
    :cursor-spacing="futureCursorSpacing"
    :writing-font-size-px="writingAppearance.fontSizePx"
    :writing-line-height-px="writingAppearance.lineHeightPx"
    :cursor-position="cursorPosition"
    :focus-end-request-key="focusEndRequestKey"
    :stamp-opacity="stampOpacity"
    :attachments="attachments"
    :focused-attachment-id="focusedAttachmentId"
    :diary-prelude-status="diaryPreludeStatus"
    :diary-prelude="diaryPrelude"
    @go-back="handleGoBack"
    @formal-save="handleFormalSave"
    @continue-write="handleContinueWrite"
    @title-input="handleTitleInput"
    @content-input="handleContentInput"
    @pick-images="handlePickImages"
    @remove-attachment="handleRemoveAttachment"
    @preview-attachment="handlePreviewAttachment"
    @edit-diary-prelude="openDiaryPreludePicker"
    @focus-end-request="handleFocusEndRequest"
    @content-selection-change="handleContentSelectionChange"
    @editor-focus="handleEditorFocus"
    @editor-blur="handleEditorBlur"
  />

  <JottingEditorShell
    v-else-if="entryType === 'jotting'"
    :mode="mode"
    :eyebrow-label="copy.editor.jottingEyebrow"
    :headline-date="jottingHeadlineDate"
    :title="title"
    :title-placeholder="copy.editor.jottingTitlePlaceholder"
    :content="content"
    :body-placeholder="bodyPlaceholder"
    :read-title="readTitle"
    :read-meta="readMeta"
    :can-continue-write="canContinueWrite"
    :continue-write-label="copy.editor.continueWrite"
    :signature-line="copy.editor.jottingSignature"
    :cursor-spacing="cursorSpacing"
    :writing-font-size-px="writingAppearance.fontSizePx"
    :writing-line-height-px="writingAppearance.lineHeightPx"
    :cursor-position="cursorPosition"
    :focus-end-request-key="focusEndRequestKey"
    :stamp-opacity="stampOpacity"
    :attachments="attachments"
    :focused-attachment-id="focusedAttachmentId"
    @go-back="handleGoBack"
    @formal-save="handleFormalSave"
    @continue-write="handleContinueWrite"
    @title-input="handleTitleInput"
    @content-input="handleContentInput"
    @pick-images="handlePickImages"
    @remove-attachment="handleRemoveAttachment"
    @preview-attachment="handlePreviewAttachment"
    @focus-end-request="handleFocusEndRequest"
    @content-selection-change="handleContentSelectionChange"
    @editor-focus="handleEditorFocus"
    @editor-blur="handleEditorBlur"
  />

  <FutureLetterEditorShell
    v-else
    :entry-type="entryType"
    :mode="mode"
    :paper-date-display="paperDateDisplay"
    :paper-subline="paperSubline"
    :future-unlock-label="copy.editor.futureUnlockLabel"
    :future-date-label="futureDateLabel"
    :future-hint="futureHint"
    :show-future-unlock-ribbon="showFutureUnlockRibbon"
    :pending-unlock-date="pendingUnlockDate"
    :is-future-date-sheet-open="isFutureDateSheetOpen"
    :future-picker-month-label="futurePickerMonthLabel"
    :future-picker-week-labels="futurePickerWeekLabels"
    :future-picker-days="futurePickerDays"
    :future-quick-date-options="futureQuickDateOptions"
    :content="content"
    :body-placeholder="bodyPlaceholder"
    :read-title="readTitle"
    :read-meta="readMeta"
    :continue-write-label="copy.editor.continueWrite"
    :future-sheet-title="copy.editor.futureSheetTitle"
    :future-sheet-copy="copy.editor.futureSheetCopy"
    :future-sheet-skip-label="copy.editor.futureSheetSkip"
    :future-sheet-confirm-label="copy.editor.futureSheetConfirm"
    :saved-hint-label="copy.editor.savedHint"
    :error-message="errorMessage"
    :show-saved-hint="showSavedHint"
    :can-continue-write="canContinueWrite"
    :cursor-spacing="cursorSpacing"
    :writing-font-size-px="writingAppearance.fontSizePx"
    :writing-line-height-px="writingAppearance.lineHeightPx"
    :show-paper-lines="settingsStore.futureLetterPaperLinesEnabled"
    :status-bar-height="statusBarHeight"
    :safe-area-bottom="safeAreaBottom"
    :keyboard-height="keyboardHeight"
    :keyboard-visible="keyboardVisible"
    :window-height="windowHeight"
    :topbar-top="topbarTop"
    :attachment-dock-bottom="attachmentDockBottom"
    :min-line-gap-to-keyboard="futureMinLineGapToKeyboard"
    :restore-after-keyboard-hide="restoreAfterKeyboardHide"
    :cursor-position="cursorPosition"
    :focus-end-request-key="focusEndRequestKey"
    :stamp-opacity="stampOpacity"
    :attachments="attachments"
    :focused-attachment-id="focusedAttachmentId"
    @go-back="handleGoBack"
    @formal-save="handleFormalSave"
    @continue-write="handleContinueWrite"
    @content-input="handleContentInput"
    @pick-images="handlePickImages"
    @remove-attachment="handleRemoveAttachment"
    @preview-attachment="handlePreviewAttachment"
    @open-future-date-sheet="openFutureDateSheet"
    @close-future-date-sheet="closeFutureDateSheet"
    @pick-future-date="handlePickFutureDate"
    @prev-future-picker-month="handlePrevFuturePickerMonth"
    @next-future-picker-month="handleNextFuturePickerMonth"
    @confirm-future-date="handleConfirmFutureDate"
    @focus-end-request="handleFocusEndRequest"
    @content-selection-change="handleContentSelectionChange"
    @editor-focus="handleEditorFocus"
    @editor-blur="handleEditorBlur"
  />

  <PaperConfirmDialog
    :open="isDestroyDraftDialogOpen"
    :title="copy.editor.destroyTitle"
    :copy="copy.editor.destroyCopy"
    :actions="destroyDraftDialogActions"
    @close="resolveDestroyDraftDialog(false)"
    @action="handleDestroyDraftDialogAction"
  />

  <PaperOptionSheet
    :open="isImageSourceSheetOpen"
    :title="copy.editor.imageSourceTitle"
    :copy="copy.editor.imageSourceCopy"
    :options="imageSourceSheetOptions"
    :cancel-text="copy.home.cancel"
    @close="closeImageSourceSheet"
    @select="handleImageSourceSelect"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { onHide, onLoad, onUnload } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useDraftStore } from "@/app/store/useDraftStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import type { Draft } from "@/domain/draft/types";
import type { Entry, EntryType } from "@/domain/entry/types";
import { isValidFutureLetterDate, lockRecordDate } from "@/domain/time/rules";
import { addMonth, formatDate, getDaysInMonth, getFirstDayOfWeek, nowIso, tomorrowDate } from "@/shared/utils/date";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import { resolveDraftSaveAction } from "@/domain/services/entryService";
import { resolveDiaryEntryOpenTarget } from "@/domain/services/editorService";
import { useEditorAutosave } from "@/features/editor/composables/useEditorAutosave";
import { useEditorFeedbackState } from "@/features/editor/composables/useEditorFeedbackState";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { shouldResetFutureUnlockDate } from "@/features/editor/editorFutureDraft";
import { useEditorImageAttachments } from "@/features/editor/composables/useEditorImageAttachments";
import { useEditorImagePicker } from "@/features/editor/composables/useEditorImagePicker";
import { shouldAllowDiaryPreludeEdit, shouldOpenDiaryPreludePicker } from "@/features/editor/diaryPreludeState";
import { resolveEditorWritingAppearance } from "@/features/editor/editorAppearance";
import { clearDraftShadow, readDraftShadow, writeDraftShadow } from "@/features/editor/draftShadow";
import { resolveEditorLiveSpacing } from "@/features/editor/futureEditorLayout";
import { normalizeEditorInput, resolveEditorInitialContent } from "@/features/editor/editorInputRules";
import DiaryEditorShell from "@/features/editor/components/DiaryEditorShell.vue";
import DiaryPreludePicker from "@/features/editor/components/DiaryPreludePicker.vue";
import JottingEditorShell from "@/features/editor/components/JottingEditorShell.vue";
import FutureLetterEditorShell from "@/features/editor/components/FutureLetterEditorShell.vue";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import PaperOptionSheet, { type PaperOptionSheetOption } from "@/shared/ui/PaperOptionSheet.vue";
import { t } from "@/shared/i18n";

type EditorMode = "edit" | "read";
type EditorInputEvent = Event | { detail?: { value?: string; cursor?: number } };

const CHINESE_YEAR_DIGITS: Record<string, string> = {
  "0": "零",
  "1": "一",
  "2": "二",
  "3": "三",
  "4": "四",
  "5": "五",
  "6": "六",
  "7": "七",
  "8": "八",
  "9": "九",
};

const settingsStore = useSettingsStore();
const draftStore = useDraftStore();
const entryStore = useEntryStore();
const copy = computed(() => t(settingsStore.locale));
const imagePicker = useEditorImagePicker();
const {
  attachments,
  replaceAttachments,
  appendAttachments,
  removeAttachment,
  clearAttachments,
  previewAttachments,
} = useEditorImageAttachments();

const entryType = ref<EntryType>("diary");
const recordDate = ref(lockRecordDate());
const mode = ref<EditorMode>("edit");
const title = ref("");
const content = ref("");
const diaryPreludeStatus = ref<DiaryPreludeStatus>("skipped");
const diaryPrelude = ref<DiaryPreludeMeta | null>(null);
const unlockDate = ref("");
const pendingUnlockDate = ref("");
const futurePickerMonth = ref(tomorrowDate());
const savedEntry = ref<Entry | null>(null);
const focusedAttachmentId = ref("");
const isHydrating = ref(false);
const isFutureDateSheetOpen = ref(false);
const isDiaryPreludePickerOpen = ref(false);
const diaryPreludePickerOrigin = ref<"auto" | "manual">("auto");
const isDestroyDraftDialogOpen = ref(false);
const isImageSourceSheetOpen = ref(false);
const futureHint = ref("");
const cursorPosition = ref(0);
const contentSelectionCursor = ref(0);
const focusEndRequestKey = ref(0);
let destroyDraftDialogResolver: ((confirmed: boolean) => void) | null = null;

const { showSavedHint, stampOpacity, markDirty, markSaved, reset: resetFeedback } = useEditorFeedbackState();
const {
  statusBarHeight,
  safeAreaBottom,
  keyboardHeight,
  keyboardVisible,
  cursorSpacing,
  topbarTop,
  attachmentDockBottom,
  minLineGapToKeyboard,
  restoreAfterKeyboardHide,
  windowHeight,
} = useEditorKeyboardViewport();
const autosave = useEditorAutosave({
  delayMs: 2200,
  onSave: async () => {
    if (mode.value !== "edit" || isHydrating.value || !draftStore.activeDraft) {
      return;
    }

    try {
      await persistDraftNow();
      markSaved();
    } catch {
      // Keep autosave silent; the page can surface subtle error text if needed.
    }
  },
});

const errorMessage = computed(() => draftStore.error ?? entryStore.error);
const canContinueWrite = computed(() => Boolean(savedEntry.value && savedEntry.value.type !== "future"));
const canSkipDiaryPrelude = computed(() => entryType.value === "diary" && mode.value === "edit" && diaryPreludeStatus.value === "unseen");
const canEditDiaryPrelude = computed(() => shouldAllowDiaryPreludeEdit(mode.value, diaryPreludeStatus.value));
const paperDateDisplay = computed(() =>
  mode.value === "read" && savedEntry.value?.savedAt
    ? formatDate(savedEntry.value.savedAt, settingsStore.locale === "en-US" ? "MMM DD, YYYY" : "YYYY年 · M月 · D日")
    : formatDate(recordDate.value, settingsStore.locale === "en-US" ? "MMM DD, YYYY" : "YYYY年 · M月 · D日"),
);
const paperSubline = computed(() => {
  if (entryType.value === "future" && unlockDate.value) {
    return settingsStore.locale === "en-US"
      ? `UNSEALING ON ${formatDate(unlockDate.value, "YYYY.MM.DD")}`
      : `将在 ${formatDate(unlockDate.value, "YYYY.MM.DD")} 启封`;
  }

  return mode.value === "read" ? copy.value.editor.futureReadSubline : copy.value.editor.futureEditSubline;
});
const futureDateLabel = computed(() =>
  unlockDate.value
    ? formatDate(unlockDate.value, settingsStore.locale === "en-US" ? "MMM DD, YYYY" : "YYYY年MM月DD日")
    : copy.value.editor.futureDateEmpty,
);
const showFutureUnlockRibbon = computed(() =>
  entryType.value === "future" && mode.value === "edit" && Boolean(unlockDate.value),
);
const futurePickerWeekLabels = computed(() =>
  settingsStore.locale === "en-US"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["日", "一", "二", "三", "四", "五", "六"],
);
const futurePickerMonthLabel = computed(() =>
  formatDate(futurePickerMonth.value, settingsStore.locale === "en-US" ? "MMMM YYYY" : "YYYY年 MM月"),
);
const futureQuickDateOptions = computed(() => {
  const tomorrow = tomorrowDate();
  const inOneWeek = addDays(tomorrow, 6);
  const inOneMonth = addMonth(tomorrow, 1);

  return [
    { label: settingsStore.locale === "en-US" ? "Tomorrow" : "明天", value: tomorrow },
    { label: settingsStore.locale === "en-US" ? "In a week" : "一周后", value: inOneWeek },
    { label: settingsStore.locale === "en-US" ? "In a month" : "一月后", value: inOneMonth },
  ];
});
const futurePickerDays = computed(() => {
  const firstDay = getFirstDayOfWeek(futurePickerMonth.value);
  const daysInMonth = getDaysInMonth(futurePickerMonth.value);
  const yearMonth = formatDate(futurePickerMonth.value, "YYYY-MM");
  const minimumDate = tomorrowDate();
  const cells: Array<{ key: string; date: number | null; fullDate: string; selectable: boolean }> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({
      key: `empty-${i}`,
      date: null,
      fullDate: "",
      selectable: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${yearMonth}-${String(day).padStart(2, "0")}`;
    cells.push({
      key: fullDate,
      date: day,
      fullDate,
      selectable: fullDate >= minimumDate,
    });
  }

  return cells;
});
const bodyPlaceholder = computed(() => {
  if (entryType.value === "future") {
    return copy.value.editor.futurePlaceholder;
  }

  return entryType.value === "jotting" ? copy.value.editor.jottingPlaceholder : copy.value.editor.diaryPlaceholder;
});
const readTitle = computed(() => {
  if (entryType.value === "future") {
    return savedEntry.value?.title ?? copy.value.editor.futureLabel;
  }

  return savedEntry.value?.title ?? "";
});
const readMeta = computed(() => {
  if (!savedEntry.value) {
    return "";
  }

  if (savedEntry.value.type === "future" && savedEntry.value.unlockDate) {
    const openedAt = savedEntry.value.unlockedAt ?? savedEntry.value.unlockDate;
    return `${copy.value.editor.futureReadMetaPrefix}${formatDate(openedAt, settingsStore.locale === "en-US" ? "MMM DD, YYYY" : "YYYY年MM月DD日")}`;
  }

  return `${copy.value.editor.diaryRecordedAtPrefix}${formatDate(savedEntry.value.recordDate, settingsStore.locale === "en-US" ? "MMM DD, YYYY" : "YYYY年MM月DD日")}`;
});
const diaryAtmosphereLine = computed(() =>
  settingsStore.locale === "en-US"
    ? `${resolveSeason(recordDate.value, settingsStore.locale)} · ${formatDate(recordDate.value, "YYYY")}`
    : `${toChineseYear(recordDate.value)} · ${resolveSeason(recordDate.value, settingsStore.locale)}`,
);
const diaryHeadlineDate = computed(() => formatDate(recordDate.value, settingsStore.locale === "en-US" ? "MMM DD" : "M月D日"));
const diaryHeaderSubtitle = computed(() => copy.value.editor.diaryHeaderSubtitle);
const diaryHeaderTime = computed(() =>
  formatDate(savedEntry.value?.savedAt ?? draftStore.activeDraft?.updatedAt ?? nowIso(), "HH:mm"),
);
const destroyDraftDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "cancel",
    title: copy.value.editor.destroyCancel,
    tone: "muted",
  },
  {
    key: "confirm",
    title: copy.value.editor.destroyConfirm,
    tone: "danger",
  },
]));
const imageSourceSheetOptions = computed<PaperOptionSheetOption[]>(() => ([
  {
    key: "album",
    title: copy.value.editor.imageFromAlbum,
    copy: copy.value.editor.imageFromAlbumCopy,
    trailingIcon: "chevron-right",
  },
  {
    key: "camera",
    title: copy.value.editor.imageFromCamera,
    copy: copy.value.editor.imageFromCameraCopy,
    trailingIcon: "chevron-right",
  },
]));
const jottingHeadlineDate = computed(() => formatDate(recordDate.value, settingsStore.locale === "en-US" ? "MMM DD" : "M月D日"));
const writingAppearance = computed(() => resolveEditorWritingAppearance(entryType.value, settingsStore.writingPreset));
const futureCursorSpacing = computed(() =>
  resolveEditorLiveSpacing(
    Math.max(cursorSpacing.value, writingAppearance.value.lineHeightPx),
    writingAppearance.value.lineHeightPx,
  ),
);
const futureMinLineGapToKeyboard = computed(() =>
  resolveEditorLiveSpacing(
    Math.max(minLineGapToKeyboard.value, writingAppearance.value.lineHeightPx),
    writingAppearance.value.lineHeightPx,
  ),
);

function toChineseYear(dateString: string): string {
  return dateString
    .slice(0, 4)
    .split("")
    .map((digit) => CHINESE_YEAR_DIGITS[digit] ?? digit)
    .join("") + "年";
}

function resolveSeason(dateString: string, locale = "zh-CN"): string {
  const month = Number(dateString.slice(5, 7));

  if (month >= 3 && month <= 5) {
    return locale === "en-US" ? "Spring" : "春";
  }

  if (month >= 6 && month <= 8) {
    return locale === "en-US" ? "Summer" : "夏";
  }

  if (month >= 9 && month <= 11) {
    return locale === "en-US" ? "Autumn" : "秋";
  }

  return locale === "en-US" ? "Winter" : "冬";
}

function addDays(dateString: string, value: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + value);
  return formatDate(date, "YYYY-MM-DD");
}

function extractInputValue(event: Event | { detail?: { value?: string } }): string {
  const detailValue =
    "detail" in event && typeof event.detail?.value === "string" ? event.detail.value : undefined;

  if (typeof detailValue === "string") {
    return detailValue;
  }

  const target = (event as { target?: HTMLInputElement | HTMLTextAreaElement | null }).target;
  return target?.value ?? "";
}

function extractInputCursor(event: EditorInputEvent): number | null {
  const detailCursor = "detail" in event && typeof event.detail?.cursor === "number"
    ? event.detail.cursor
    : null;

  return detailCursor;
}

function normalizeEntryType(rawType?: string): EntryType {
  if (rawType === "jotting" || rawType === "future") {
    return rawType;
  }

  return "diary";
}

function resolveRequestedRecordDate(query?: Record<string, unknown>): string {
  const routeDate = typeof query?.recordDate === "string"
    ? query.recordDate
    : typeof query?.date === "string"
      ? query.date
      : null;

  return routeDate && routeDate.trim() ? routeDate : lockRecordDate();
}

function syncFormFromEntry(entry: Entry): void {
  title.value = entry.title ?? "";
  content.value = entry.content;
  recordDate.value = entry.recordDate;
  diaryPrelude.value = cloneDiaryPrelude(entry.diaryPrelude);
  diaryPreludeStatus.value = entry.type === "diary"
    ? normalizeDiaryPreludeStatus(entry.diaryPreludeStatus, {
        isNewDiaryDraft: false,
        prelude: diaryPrelude.value,
      })
    : "skipped";
  unlockDate.value = entry.type === "future" ? entry.unlockDate ?? "" : "";
  pendingUnlockDate.value = unlockDate.value;
  futureHint.value = "";
  replaceAttachments(entry.attachments ?? []);
  resetFeedback();
  cursorPosition.value = content.value.length;
  contentSelectionCursor.value = content.value.length;
}

function syncFormFromDraft(): void {
  const draft = draftStore.activeDraft;
  if (!draft) {
    return;
  }

  title.value = draft.title;
  content.value = resolveEditorInitialContent(draft.type, draft.content);
  recordDate.value = draft.recordDate ?? lockRecordDate();
  diaryPrelude.value = cloneDiaryPrelude(draft.diaryPrelude);
  diaryPreludeStatus.value = draft.type === "diary"
    ? normalizeDiaryPreludeStatus(draft.diaryPreludeStatus, {
        isNewDiaryDraft: false,
        prelude: diaryPrelude.value,
      })
    : "skipped";
  unlockDate.value = draft.type === "future" ? draft.unlockDate ?? "" : "";
  pendingUnlockDate.value = unlockDate.value;
  futureHint.value = "";
  replaceAttachments(draft.attachments ?? []);
  resetFeedback();
  cursorPosition.value = content.value.length;
  contentSelectionCursor.value = content.value.length;
}

function returnToHome(): void {
  uni.reLaunch({
    url: `/${ROUTES.home}`,
  });
}

async function focusAttachmentInReadMode(): Promise<void> {
  if (mode.value !== "read" || !focusedAttachmentId.value) {
    return;
  }

  await nextTick();

  setTimeout(() => {
    uni.pageScrollTo({
      selector: `#entry-attachment-${focusedAttachmentId.value}`,
      duration: 0,
      fail: () => undefined,
    });
  }, 40);
}

function handleGoBack(): void {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.home}`,
  });
}

function syncDiaryPreludePresentation(): void {
  const shouldOpen = shouldOpenDiaryPreludePicker({
    entryType: entryType.value,
    mode: mode.value,
    diaryPreludeStatus: diaryPreludeStatus.value,
    diaryPrelude: diaryPrelude.value,
  });

  isDiaryPreludePickerOpen.value = shouldOpen;
  if (shouldOpen) {
    diaryPreludePickerOrigin.value = "auto";
  }
}

function openDiaryPreludePicker(): void {
  if (entryType.value !== "diary" || !canEditDiaryPrelude.value) {
    return;
  }

  diaryPreludePickerOrigin.value = "manual";
  isDiaryPreludePickerOpen.value = true;
}

function handleDiaryPreludePickerBack(): void {
  if (diaryPreludePickerOrigin.value === "manual") {
    isDiaryPreludePickerOpen.value = false;
    diaryPreludePickerOrigin.value = "auto";
    return;
  }

  handleGoBack();
}

async function handleDiaryPreludeSkip(): Promise<void> {
  if (!canSkipDiaryPrelude.value) {
    return;
  }

  try {
    diaryPreludeStatus.value = "skipped";
    diaryPrelude.value = null;
    isDiaryPreludePickerOpen.value = false;
    diaryPreludePickerOrigin.value = "auto";
    await persistDraftNow();
    markSaved();
    requestBodyFocusIfNeeded();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : copy.value.editor.preludeSkipFailed,
      icon: "none",
    });
  }
}

async function handleDiaryPreludeConfirm(nextPrelude: DiaryPreludeMeta): Promise<void> {
  try {
    diaryPreludeStatus.value = "selected";
    diaryPrelude.value = cloneDiaryPrelude(nextPrelude);
    isDiaryPreludePickerOpen.value = false;
    diaryPreludePickerOrigin.value = "auto";
    await persistDraftNow();
    markSaved();
    requestBodyFocusIfNeeded();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : copy.value.editor.preludeSaveFailed,
      icon: "none",
    });
  }
}

async function normalizeFutureDraftIfExpired(): Promise<void> {
  const draft = draftStore.activeDraft;
  if (!draft || draft.type !== "future" || !draft.unlockDate) {
    return;
  }

  if (!shouldResetFutureUnlockDate(draft.unlockDate)) {
    return;
  }

  unlockDate.value = "";
  pendingUnlockDate.value = "";
  futureHint.value = copy.value.editor.futureHintExpired;

  await draftStore.saveActiveDraft({
    title: title.value,
    content: content.value,
    unlockDate: null,
    attachments: attachments.value,
  });
}

async function openCurrentDraft(): Promise<void> {
  isHydrating.value = true;

  try {
    await draftStore.openDraft({
      type: entryType.value,
      recordDate: entryType.value === "diary" ? recordDate.value : undefined,
    });

    mode.value = "edit";
    savedEntry.value = null;
    syncFormFromDraft();
    await hydrateDraftFromShadow();
    await normalizeFutureDraftIfExpired();
    syncDiaryPreludePresentation();
    requestBodyFocusIfNeeded();
  } finally {
    isHydrating.value = false;
  }
}

function buildCurrentDraftSnapshot(): Draft | null {
  const draft = draftStore.activeDraft;

  if (!draft || mode.value !== "edit") {
    return null;
  }

  return {
    ...draft,
    title: title.value,
    content: content.value,
    recordDate: recordDate.value,
    unlockDate: entryType.value === "future" ? unlockDate.value || null : null,
    attachments: attachments.value,
    diaryPreludeStatus: diaryPreludeStatus.value,
    diaryPrelude: cloneDiaryPrelude(diaryPrelude.value),
    updatedAt: nowIso(),
  };
}

function writeDraftShadowSnapshot(): void {
  const snapshot = buildCurrentDraftSnapshot();

  if (!snapshot) {
    return;
  }

  writeDraftShadow(snapshot);
}

async function hydrateDraftFromShadow(): Promise<void> {
  const draft = draftStore.activeDraft;

  if (!draft) {
    return;
  }

  const shadow = readDraftShadow(draft.slotKey);
  if (!shadow) {
    return;
  }

  const hasShadowChanges =
    shadow.updatedAt > draft.updatedAt
    || shadow.content !== draft.content
    || shadow.title !== draft.title
    || JSON.stringify(shadow.attachments ?? []) !== JSON.stringify(draft.attachments ?? [])
    || shadow.unlockDate !== draft.unlockDate
    || shadow.diaryPreludeStatus !== draft.diaryPreludeStatus
    || JSON.stringify(shadow.diaryPrelude ?? null) !== JSON.stringify(draft.diaryPrelude ?? null);

  if (!hasShadowChanges) {
    clearDraftShadow(draft.slotKey);
    return;
  }

  title.value = shadow.title;
  content.value = resolveEditorInitialContent(entryType.value, shadow.content);
  recordDate.value = shadow.recordDate ?? recordDate.value;
  unlockDate.value = entryType.value === "future" ? shadow.unlockDate ?? "" : "";
  pendingUnlockDate.value = unlockDate.value;
  replaceAttachments(shadow.attachments ?? []);
  diaryPreludeStatus.value = shadow.diaryPreludeStatus;
  diaryPrelude.value = cloneDiaryPrelude(shadow.diaryPrelude);
  cursorPosition.value = content.value.length;
  contentSelectionCursor.value = content.value.length;

  await persistDraftNow();
  resetFeedback();
}

async function openEntryForRead(entryId: string): Promise<void> {
  isHydrating.value = true;

  try {
    const entry = await entryStore.fetchEntryById(entryId);

    if (!entry) {
      throw new Error(entryStore.error ?? "Failed to load entry");
    }

    entryType.value = entry.type;
    savedEntry.value = entry;
    mode.value = "read";
    isDiaryPreludePickerOpen.value = false;
    draftStore.setActiveDraftKey(null);
    syncFormFromEntry(entry);
    await focusAttachmentInReadMode();
  } finally {
    isHydrating.value = false;
  }
}

async function initializeFromRoute(query?: Record<string, unknown>): Promise<void> {
  entryType.value = normalizeEntryType(typeof query?.type === "string" ? query.type : undefined);
  recordDate.value = resolveRequestedRecordDate(query);
  diaryPreludeStatus.value = "skipped";
  diaryPrelude.value = null;
  unlockDate.value = "";
  pendingUnlockDate.value = "";
  focusedAttachmentId.value = typeof query?.attachmentId === "string" ? query.attachmentId : "";
  isDiaryPreludePickerOpen.value = false;
  diaryPreludePickerOrigin.value = "auto";
  clearAttachments();

  if (query?.mode === "read" && typeof query.entryId === "string" && query.entryId.trim()) {
    await openEntryForRead(query.entryId);
    return;
  }

  if (entryType.value === "diary") {
    const draft = await draftStore.peekDraft({
      type: "diary",
      recordDate: recordDate.value,
    });
    await entryStore.fetchEntriesByDate(recordDate.value);

    const target = resolveDiaryEntryOpenTarget({
      draft,
      entries: entryStore.entryList.filter((entry) => entry.recordDate === recordDate.value),
      recordDate: recordDate.value,
    });

    if (target.kind === "entry") {
      await openEntryForRead(target.entryId);
      return;
    }
  }

  await openCurrentDraft();
}

async function persistDraftNow(): Promise<void> {
  if (!draftStore.activeDraft) {
    return;
  }

  await draftStore.saveActiveDraft({
    title: title.value,
    content: content.value,
    diaryPreludeStatus: diaryPreludeStatus.value,
    diaryPrelude: diaryPrelude.value,
    unlockDate: entryType.value === "future" ? unlockDate.value : null,
    attachments: attachments.value,
  });
  clearDraftShadow(draftStore.activeDraft.slotKey);
}

function queueDraftSave(): void {
  if (isHydrating.value || mode.value !== "edit") {
    return;
  }

  markDirty();
  autosave.schedule();
}

function handleContentInput(event: EditorInputEvent): void {
  const normalized = normalizeEditorInput({
    entryType: entryType.value,
    previousValue: content.value,
    nextValue: extractInputValue(event),
    cursor: extractInputCursor(event) ?? contentSelectionCursor.value,
  });

  content.value = normalized.value;
  contentSelectionCursor.value = normalized.cursor;
  cursorPosition.value = normalized.cursor;
  queueDraftSave();
}

function handleTitleInput(event: Event | { detail?: { value?: string } }): void {
  title.value = extractInputValue(event);
  queueDraftSave();
}

function handleContentSelectionChange(cursor: number): void {
  contentSelectionCursor.value = cursor;
  cursorPosition.value = cursor;
}

function handleEditorFocus(cursor: number): void {
  handleContentSelectionChange(cursor);
}

function handleEditorBlur(): void {
  cursorPosition.value = contentSelectionCursor.value;
}

function handleFocusEndRequest(): void {
  const endCursor = content.value.length;
  contentSelectionCursor.value = endCursor;
  cursorPosition.value = endCursor;
  focusEndRequestKey.value += 1;
}

function requestBodyFocusIfNeeded(): void {
  if (mode.value !== "edit" || entryType.value === "future") {
    return;
  }

  if (entryType.value === "diary" && isDiaryPreludePickerOpen.value) {
    return;
  }

  nextTick(() => {
    handleFocusEndRequest();
  });
}

function handleUnlockDateInput(event: Event | { detail?: { value?: string } }): void {
  pendingUnlockDate.value = extractInputValue(event);
}

function openFutureDateSheet(): void {
  pendingUnlockDate.value = unlockDate.value;
  futurePickerMonth.value = pendingUnlockDate.value || tomorrowDate();
  isFutureDateSheetOpen.value = true;
}

function closeFutureDateSheet(): void {
  isFutureDateSheetOpen.value = false;
}

function handlePickFutureDate(value: string): void {
  pendingUnlockDate.value = value;
}

function handlePrevFuturePickerMonth(): void {
  futurePickerMonth.value = addMonth(futurePickerMonth.value, -1);
}

function handleNextFuturePickerMonth(): void {
  futurePickerMonth.value = addMonth(futurePickerMonth.value, 1);
}

function handlePickImages(): void {
  if (mode.value !== "edit" || !draftStore.activeDraft) {
    return;
  }

  isImageSourceSheetOpen.value = true;
}

async function handleImageSourceSelect(sourceKey: string): Promise<void> {
  if (mode.value !== "edit" || !draftStore.activeDraft) {
    closeImageSourceSheet();
    return;
  }

  const sourceType = sourceKey === "camera" ? "camera" : "album";
  closeImageSourceSheet();

  try {
    const pickedAttachments = await imagePicker.pickImages({
      draftKey: draftStore.activeDraft.slotKey,
      startSortOrder: attachments.value.length,
      sourceType,
    });

    if (!pickedAttachments.length) {
      return;
    }

    appendAttachments(pickedAttachments);
    await persistDraftNow();
    markSaved();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : copy.value.editor.imageInsertFailed,
      icon: "none",
    });
  }
}

async function handleRemoveAttachment(attachmentId: string): Promise<void> {
  if (mode.value !== "edit") {
    return;
  }

  removeAttachment(attachmentId);
  await persistDraftNow();
  markSaved();
}

function handlePreviewAttachment(attachmentId: string): void {
  previewAttachments(attachmentId);
}

async function handleConfirmFutureDate(): Promise<void> {
  if (!pendingUnlockDate.value || !isValidFutureLetterDate(pendingUnlockDate.value)) {
    uni.showToast({
      title: copy.value.editor.invalidFutureDate,
      icon: "none",
    });
    return;
  }

  unlockDate.value = pendingUnlockDate.value;
  await persistDraftNow();
  markSaved();
  futureHint.value = "";
  closeFutureDateSheet();
  await handleFormalSave();
}

function openDestroyDraftDialog(): Promise<boolean> {
  isDestroyDraftDialogOpen.value = true;

  return new Promise<boolean>((resolve) => {
    destroyDraftDialogResolver = resolve;
  });
}

function resolveDestroyDraftDialog(confirmed: boolean): void {
  isDestroyDraftDialogOpen.value = false;
  destroyDraftDialogResolver?.(confirmed);
  destroyDraftDialogResolver = null;
}

function handleDestroyDraftDialogAction(actionKey: string): void {
  resolveDestroyDraftDialog(actionKey === "confirm");
}

function closeImageSourceSheet(): void {
  isImageSourceSheetOpen.value = false;
}

async function handleDestroyLinkedEntryDraft(): Promise<void> {
  const draft = draftStore.activeDraft;
  if (!draft?.linkedEntryId) {
    return;
  }

  const confirmed = await openDestroyDraftDialog();

  if (!confirmed) {
    return;
  }

  await entryStore.destroyEntry(draft.linkedEntryId);
  await draftStore.removeDraft(draft.slotKey);

  uni.showToast({
    title: copy.value.editor.destroyed,
    icon: "none",
  });
  returnToHome();
}

async function handleFormalSave(): Promise<void> {
  try {
    await autosave.flush();
    const action = draftStore.activeDraft ? resolveDraftSaveAction(draftStore.activeDraft) : "discard-empty";

    if (action === "discard-empty") {
      const slotKey = draftStore.activeDraft?.slotKey;
      if (slotKey) {
        await draftStore.removeDraft(slotKey);
      }
      returnToHome();
      return;
    }

    if (action === "keep-draft") {
      await persistDraftNow();
      markSaved();
      uni.showToast({
        title: copy.value.editor.keepDraft,
        icon: "none",
      });
      returnToHome();
      return;
    }

    if (action === "pick-future-date") {
      openFutureDateSheet();
      return;
    }

    if (action === "destroy-entry") {
      await handleDestroyLinkedEntryDraft();
      return;
    }

    const entry = await draftStore.saveActiveDraftAsEntry();

    if (!entry) {
      throw new Error(draftStore.error ?? copy.value.editor.saveFailed);
    }

    savedEntry.value = entry;
    mode.value = "read";
    diaryPreludeStatus.value = entry.diaryPreludeStatus;
    diaryPrelude.value = cloneDiaryPrelude(entry.diaryPrelude);
    isDiaryPreludePickerOpen.value = false;
    diaryPreludePickerOrigin.value = "auto";
    futureHint.value = "";
    replaceAttachments(entry.attachments ?? []);
    resetFeedback();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : copy.value.editor.saveFailed,
      icon: "none",
    });
  }
}

async function handleContinueWrite(): Promise<void> {
  if (!savedEntry.value || savedEntry.value.type === "future") {
    return;
  }

  try {
    const draft = await draftStore.resumeEntry(savedEntry.value.id);

    if (!draft) {
      throw new Error(draftStore.error ?? "Failed to resume entry");
    }

    syncFormFromDraft();
    savedEntry.value = null;
    mode.value = "edit";
    syncDiaryPreludePresentation();
    futureHint.value = "";
    requestBodyFocusIfNeeded();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : copy.value.editor.resumeFailed,
      icon: "none",
    });
  }
}

onLoad((query) => {
  void initializeFromRoute(query);
});

onHide(() => {
  writeDraftShadowSnapshot();
  void autosave.flush();
});

onUnload(() => {
  writeDraftShadowSnapshot();
  void autosave.flush();
});
</script>
