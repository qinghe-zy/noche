<template>
  <view class="editor-page" :class="[themeClass, `editor-page--${entryType}`]">
    <view class="editor-page__paper-noise"></view>

    <view class="editor-page__canvas">
      <view class="editor-page__paper-surface">
        <view class="editor-page__fixed-layer">
          <view class="editor-page__topbar">
            <view class="editor-page__topbar-inner" :style="topbarInnerStyle">
              <TopbarIconButton @tap="$emit('go-back')" />

              <view
                v-if="mode === 'edit'"
                class="editor-page__topbar-button editor-page__topbar-button--action"
                @tap="$emit('formal-save')"
              >
                <text v-if="showSavedHint" class="editor-page__saved-hint">{{ savedHintLabel }}</text>
                <AppIcon name="mail" class="editor-page__topbar-svg" />
              </view>
              <view
                v-else-if="canContinueWrite"
                class="editor-page__topbar-button editor-page__topbar-button--continue"
                @tap="$emit('continue-write')"
              >
                {{ continueWriteLabel }}
              </view>
              <view v-else class="editor-page__topbar-spacer"></view>
            </view>
          </view>

          <view class="editor-page__meta">
            <view class="editor-page__meta-row">
              <text class="editor-page__meta-date literary-text">{{ paperDateDisplay }}</text>
              <view
                v-if="showImageAction"
                class="editor-page__meta-image-button"
                @tap="$emit('pick-images')"
              >
                <AppIcon name="image" class="editor-page__meta-image-icon" />
              </view>
            </view>
            <text class="editor-page__meta-subtitle">{{ paperSubline }}</text>
          </view>

          <view v-if="errorMessage" class="editor-page__notice editor-page__notice--error">
            <text>{{ errorMessage }}</text>
          </view>

          <view v-if="showFutureUnlockRibbon" class="editor-page__future-ribbon">
            <text class="editor-page__future-ribbon-label">{{ futureUnlockLabel }}</text>
            <view class="editor-page__future-ribbon-copy">
              <view class="editor-page__future-ribbon-value" @tap="$emit('open-future-date-sheet')">
                {{ futureDateLabel }}
              </view>
              <text v-if="futureHint" class="editor-page__future-ribbon-hint">{{ futureHint }}</text>
            </view>
          </view>

          <view v-if="attachments.length" class="editor-page__attachments">
            <view
              v-for="attachment in attachments"
              :key="attachment.id"
              class="editor-page__attachment-card"
              :class="{ 'editor-page__attachment-card--focused': focusedAttachmentId === attachment.id }"
              :id="`entry-attachment-${attachment.id}`"
              @click="$emit('preview-attachment', attachment.id)"
            >
              <image class="editor-page__attachment-image" :src="attachment.localUri" mode="aspectFill" />
              <view
                v-if="mode === 'edit'"
                class="editor-page__attachment-remove"
                @tap.stop="$emit('remove-attachment', attachment.id)"
              >
                <AppIcon name="close" class="editor-page__attachment-remove-svg" />
              </view>
            </view>
          </view>
        </view>

        <view class="editor-page__interactive-layer">
          <scroll-view
            v-if="mode === 'edit'"
            class="editor-page__writing-scroll"
            scroll-y
            :scroll-top="writingScrollTopBinding"
            :scroll-with-animation="scrollWithAnimation"
            @scroll="handleWritingScroll"
          >
            <view class="editor-page__writing-stage editor-page__writing-lines" :style="writingStageStyle">
              <textarea
                class="editor-page__textarea literary-text"
                :value="content"
                :focus="textareaFocused"
                :cursor="localCursorPosition"
                adjust-position="false"
                disable-default-padding
              maxlength="-1"
              :cursor-spacing="cursorSpacing"
              :show-confirm-bar="false"
              :placeholder="bodyPlaceholder"
              placeholder-class="editor-page__placeholder"
              :style="textareaStyle"
              @tap.stop="handleTextareaTap"
              @input="handleInput"
              @focus="handleFocus"
              @blur="handleBlur"
                @linechange="handleLineChange"
              />
              <view class="editor-page__blank-spacer" :style="blankSpacerStyle" @tap="handleBlankAreaFocus"></view>
            </view>
          </scroll-view>

          <view v-else class="editor-page__writing-area editor-page__writing-area--read">
            <view class="editor-page__read-header">
              <text class="editor-page__read-headline">{{ readTitle }}</text>
              <text class="editor-page__read-meta">{{ readMeta }}</text>
            </view>
            <text class="editor-page__read-content editor-page__writing-lines literary-text" :style="writingTextStyle">{{ content }}</text>
          </view>
        </view>

        <view v-if="mode === 'read'" class="editor-page__watermark" :style="{ opacity: stampOpacity }">N.</view>
        <view v-else class="editor-page__seal" :style="{ opacity: stampOpacity }">
          <svg class="editor-page__signature-svg" viewBox="0 0 120 120" aria-hidden="true">
            <rect x="0" y="0" width="120" height="120" fill="currentColor" opacity="0.12" />
            <path
              d="M18 86 C26 62, 33 40, 40 28 C42 25, 45 25, 47 28 C48 30, 48 34, 48 44 L48 84 C48 87, 50 88, 52 84 C58 72, 64 58, 73 40 C75 36, 78 35, 80 38 C82 41, 82 47, 82 58 L82 84 M24 68 C31 72, 39 78, 48 84 M58 74 C66 79, 74 83, 82 84 M92 84 L104 84"
              fill="none"
              stroke="currentColor"
              stroke-width="4.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </view>
      </view>
    </view>

    <view
      v-if="isFutureDateSheetOpen"
      class="editor-page__sheet-mask"
      @click="$emit('close-future-date-sheet')"
    >
      <view class="editor-page__date-sheet" @click.stop>
        <text class="editor-page__sheet-title">{{ futureSheetTitle }}</text>
        <text class="editor-page__sheet-copy">{{ futureSheetCopy }}</text>
        <view class="editor-page__sheet-calendar-head">
          <view class="editor-page__sheet-calendar-nav" @tap="$emit('prev-future-picker-month')">
            <AppIcon name="chevron-left" class="editor-page__sheet-calendar-nav-icon" />
          </view>
          <text class="editor-page__sheet-calendar-month">{{ futurePickerMonthLabel }}</text>
          <view class="editor-page__sheet-calendar-nav" @tap="$emit('next-future-picker-month')">
            <AppIcon name="chevron-right" class="editor-page__sheet-calendar-nav-icon" />
          </view>
        </view>
        <view class="editor-page__date-chip-row">
          <view
            v-for="option in futureQuickDateOptions"
            :key="option.value"
            class="editor-page__date-chip"
            :class="{ 'editor-page__date-chip--active': option.value === pendingUnlockDate }"
            @tap="$emit('pick-future-date', option.value)"
          >
            {{ option.label }}
          </view>
        </view>
        <view class="editor-page__date-weekdays">
          <text v-for="weekday in futurePickerWeekLabels" :key="weekday" class="editor-page__date-weekday">{{ weekday }}</text>
        </view>
        <view class="editor-page__date-grid">
          <view
            v-for="day in futurePickerDays"
            :key="day.key"
            class="editor-page__date-cell"
            :class="{
              'editor-page__date-cell--empty': !day.date,
              'editor-page__date-cell--disabled': day.date && !day.selectable,
              'editor-page__date-cell--selected': day.date && day.fullDate === pendingUnlockDate,
            }"
            @tap="day.date && day.selectable && $emit('pick-future-date', day.fullDate)"
          >
            <text v-if="day.date" class="editor-page__date-cell-text">{{ day.date }}</text>
          </view>
        </view>
        <view class="editor-page__sheet-actions">
          <view class="editor-page__sheet-button editor-page__sheet-button--secondary" @tap="$emit('close-future-date-sheet')">{{ futureSheetSkipLabel }}</view>
          <view class="editor-page__sheet-button editor-page__sheet-button--primary" @tap="$emit('confirm-future-date')">{{ futureSheetConfirmLabel }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { Attachment } from "@/shared/types/attachment";
import type { EntryType } from "@/domain/entry/types";
import {
  DEFAULT_EDITOR_LINE_HEIGHT_PX,
  resolveInteractiveLayerHeight,
  rpxToPx,
} from "@/features/editor/composables/useEditorKeyboardViewport";
import { useDeferredKeyboardViewportSync } from "@/features/editor/composables/useDeferredKeyboardViewportSync";
import {
  estimateEditorCaretLineBottom,
  estimateEditorContentHeight,
  resolveCaretAwareScrollTop,
  resolveTapCaretLineBottom,
} from "@/features/editor/editorCaretLayout";
import {
  reconcileFutureMeasuredHeight,
  resolveFutureScrollViewportHeight,
  shouldApplyFuturePropCursorSync,
  shouldPreserveFutureCaretAnchor,
  type FutureContentChangeDirection,
} from "@/features/editor/futureEditorLayout";
import { useThemeClass } from "@/shared/theme";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";
type TextareaInputPayload = { value?: string; cursor?: number };
type TextareaFocusPayload = { cursor?: number };
type TextareaLineChangePayload = { height?: number };
type ScrollEventPayload = { scrollTop?: number };
type DeferredKeyboardViewportPayload = {
  nextContentHeight: number;
  force: boolean;
  animate: boolean;
};
type QueryRect = {
  height?: number | null;
  width?: number | null;
  top?: number | null;
};

const PAPER_SURFACE_HORIZONTAL_PADDING_RPX = 32;
const WRITING_STAGE_HORIZONTAL_PADDING_PX = 8;
const MIN_RENDERED_WRITING_LINES = 2;

const props = defineProps<{
  entryType: EntryType;
  mode: EditorMode;
  paperDateDisplay: string;
  paperSubline: string;
  futureUnlockLabel: string;
  futureDateLabel: string;
  futureHint: string;
  showFutureUnlockRibbon: boolean;
  pendingUnlockDate: string;
  isFutureDateSheetOpen: boolean;
  futurePickerMonthLabel: string;
  futurePickerWeekLabels: string[];
  futurePickerDays: Array<{
    key: string;
    date: number | null;
    fullDate: string;
    selectable: boolean;
  }>;
  futureQuickDateOptions: Array<{ label: string; value: string }>;
  content: string;
  bodyPlaceholder: string;
  readTitle: string;
  readMeta: string;
  continueWriteLabel: string;
  futureSheetTitle: string;
  futureSheetCopy: string;
  futureSheetSkipLabel: string;
  futureSheetConfirmLabel: string;
  savedHintLabel: string;
  errorMessage: string | null;
  showSavedHint: boolean;
  canContinueWrite: boolean;
  showImageAction: boolean;
  cursorSpacing: number;
  writingFontSizePx: number;
  writingLineHeightPx: number;
  showPaperLines: boolean;
  statusBarHeight: number;
  safeAreaBottom: number;
  keyboardVisible: boolean;
  visibleWindowHeight: number;
  topbarTop: number;
  minLineGapToKeyboard: number;
  restoreAfterKeyboardHide: number;
  cursorPosition: number;
  focusEndRequestKey: number;
  stampOpacity: number;
  attachments: Attachment[];
  focusedAttachmentId?: string;
}>();

const emit = defineEmits<{
  (event: "go-back"): void;
  (event: "formal-save"): void;
  (event: "continue-write"): void;
  (event: "content-input", payload: { detail?: TextareaInputPayload }): void;
  (event: "remove-attachment", attachmentId: string): void;
  (event: "preview-attachment", attachmentId: string): void;
  (event: "pick-images"): void;
  (event: "open-future-date-sheet"): void;
  (event: "close-future-date-sheet"): void;
  (event: "pick-future-date", value: string): void;
  (event: "prev-future-picker-month"): void;
  (event: "next-future-picker-month"): void;
  (event: "confirm-future-date"): void;
  (event: "focus-end-request"): void;
  (event: "content-selection-change", cursor: number): void;
  (event: "editor-focus", cursor: number): void;
  (event: "editor-blur"): void;
}>();

function resolveScreenWidth(): number {
  if (typeof uni === "undefined" || typeof uni.getSystemInfoSync !== "function") {
    return 375;
  }

  return Math.max(uni.getSystemInfoSync().screenWidth || 375, 320);
}

function normalizeContentHeight(height: number, lineHeightPx: number): number {
  const normalizedLineCount = Math.max(Math.ceil(height / lineHeightPx), 1);
  return normalizedLineCount * lineHeightPx;
}

const instance = getCurrentInstance();
const themeClass = useThemeClass();
const fixedLayerHeight = ref(Math.max(props.topbarTop + rpxToPx(112, resolveScreenWidth()), 140));
const writingStageWidth = ref(0);
const writingScrollTop = ref(0);
const isProgrammaticWritingScroll = ref(false);
const programmaticWritingScrollTop = ref<number | null>(null);
const textareaFocused = ref(false);
const localCursorPosition = ref(props.cursorPosition);
const caretAnchorCursorPosition = ref(props.cursorPosition);
const scrollWithAnimation = ref(false);
const resolvedScreenWidth = ref(resolveScreenWidth());
const latestEstimatedContentHeight = ref(props.writingLineHeightPx);
const measuredContentHeight = ref(props.writingLineHeightPx);
const lastContentChangeDirection = ref<FutureContentChangeDirection>("same");
const bodyViewportHeight = ref(0);
const bodyViewportTop = ref(0);
const pendingTapCaretLineBottom = ref<number | null>(null);

let writingScrollTimer: ReturnType<typeof setTimeout> | null = null;

const topbarInnerStyle = computed(() => ({
  paddingTop: `${props.topbarTop}px`,
}));

const interactiveLayerHeight = computed(() =>
  resolveInteractiveLayerHeight(props.visibleWindowHeight, fixedLayerHeight.value, 220),
);

const paperInnerWidth = computed(() =>
  Math.max(
    resolvedScreenWidth.value - rpxToPx(PAPER_SURFACE_HORIZONTAL_PADDING_RPX, resolvedScreenWidth.value) * 2,
    props.writingFontSizePx * 6,
  ),
);

const estimatedContentWidth = computed(() => {
  if (writingStageWidth.value > 0) {
    return Math.max(writingStageWidth.value - WRITING_STAGE_HORIZONTAL_PADDING_PX * 2, props.writingFontSizePx * 6);
  }

  return Math.max(paperInnerWidth.value - WRITING_STAGE_HORIZONTAL_PADDING_PX * 2, props.writingFontSizePx * 6);
});

const caretLineBottom = computed(() =>
  estimateEditorCaretLineBottom({
    content: props.content,
    cursor: caretAnchorCursorPosition.value,
    availableWidth: estimatedContentWidth.value,
    fontSizePx: props.writingFontSizePx,
    lineHeightPx: props.writingLineHeightPx,
  }),
);

const renderWritingHeight = computed(() =>
  Math.max(
    measuredContentHeight.value + props.writingLineHeightPx,
    props.writingLineHeightPx * MIN_RENDERED_WRITING_LINES,
  ),
);

const writingScrollTopBinding = computed(() => programmaticWritingScrollTop.value);

const writingStageStyle = computed(() => ({
  minHeight: `${interactiveLayerHeight.value}px`,
  paddingBottom: `${props.minLineGapToKeyboard + props.safeAreaBottom}px`,
  "--editor-paper-line-height": `${props.writingLineHeightPx}px`,
  backgroundImage: props.showPaperLines
    ? `repeating-linear-gradient(to bottom, transparent, transparent ${props.writingLineHeightPx - 6}px, color-mix(in srgb, var(--border-subtle, rgba(177, 179, 171, 0.18)) 74%, transparent) ${props.writingLineHeightPx - 6}px, color-mix(in srgb, var(--border-subtle, rgba(177, 179, 171, 0.18)) 74%, transparent) ${props.writingLineHeightPx - 4}px, transparent ${props.writingLineHeightPx - 4}px, transparent ${props.writingLineHeightPx}px)`
    : "none",
}));

const blankSpacerStyle = computed(() => ({
  minHeight: `${Math.max(Math.round(interactiveLayerHeight.value - renderWritingHeight.value), 0)}px`,
}));

const textareaStyle = computed(() => ({
  height: `${renderWritingHeight.value}px`,
  fontSize: `${props.writingFontSizePx}px`,
  lineHeight: `${props.writingLineHeightPx}px`,
  "--editor-writing-font-size": `${props.writingFontSizePx}px`,
  "--editor-writing-line-height": `${props.writingLineHeightPx}px`,
  "--editor-paper-line-height": `${props.writingLineHeightPx}px`,
}));
const writingTextStyle = computed(() => ({
  fontSize: `${props.writingFontSizePx}px`,
  lineHeight: `${props.writingLineHeightPx}px`,
  "--editor-writing-font-size": `${props.writingFontSizePx}px`,
  "--editor-writing-line-height": `${props.writingLineHeightPx}px`,
  "--editor-paper-line-height": `${props.writingLineHeightPx}px`,
  backgroundImage: props.showPaperLines
    ? `repeating-linear-gradient(to bottom, transparent, transparent ${props.writingLineHeightPx - 6}px, color-mix(in srgb, var(--border-subtle, rgba(177, 179, 171, 0.18)) 74%, transparent) ${props.writingLineHeightPx - 6}px, color-mix(in srgb, var(--border-subtle, rgba(177, 179, 171, 0.18)) 74%, transparent) ${props.writingLineHeightPx - 4}px, transparent ${props.writingLineHeightPx - 4}px, transparent ${props.writingLineHeightPx}px)`
    : "none",
}));

const {
  pendingKeyboardViewportSync,
  deferKeyboardViewportSync,
  requestKeyboardViewportSync: queueKeyboardViewportSync,
  flushPendingKeyboardViewportSync: takePendingKeyboardViewportSync,
  resetKeyboardViewportSync,
} = useDeferredKeyboardViewportSync<DeferredKeyboardViewportPayload>({
  keyboardVisible: computed(() => props.keyboardVisible),
  bodyViewportHeight,
  scheduleMeasurement: (flush) => {
    measureLayout(() => {
      flush();
    });
  },
});

function estimateContentHeight(content: string): number {
  return estimateEditorContentHeight({
    content,
    availableWidth: estimatedContentWidth.value,
    fontSizePx: props.writingFontSizePx,
    lineHeightPx: props.writingLineHeightPx,
  });
}

function applyVisualEstimate(nextContent: string, previousContent = nextContent): void {
  const estimatedHeight = estimateContentHeight(nextContent);

  lastContentChangeDirection.value = nextContent.length > previousContent.length
    ? "grow"
    : nextContent.length < previousContent.length
      ? "shrink"
      : "same";

  latestEstimatedContentHeight.value = estimatedHeight;
  measuredContentHeight.value = estimatedHeight;
  scrollWithAnimation.value = false;
}

function measureLayout(onComplete?: () => void): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (!publicInstance || typeof uni === "undefined" || typeof uni.createSelectorQuery !== "function") {
      onComplete?.();
      return;
    }

    uni
      .createSelectorQuery()
      .in(publicInstance)
      .select(".editor-page__fixed-layer")
      .boundingClientRect()
      .select(".editor-page__writing-scroll")
      .boundingClientRect()
      .select(".editor-page__writing-stage")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const [fixedLayerRect, writingScrollRect, writingStageRect] = results ?? [];
        const nextFixedLayerHeight = Math.max(fixedLayerRect?.height ?? 0, 0);
        const nextWritingStageWidth = Math.max(writingStageRect?.width ?? 0, 0);
        const shouldReestimateHeight = nextWritingStageWidth > 0 && nextWritingStageWidth !== writingStageWidth.value;

        fixedLayerHeight.value = nextFixedLayerHeight;

        if (typeof writingScrollRect?.height === "number") {
          bodyViewportHeight.value = Math.max(writingScrollRect.height, 0);
        }

        if (typeof writingScrollRect?.top === "number") {
          bodyViewportTop.value = writingScrollRect.top;
        }

        if (nextWritingStageWidth > 0) {
          writingStageWidth.value = nextWritingStageWidth;
        }

        if (shouldReestimateHeight) {
          applyVisualEstimate(props.content);
        }

        onComplete?.();
      });
  });
}

function setWritingScrollTop(nextScrollTop: number): void {
  if (nextScrollTop === writingScrollTop.value) {
    return;
  }

  writingScrollTop.value = nextScrollTop;
}

function clearWritingScrollTimer(): void {
  if (writingScrollTimer !== null) {
    clearTimeout(writingScrollTimer);
    writingScrollTimer = null;
  }
}

function setProgrammaticWritingScrollTop(nextScrollTop: number): void {
  clearWritingScrollTimer();
  isProgrammaticWritingScroll.value = true;
  programmaticWritingScrollTop.value = nextScrollTop;
  setWritingScrollTop(nextScrollTop);
  writingScrollTimer = setTimeout(() => {
    writingScrollTimer = null;
    isProgrammaticWritingScroll.value = false;
    programmaticWritingScrollTop.value = null;
  }, 120);
}

function syncWritingScroll(
  nextContentHeight = measuredContentHeight.value,
  options: {
    force?: boolean;
    animate?: boolean;
  } = {},
): void {
  const {
    force = false,
    animate = false,
  } = options;

  if (deferKeyboardViewportSync({
    nextContentHeight,
    force,
    animate,
  })) {
    return;
  }

  const preferredCaretLineBottom = pendingTapCaretLineBottom.value ?? caretLineBottom.value;
  const targetScrollTop = resolveCaretAwareScrollTop({
    caretLineBottom: Math.min(Math.max(preferredCaretLineBottom, props.writingLineHeightPx), nextContentHeight),
    viewportHeight: resolveFutureScrollViewportHeight(bodyViewportHeight.value, interactiveLayerHeight.value),
    minLineGapToKeyboard: props.minLineGapToKeyboard,
  });

  if (force || Math.abs(writingScrollTop.value - targetScrollTop) > 1) {
    scrollWithAnimation.value = animate;
    setProgrammaticWritingScrollTop(targetScrollTop);
    return;
  }

  pendingTapCaretLineBottom.value = null;
}

function requestKeyboardViewportSync(
  nextContentHeight = measuredContentHeight.value,
  options: {
    force?: boolean;
    animate?: boolean;
  } = {},
): void {
  queueKeyboardViewportSync({
    nextContentHeight,
    force: options.force ?? false,
    animate: options.animate ?? false,
  }, {
    prepare: () => {
      bodyViewportHeight.value = 0;
    },
  });
}

function flushPendingKeyboardViewportSync(): void {
  const payload = takePendingKeyboardViewportSync();
  if (!payload) {
    return;
  }

  syncWritingScroll(payload.nextContentHeight, {
    force: payload.force,
    animate: payload.animate,
  });
}

function handleTextareaTap(event: Event): void {
  const detail = readEventDetail<{ y?: number }>(event);
  pendingTapCaretLineBottom.value = resolveTapCaretLineBottom({
    tapClientY: detail?.y,
    viewportTop: bodyViewportTop.value,
    currentScrollTop: writingScrollTop.value,
    lineHeightPx: props.writingLineHeightPx,
  });
}

function readEventDetail<T>(event: Event): T | undefined {
  return (event as Event & { detail?: T }).detail;
}

function handleWritingScroll(event: Event): void {
  const detail = readEventDetail<ScrollEventPayload>(event);
  writingScrollTop.value = Math.max(detail?.scrollTop ?? 0, 0);

  if (!isProgrammaticWritingScroll.value) {
    programmaticWritingScrollTop.value = null;
  }
}

function handleInput(event: Event): void {
  const detail = readEventDetail<TextareaInputPayload>(event);
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : localCursorPosition.value;
  localCursorPosition.value = cursor;

  if (typeof detail?.cursor === "number") {
    caretAnchorCursorPosition.value = cursor;
  }

  emit("content-selection-change", cursor);
  emit("content-input", { detail });
}

function handleFocus(event: Event): void {
  const detail = readEventDetail<TextareaFocusPayload>(event);
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : localCursorPosition.value;
  textareaFocused.value = true;
  localCursorPosition.value = cursor;

  if (typeof detail?.cursor === "number") {
    caretAnchorCursorPosition.value = cursor;
  }

  emit("editor-focus", cursor);

  if (props.keyboardVisible) {
    requestKeyboardViewportSync();
  }
}

function handleBlur(): void {
  textareaFocused.value = false;
  pendingTapCaretLineBottom.value = null;
  resetKeyboardViewportSync();
  emit("editor-blur");
}

function handleLineChange(event: Event): void {
  const detail = readEventDetail<TextareaLineChangePayload>(event);
  if (typeof detail?.height !== "number") {
    return;
  }

  const normalizedRealHeight = normalizeContentHeight(detail.height, props.writingLineHeightPx);
  const currentMeasuredHeight = measuredContentHeight.value;
  const correctedHeight = reconcileFutureMeasuredHeight({
    estimatedHeight: latestEstimatedContentHeight.value,
    actualHeight: normalizedRealHeight,
    currentMeasuredHeight,
    lastContentChangeDirection: lastContentChangeDirection.value,
    lineHeightPx: props.writingLineHeightPx,
  });

  if (correctedHeight === currentMeasuredHeight) {
    return;
  }

  measuredContentHeight.value = correctedHeight;
  scrollWithAnimation.value = false;

  if (props.keyboardVisible) {
    syncWritingScroll(correctedHeight, {
      force: correctedHeight > currentMeasuredHeight,
      animate: false,
    });
  }
}

function handleBlankAreaFocus(): void {
  emit("focus-end-request");
}

applyVisualEstimate(props.content);

onMounted(() => {
  resolvedScreenWidth.value = resolveScreenWidth();
  applyVisualEstimate(props.content);
  measureLayout();
});

onBeforeUnmount(() => {
  clearWritingScrollTimer();
});

watch(
  () => [props.attachments.length, props.errorMessage, props.showFutureUnlockRibbon, props.mode],
  () => {
    measureLayout();
  },
);

watch(
  () => props.content,
  (nextContent, previousContent) => {
    applyVisualEstimate(nextContent, previousContent ?? nextContent);
  },
);

watch(
  () => props.focusEndRequestKey,
  () => {
    textareaFocused.value = true;
    localCursorPosition.value = props.content.length;
    caretAnchorCursorPosition.value = props.content.length;

    if (props.keyboardVisible) {
      requestKeyboardViewportSync();
    }
  },
);

watch(
  () => props.cursorPosition,
  (nextCursor) => {
    if (!shouldApplyFuturePropCursorSync({
      keyboardVisible: props.keyboardVisible,
      textareaFocused: textareaFocused.value,
    })) {
      return;
    }

    localCursorPosition.value = nextCursor;

    if (!shouldPreserveFutureCaretAnchor({
      keyboardVisible: props.keyboardVisible,
      textareaFocused: textareaFocused.value,
      pendingKeyboardViewportSync: pendingKeyboardViewportSync.value,
    })) {
      caretAnchorCursorPosition.value = nextCursor;
    }
  },
);

watch(
  () => [props.keyboardVisible, props.visibleWindowHeight],
  ([nextKeyboardVisible, nextVisibleWindowHeight], [previousKeyboardVisible, previousVisibleWindowHeight]) => {
    const keyboardVisibleChanged = nextKeyboardVisible !== previousKeyboardVisible;
    const visibleWindowHeightChanged = nextVisibleWindowHeight !== previousVisibleWindowHeight;

    if (!keyboardVisibleChanged && !visibleWindowHeightChanged) {
      return;
    }

    nextTick(() => {
      scrollWithAnimation.value = false;

      if (nextKeyboardVisible) {
        requestKeyboardViewportSync();
        return;
      }

      clearWritingScrollTimer();
      isProgrammaticWritingScroll.value = false;
      programmaticWritingScrollTop.value = null;
      resetKeyboardViewportSync();
      measureLayout();
    });
  },
);

watch(bodyViewportHeight, (nextHeight) => {
  if (nextHeight <= 0) {
    return;
  }

  flushPendingKeyboardViewportSync();
});
</script>

<style scoped>
.editor-page,
.editor-page * {
  box-sizing: border-box;
}

.editor-page {
  height: 100vh;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent-brand, #c96442) 14%, transparent), transparent 26%),
    radial-gradient(circle at top right, color-mix(in srgb, var(--surface-secondary, #e8e6dc) 42%, transparent), transparent 24%),
    var(--app-bg, var(--noche-bg));
  position: relative;
  overflow: hidden;
  font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif);
  color: var(--text-primary, var(--noche-text));
}

.editor-page__paper-noise { position: fixed; inset: 0; pointer-events: none; opacity: 0.03; background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.01) 100%); }
.literary-text { letter-spacing: 0.05em; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
.editor-page__canvas { padding: 0; display: flex; justify-content: stretch; width: 100%; height: 100%; }
.editor-page__paper-surface { width: 100%; max-width: none; height: 100vh; padding: 0 32rpx; background: linear-gradient(180deg, color-mix(in srgb, var(--surface-primary, #faf9f5) 98%, transparent), color-mix(in srgb, var(--surface-primary, #faf9f5) 90%, var(--surface-secondary, #e8e6dc) 10%)); border: none; box-shadow: none; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.editor-page__fixed-layer { position: relative; z-index: 2; flex: 0 0 auto; }
.editor-page__interactive-layer { position: relative; z-index: 1; flex: 1 1 auto; min-height: 0; }
.editor-page__topbar { width: 100%; margin-bottom: 10px; }
.editor-page__topbar-inner { width: 100%; padding: 0 0 24rpx; display: flex; align-items: center; justify-content: space-between; }
.editor-page__topbar-button { width: 88rpx; height: 88rpx; padding: 0; display: flex; align-items: center; justify-content: center; position: relative; color: var(--text-secondary, var(--noche-muted)); border: none; background: transparent; }
.editor-page__topbar-svg { width: 44rpx; height: 44rpx; color: currentColor; }
.editor-page__saved-hint { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif); font-size: 10px; letter-spacing: 2rpx; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__topbar-spacer { width: 88rpx; height: 88rpx; }
.editor-page__meta { margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; padding: 0 8px; }
.editor-page__meta-row { display: flex; align-items: center; justify-content: space-between; gap: 24rpx; }
.editor-page__meta-date { font-family: var(--font-heading, "Source Han Serif SC", "Noto Serif SC", "Songti SC", serif); font-size: 14px; letter-spacing: 0.25em; color: var(--text-primary, var(--noche-text)); }
.editor-page__meta-subtitle { font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif); font-size: 12px; letter-spacing: 0.32em; color: var(--text-secondary, var(--noche-muted)); text-transform: uppercase; }
.editor-page__meta-image-button { width: 48rpx; height: 48rpx; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__meta-image-icon { width: 28rpx; height: 28rpx; color: currentColor; }
.editor-page__notice { margin-bottom: 20rpx; font-size: 22rpx; line-height: 1.6; }
.editor-page__notice--error { color: var(--accent-brand, #c96442); }
.editor-page__future-ribbon { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1rpx solid var(--border-subtle, var(--noche-border)); }
.editor-page__future-ribbon-label,.editor-page__read-meta { font-size: 13px; letter-spacing: 0.12em; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__future-ribbon-value { color: var(--text-primary, var(--noche-text)); font-size: 14px; letter-spacing: 0.08em; }
.editor-page__future-ribbon-copy { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.editor-page__future-ribbon-hint { font-size: 12px; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__attachments { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; margin-bottom: 20rpx; padding: 0 8px; }
.editor-page__attachment-card { position: relative; width: 100%; aspect-ratio: 4 / 3; padding: 0; border-radius: 20rpx; overflow: hidden; background: var(--surface-secondary, var(--noche-panel)); border: 1px solid var(--border-subtle, var(--noche-border)); }
.editor-page__attachment-card--focused { box-shadow: var(--shadow-ring, 0 0 0 1px rgba(221, 212, 200, 0.72)); }
.editor-page__attachment-image { width: 100%; height: 100%; }
.editor-page__attachment-remove { position: absolute; top: 10rpx; right: 10rpx; width: 44rpx; height: 44rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; background: var(--surface-primary, var(--noche-surface)); }
.editor-page__attachment-remove-svg { width: 28rpx; height: 28rpx; color: var(--text-primary, var(--noche-text)); }
.editor-page__writing-scroll { height: 100%; }
.editor-page__writing-stage { min-height: 100%; padding: 0 8px; }
.editor-page__writing-lines { background-image: repeating-linear-gradient(to bottom, transparent, transparent calc(var(--editor-paper-line-height, 44px) - 6px), rgba(177, 179, 171, 0.18) calc(var(--editor-paper-line-height, 44px) - 6px), rgba(177, 179, 171, 0.18) calc(var(--editor-paper-line-height, 44px) - 4px), transparent calc(var(--editor-paper-line-height, 44px) - 4px), transparent var(--editor-paper-line-height, 44px)); background-size: 100% var(--editor-paper-line-height, 44px); }
.editor-page__textarea,.editor-page__read-content { width: 100%; border: none; background: transparent; color: var(--text-primary, var(--noche-text)); font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif); font-size: var(--editor-writing-font-size, 18px); line-height: var(--editor-writing-line-height, 44px); padding: 0; overflow-wrap: anywhere; }
.editor-page__textarea { transition: height 220ms ease-out; }
.editor-page__placeholder { color: var(--text-secondary, var(--noche-muted)); }
.editor-page__blank-spacer { width: 100%; }
.editor-page__writing-area { height: 100%; padding: 0 8px 120rpx; }
.editor-page__writing-area--read { overflow: hidden; }
.editor-page__read-header { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
.editor-page__read-headline { font-family: var(--font-heading, "Source Han Serif SC", "Noto Serif SC", "Songti SC", serif); font-size: 24px; line-height: 1.4; color: var(--text-primary, var(--noche-text)); }
.editor-page__read-content { white-space: pre-wrap; display: block; height: 100%; }
.editor-page__sheet-mask { position: fixed; inset: 0; z-index: 20; background: color-mix(in srgb, var(--text-primary, #141413) 24%, transparent); display: flex; align-items: flex-end; }
.editor-page__date-sheet { width: 100%; padding: 34rpx 28rpx 40rpx; background: var(--surface-primary, var(--noche-surface)); display: flex; flex-direction: column; gap: 18rpx; }
.editor-page__sheet-title { font-family: var(--font-heading, "Source Han Serif SC", "Noto Serif SC", "Songti SC", serif); font-size: 34rpx; color: var(--text-primary, var(--noche-text)); }
.editor-page__sheet-copy { font-size: 24rpx; line-height: 1.7; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__sheet-calendar-head { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.editor-page__sheet-calendar-nav { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__sheet-calendar-nav-icon { width: 28rpx; height: 28rpx; color: currentColor; }
.editor-page__sheet-calendar-month { font-family: var(--font-heading, "Source Han Serif SC", "Noto Serif SC", "Songti SC", serif); font-size: 24rpx; letter-spacing: 0.16em; color: var(--text-primary, var(--noche-text)); }
.editor-page__date-chip-row { display: flex; flex-wrap: wrap; gap: 12rpx; }
.editor-page__date-chip { min-height: 52rpx; padding: 0 18rpx; display: flex; align-items: center; justify-content: center; border-radius: 9999rpx; background: var(--surface-secondary, var(--noche-panel)); border: 1rpx solid var(--border-subtle, var(--noche-border)); color: var(--text-secondary, var(--noche-muted)); font-size: 22rpx; }
.editor-page__date-chip--active { background: var(--accent-brand, #c96442); color: var(--surface-primary, #faf9f5); border-color: var(--accent-brand, #c96442); }
.editor-page__date-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8rpx; }
.editor-page__date-weekday { text-align: center; font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif); font-size: 18rpx; letter-spacing: 0.14em; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__date-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10rpx; }
.editor-page__date-cell { min-height: 60rpx; display: flex; align-items: center; justify-content: center; border-radius: 18rpx; color: var(--text-secondary, var(--noche-muted)); }
.editor-page__date-cell--selected { background: color-mix(in srgb, var(--accent-brand, #c96442) 92%, transparent); color: var(--surface-primary, #faf9f5); }
.editor-page__date-cell--disabled { opacity: 0.34; }
.editor-page__date-cell-text { font-size: 24rpx; }
.editor-page__sheet-actions { display: flex; justify-content: space-between; gap: 16rpx; padding-top: 12rpx; }
.editor-page__sheet-button { flex: 1; min-height: 84rpx; font-size: 26rpx; display: flex; align-items: center; justify-content: center; }
.editor-page__sheet-button--primary { background: var(--accent-brand, #c96442); color: var(--surface-primary, #faf9f5); }
.editor-page__sheet-button--secondary { color: var(--text-primary, var(--noche-text)); border: 1rpx solid var(--border-subtle, var(--noche-border)); }
.editor-page__watermark { position: absolute; bottom: 20rpx; right: 40rpx; font-size: 180rpx; color: color-mix(in srgb, var(--text-secondary, #b0aea5) 38%, transparent); pointer-events: none; }
.editor-page__seal { position: absolute; right: 28rpx; bottom: 20rpx; pointer-events: none; }
.editor-page__signature-svg { width: 84rpx; height: 84rpx; color: color-mix(in srgb, var(--text-secondary, #b0aea5) 82%, transparent); }
.theme-dark.editor-page { background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-brand, #c96442) 16%, transparent), transparent 24%), radial-gradient(circle at top right, color-mix(in srgb, var(--surface-secondary, #1d1d1b) 72%, transparent), transparent 24%), var(--app-bg, var(--noche-bg)); }
.theme-dark .editor-page__paper-surface { background: linear-gradient(180deg, color-mix(in srgb, var(--surface-primary, #30302e) 94%, transparent), color-mix(in srgb, var(--surface-primary, #30302e) 82%, var(--app-bg, #141413) 18%)); }
.theme-dark .editor-page__topbar-button,.theme-dark .editor-page__meta-date,.theme-dark .editor-page__read-headline,.theme-dark .editor-page__future-ribbon-value,.theme-dark .editor-page__sheet-title,.theme-dark .editor-page__sheet-calendar-month,.theme-dark .editor-page__sheet-button--secondary,.theme-dark .editor-page__textarea,.theme-dark .editor-page__read-content { color: var(--text-primary, var(--noche-text)); }
.theme-dark .editor-page__meta-subtitle,.theme-dark .editor-page__future-ribbon-label,.theme-dark .editor-page__read-meta,.theme-dark .editor-page__future-ribbon-hint,.theme-dark .editor-page__saved-hint,.theme-dark .editor-page__date-weekday,.theme-dark .editor-page__placeholder { color: var(--text-secondary, var(--noche-muted)); }
.theme-dark .editor-page__meta-image-button { color: var(--text-secondary, var(--noche-muted)); }
.theme-dark .editor-page__future-ribbon { border-bottom-color: color-mix(in srgb, var(--border-subtle, #30302e) 78%, transparent); }
.theme-dark .editor-page__attachment-card { background: color-mix(in srgb, var(--surface-secondary, #1d1d1b) 88%, transparent); }
.theme-dark .editor-page__attachment-remove { background: color-mix(in srgb, var(--surface-primary, #30302e) 92%, transparent); }
.theme-dark .editor-page__attachment-remove-svg,.theme-dark .editor-page__topbar-svg,.theme-dark .editor-page__sheet-calendar-nav-icon { color: var(--text-primary, var(--noche-text)); }
.theme-dark .editor-page__writing-lines { background-image: repeating-linear-gradient(to bottom, transparent, transparent calc(var(--editor-paper-line-height, 44px) - 6px), color-mix(in srgb, var(--border-subtle, #30302e) 84%, transparent) calc(var(--editor-paper-line-height, 44px) - 6px), color-mix(in srgb, var(--border-subtle, #30302e) 84%, transparent) calc(var(--editor-paper-line-height, 44px) - 4px), transparent calc(var(--editor-paper-line-height, 44px) - 4px), transparent var(--editor-paper-line-height, 44px)); }
.theme-dark .editor-page__date-chip,.theme-dark .editor-page__date-cell,.theme-dark .editor-page__date-sheet { background: color-mix(in srgb, var(--surface-secondary, #1d1d1b) 96%, transparent); color: var(--text-primary, var(--noche-text)); }
.theme-dark .editor-page__sheet-copy { color: var(--text-secondary, var(--noche-muted)); }
.theme-dark .editor-page__sheet-button--primary,.theme-dark .editor-page__date-chip--active,.theme-dark .editor-page__date-cell--selected { background: color-mix(in srgb, var(--accent-brand, #c96442) 24%, transparent); color: var(--text-primary, var(--noche-text)); border-color: color-mix(in srgb, var(--accent-brand, #c96442) 24%, transparent); }
.theme-dark .editor-page__sheet-button--secondary { border-color: color-mix(in srgb, var(--border-subtle, #30302e) 86%, transparent); }
.theme-dark .editor-page__sheet-mask { background: color-mix(in srgb, var(--text-primary, #faf9f5) 12%, rgba(6, 6, 6, 0.72)); }
.theme-dark .editor-page__watermark { color: color-mix(in srgb, var(--text-primary, #faf9f5) 10%, transparent); }
.theme-dark .editor-page__signature-svg { color: color-mix(in srgb, var(--text-primary, #faf9f5) 58%, transparent); }
</style>
