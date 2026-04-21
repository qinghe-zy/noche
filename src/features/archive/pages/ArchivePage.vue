<template>
  <view class="archive-page theme-dark">
    <view :class="pageClass('main')">
      <scroll-view class="archive-page__page-scroll" scroll-y enable-flex>
        <view class="archive-page__main-content">
          <view class="archive-page__header">
            <view class="archive-page__home-entry" @tap="handleBackHome">
              <view class="archive-page__back-arrow"></view>
              <text class="archive-page__back-btn-label">{{ homeEntryLabel }}</text>
            </view>
            <text class="archive-page__header-eyebrow">{{ headerEyebrow }}</text>
            <view class="archive-page__header-title">
              <text class="archive-page__header-title-line">{{ copy.archive.titleLine1 }}</text>
              <text class="archive-page__header-title-line">{{ copy.archive.titleLine2 }}</text>
            </view>
            <text class="archive-page__header-sub">{{ copy.archive.headerSub }}</text>

            <view class="archive-page__badge">
              <text class="archive-page__badge-num">{{ archiveCount }}</text>
              <text class="archive-page__badge-label">{{ copy.archive.badgeLabel }}</text>
            </view>
          </view>

          <view class="archive-page__section archive-page__today-section">
            <view class="archive-page__section-label">
              <text>{{ todayLabel }}</text>
            </view>

            <view
              class="archive-page__today-card"
              @tap="handleOpenToday"
              @longpress.stop="handleRequestDeleteToday"
            >
              <view class="archive-page__today-card-lines"></view>

              <view class="archive-page__today-card-head">
                <text class="archive-page__today-card-no">{{ todaySerial }}</text>
                <text
                  v-if="archiveStore.hasAnsweredToday"
                  class="archive-page__answered-tag"
                >
                  {{ copy.archive.answeredStamp }}
                </text>
                <text v-else class="archive-page__stamp">{{ copy.archive.pendingStamp }}</text>
              </view>

              <text class="archive-page__today-card-question">「{{ archiveStore.todayQuestion?.question ?? "" }}」</text>

              <view class="archive-page__today-card-cta">
                <text
                  class="archive-page__today-card-cta-text"
                  :class="{ 'archive-page__today-card-cta-text--answered': archiveStore.hasAnsweredToday }"
                >
                  {{ todayCardCta }}
                </text>
                <view v-if="!archiveStore.hasAnsweredToday" class="archive-page__cta-arrow"></view>
              </view>
            </view>
          </view>

          <view v-if="featuredArchiveEntry" class="archive-page__section archive-page__memory-section">
            <view class="archive-page__section-label">
              <text>{{ featuredArchiveLabel }}</text>
            </view>

            <view
              class="archive-page__memory-card"
              @tap="handleOpenMemory(featuredArchiveEntry)"
              @longpress.stop="handleRequestDeleteArchiveEntry(featuredArchiveEntry)"
            >
              <view class="archive-page__memory-year-line"></view>
              <text class="archive-page__memory-date">{{ featuredCardLabel(featuredArchiveEntry) }}</text>
              <text class="archive-page__memory-question">「{{ featuredArchiveEntry.question }}」</text>
              <text class="archive-page__memory-answer">{{ featuredArchiveEntry.answer }}</text>
            </view>
          </view>

          <view v-if="historyEntries.length" class="archive-page__section archive-page__archive-section">
            <view class="archive-page__section-label">
              <text>{{ copy.archive.history }}</text>
            </view>

            <view
              v-for="entry in historyEntries"
              :key="entry.id"
              class="archive-page__archive-item"
              @tap="handleOpenMemory(entry)"
              @longpress.stop="handleRequestDeleteArchiveEntry(entry)"
            >
              <view class="archive-page__archive-item-date">
                <text class="archive-page__archive-item-date-main">{{ formatArchiveHistoryDate(entry.date, settingsStore.locale) }}</text>
                <text class="archive-page__archive-item-date-year">{{ formatDate(entry.date, 'YYYY') }}</text>
              </view>

              <view class="archive-page__archive-item-content">
                <text class="archive-page__archive-item-question">「{{ entry.question }}」</text>
                <text class="archive-page__archive-item-answer">{{ entry.answer }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="archive-page__bottom-nav">
        <view class="archive-page__nav-btn archive-page__nav-btn--active">
          <text>档案馆</text>
        </view>
        <view class="archive-page__nav-btn archive-page__nav-btn--center" @tap="handleOpenWriteFromNav">
          <text>✦</text>
        </view>
        <view class="archive-page__nav-btn">
          <text>统计</text>
        </view>
      </view>
    </view>

    <view :class="pageClass('write')" class="archive-page__page archive-page__page--solid">
      <view class="archive-page__write-paper">
        <view class="archive-page__write-fixed-layer">
          <view class="archive-page__write-header">
            <view class="archive-page__back-btn" @tap="handleBackToMain">
              <view class="archive-page__back-arrow"></view>
              <text class="archive-page__back-btn-label">{{ copy.archive.back }}</text>
            </view>
          </view>

          <view class="archive-page__write-meta">
            <view class="archive-page__write-date-row">
              <text>{{ formatArchiveLongDate(todayDate, settingsStore.locale) }}</text>
              <text>{{ todaySerial }}</text>
            </view>
            <text class="archive-page__write-question">「{{ archiveStore.todayQuestion?.question ?? "" }}」</text>
            <view class="archive-page__divider"></view>
          </view>
        </view>

        <view class="archive-page__write-interactive-layer">
          <scroll-view
            class="archive-page__write-scroll"
            scroll-y
            :scroll-top="writeScrollTopBinding"
            :scroll-with-animation="writeScrollWithAnimation"
            @scroll="handleWriteScroll"
          >
            <view class="archive-page__write-stage" :style="writeStageStyle">
              <textarea
                class="archive-page__write-area"
                :value="draftAnswer"
                :focus="view === 'write' && textareaFocused"
                :cursor="localCursorPosition"
                adjust-position="false"
                disable-default-padding
                hold-keyboard
                :cursor-spacing="cursorSpacing"
                :show-confirm-bar="false"
                :maxlength="500"
                :placeholder="writePlaceholder"
                :style="writeTextareaStyle"
                @tap.stop="handleWriteTextareaTap"
                @input="handleDraftInput"
                @focus="handleWriteFocus"
                @blur="handleWriteBlur"
                @linechange="handleWriteLineChange"
              />
              <view class="archive-page__write-blank-spacer" :style="writeBlankSpacerStyle"></view>
            </view>
          </scroll-view>
        </view>

        <view class="archive-page__write-footer">
          <text class="archive-page__char-count">{{ draftAnswer.length }} / 500</text>
          <view
            class="archive-page__submit-btn"
            :class="{ 'archive-page__submit-btn--disabled': isSubmitDisabled }"
            @touchstart.stop.prevent="handleSubmit"
            @tap="handleSubmit"
            @click="handleSubmit"
          >
            <text>{{ copy.archive.save }}</text>
          </view>
        </view>
      </view>
    </view>

    <view :class="pageClass('success')" class="archive-page__page">
      <view :key="successAnimationKey" class="archive-page__success-screen">
        <text class="archive-page__success-stamp archive-page__stamp-anim">ARCHIVED · {{ formatArchiveLongDate(todayDate, settingsStore.locale) }}</text>
        <text class="archive-page__success-title archive-page__fade-up">{{ copy.archive.saved }}</text>
        <text class="archive-page__success-sub archive-page__fade-up">{{ successCopy }}</text>
        <view class="archive-page__success-back archive-page__fade-up" @tap="handleBackToMain">
          <text>{{ copy.archive.backToArchive }}</text>
        </view>
      </view>
    </view>

    <view :class="pageClass('memory')" class="archive-page__page archive-page__page--solid">
      <view class="archive-page__memory-paper">
        <view class="archive-page__memory-topbar">
          <view class="archive-page__back-btn" @tap="handleBackToMain">
            <view class="archive-page__back-arrow"></view>
            <text class="archive-page__back-btn-label">{{ copy.archive.back }}</text>
          </view>
        </view>

        <scroll-view v-if="memoryEntry" class="archive-page__memory-scroll" scroll-y>
          <view class="archive-page__memory-detail">
            <view class="archive-page__memory-detail-top">
              <view class="archive-page__memory-detail-date">
                <text>{{ formatArchiveLongDate(memoryEntry.date, settingsStore.locale) }}</text>
                <text class="archive-page__memory-detail-serial">{{ serialOf(memoryEntry) }}</text>
              </view>
              <text class="archive-page__memory-detail-stamp">ARCHIVED</text>
            </view>

            <text class="archive-page__memory-detail-question">「{{ memoryEntry.question }}」</text>

            <view class="archive-page__memory-detail-sep">
              <view class="archive-page__memory-detail-sep-line"></view>
              <text class="archive-page__memory-detail-sep-label">{{ copy.archive.answerSep }}</text>
              <view class="archive-page__memory-detail-sep-line"></view>
            </view>

            <text class="archive-page__memory-detail-answer">{{ memoryEntry.answer }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { waitForBootstrapAppRuntime } from "@/app/providers/bootstrapAppRuntime";
import { useArchiveStore } from "@/app/store/useArchiveStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { formatArchiveHistoryDate, formatArchiveLongDate } from "@/features/archive/archiveDisplay";
import type { ArchiveEntry } from "@/features/archive/types";
import {
  resolveInteractiveLayerHeight,
  useEditorKeyboardViewport,
} from "@/features/editor/composables/useEditorKeyboardViewport";
import { useDeferredKeyboardViewportSync } from "@/features/editor/composables/useDeferredKeyboardViewportSync";
import {
  estimateEditorCaretLineBottom,
  estimateEditorContentHeight,
  resolveCaretAwareScrollTop,
  resolveTapCaretLineBottom,
} from "@/features/editor/editorCaretLayout";
import { t } from "@/shared/i18n";
import { formatDate } from "@/shared/utils/date";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import { ROUTES } from "@/shared/constants/routes";

type ArchivePageView = "main" | "write" | "success" | "memory";
type TextareaInputPayload = { value?: string; cursor?: number };
type TextareaFocusPayload = { cursor?: number };
type TextareaLineChangePayload = { height?: number };
type ScrollEventPayload = { scrollTop?: number };
type ArchiveContentChangeDirection = "grow" | "shrink" | "same";
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

const ARCHIVE_WRITE_FONT_SIZE_PX = 16;
const ARCHIVE_WRITE_LINE_HEIGHT_PX = 30;
const ARCHIVE_WRITE_MIN_HEIGHT_PX = 220;
const ARCHIVE_WRITE_STAGE_HORIZONTAL_PADDING_PX = 0;

const archiveStore = useArchiveStore();
const settingsStore = useSettingsStore();
const view = ref<ArchivePageView>("main");
const draftAnswer = ref("");
const memoryEntry = ref<ArchiveEntry | null>(null);
const successAnimationKey = ref(0);
const todayDate = formatDate(new Date(), "YYYY-MM-DD");
const {
  statusBarHeight,
  safeAreaBottom,
  keyboardVisible,
  cursorSpacing,
  minLineGapToKeyboard,
  visibleWindowHeight,
  rpxToPx,
} = useEditorKeyboardViewport();
const instance = getCurrentInstance();
const writeViewportHeight = ref(0);
const writeViewportTop = ref(0);
const writeStageWidth = ref(0);
const writeScrollTop = ref(0);
const isProgrammaticWriteScroll = ref(false);
const programmaticWriteScrollTop = ref<number | undefined>(undefined);
const textareaFocused = ref(false);
const localCursorPosition = ref(0);
const caretAnchorCursorPosition = ref(0);
const writeScrollWithAnimation = ref(false);
const latestEstimatedContentHeight = ref(ARCHIVE_WRITE_LINE_HEIGHT_PX);
const measuredContentHeight = ref(ARCHIVE_WRITE_LINE_HEIGHT_PX);
const pendingTapCaretLineBottom = ref<number | null>(null);
const lastContentChangeDirection = ref<ArchiveContentChangeDirection>("same");
const shouldSuppressNextArchiveTap = ref(false);

let writeScrollTimer: ReturnType<typeof setTimeout> | null = null;
let archiveTapSuppressTimer: ReturnType<typeof setTimeout> | null = null;

const copy = computed(() => t(settingsStore.locale));

const headerEyebrow = computed(() =>
  settingsStore.locale === "en-US" ? "PRIVATE ARCHIVE · ARCHIVE" : "私人档案馆 · ARCHIVE",
);
const successCopy = computed(() =>
  settingsStore.locale === "en-US"
    ? "This answer is now in your archive.\nYou can come back to read it anytime."
    : "这份答案已经归入档案馆。\n你随时都可以回来读它。",
);
const featuredArchiveLabel = computed(() =>
  settingsStore.locale === "en-US" ? "Latest Archive" : "最近归档",
);
const writePlaceholder = computed(() =>
  settingsStore.locale === "en-US" ? copy.value.archive.answerPlaceholder : "写下此刻的答案……",
);
const isSubmitDisabled = computed(() => draftAnswer.value.trim().length < 5);
const homeEntryLabel = computed(() => settingsStore.locale === "en-US" ? "Back Home" : "返回主页");
const estimatedContentWidth = computed(() => {
  if (writeStageWidth.value > 0) {
    return Math.max(writeStageWidth.value - ARCHIVE_WRITE_STAGE_HORIZONTAL_PADDING_PX * 2, ARCHIVE_WRITE_FONT_SIZE_PX * 6);
  }

  return Math.max(
    rpxToPx(750 - 48) - ARCHIVE_WRITE_STAGE_HORIZONTAL_PADDING_PX * 2,
    ARCHIVE_WRITE_FONT_SIZE_PX * 6,
  );
});
const renderWriteHeight = computed(() =>
  Math.max(
    measuredContentHeight.value + ARCHIVE_WRITE_LINE_HEIGHT_PX,
    ARCHIVE_WRITE_LINE_HEIGHT_PX * 3,
  ),
);
const writeStageStyle = computed(() => ({
  minHeight: `${Math.max(writeViewportHeight.value, ARCHIVE_WRITE_MIN_HEIGHT_PX)}px`,
  paddingBottom: `${minLineGapToKeyboard.value + safeAreaBottom.value}px`,
}));
const writeBlankSpacerStyle = computed(() => ({
  minHeight: `${Math.max(writeViewportHeight.value - renderWriteHeight.value - minLineGapToKeyboard.value, 0)}px`,
}));
const writeTextareaStyle = computed(() => ({
  height: `${renderWriteHeight.value}px`,
}));
const writeScrollTopBinding = computed(() => programmaticWriteScrollTop.value);
const {
  pendingKeyboardViewportSync,
  deferKeyboardViewportSync,
  requestKeyboardViewportSync,
  flushPendingKeyboardViewportSync,
  resetKeyboardViewportSync,
} = useDeferredKeyboardViewportSync<DeferredKeyboardViewportPayload>({
  keyboardVisible,
  bodyViewportHeight: writeViewportHeight,
  scheduleMeasurement: (flush) => {
    measureWriteLayout(() => {
      flush();
    });
  },
});

const chronologicalEntries = computed(() =>
  [...archiveStore.history].sort((a, b) => a.date.localeCompare(b.date)),
);

const serialMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};

  chronologicalEntries.value.forEach((entry, index) => {
    map[entry.id] = `NO.${String(index + 1).padStart(4, "0")}`;
  });

  return map;
});

const archivedEntries = computed(() => archiveStore.history.filter((entry) => entry.date !== todayDate));
const featuredArchiveEntry = computed(() => archivedEntries.value[0] ?? null);
const historyEntries = computed(() =>
  archivedEntries.value.filter((entry) => entry.id !== featuredArchiveEntry.value?.id),
);
const todayReadableEntry = computed(() =>
  archiveStore.todayEntry ?? archiveStore.history.find((entry) => entry.date === todayDate) ?? null,
);

const archiveCount = computed(() => {
  const total = archiveStore.history.length
    + (archiveStore.hasAnsweredToday && !archiveStore.history.some((entry) => entry.date === todayDate) ? 1 : 0);

  return String(total);
});

const todayLabel = computed(() => `${copy.value.archive.today} · ${formatArchiveLongDate(todayDate, settingsStore.locale)}`);

const todaySerial = computed(() => {
  const answeredToday = archiveStore.history.find((entry) => entry.date === todayDate) ?? archiveStore.todayEntry;

  if (answeredToday && serialMap.value[answeredToday.id]) {
    return serialMap.value[answeredToday.id];
  }

  return `NO.${String(chronologicalEntries.value.length + 1).padStart(4, "0")}`;
});

const todayCardCta = computed(() => {
  if (!archiveStore.hasAnsweredToday) {
    return copy.value.archive.answerNowLong;
  }

  if (settingsStore.locale === "en-US") {
    return `Archived on ${formatArchiveLongDate(todayDate, settingsStore.locale)}`;
  }

  return `已在 ${formatArchiveLongDate(todayDate, settingsStore.locale)} 归档`;
});

function pageClass(target: ArchivePageView) {
  return [
    "archive-page__page",
    view.value === target ? "archive-page__page--visible" : "archive-page__page--hidden",
  ];
}

function serialOf(entry: ArchiveEntry): string {
  return serialMap.value[entry.id] ?? "NO.0001";
}

function featuredCardLabel(entry: ArchiveEntry): string {
  return `${formatArchiveLongDate(entry.date, settingsStore.locale)} · ${serialOf(entry)}`;
}

function handleOpenToday() {
  if (consumeArchiveTapSuppression()) {
    return;
  }

  if (archiveStore.hasAnsweredToday && todayReadableEntry.value) {
    handleOpenMemory(todayReadableEntry.value);
    return;
  }

  view.value = "write";
}

function handleOpenWriteFromNav() {
  if (archiveStore.hasAnsweredToday && todayReadableEntry.value) {
    handleOpenMemory(todayReadableEntry.value);
    return;
  }

  view.value = "write";
}

async function handleSubmit() {
  if (isSubmitDisabled.value) {
    return;
  }

  textareaFocused.value = false;
  await archiveStore.answerToday(draftAnswer.value.trim());
  draftAnswer.value = "";
  memoryEntry.value = null;
  view.value = "main";
}

function handleOpenMemory(entry: ArchiveEntry) {
  if (consumeArchiveTapSuppression()) {
    return;
  }

  memoryEntry.value = entry;
  view.value = "memory";
}

function clearArchiveTapSuppressTimer(): void {
  if (archiveTapSuppressTimer !== null) {
    clearTimeout(archiveTapSuppressTimer);
    archiveTapSuppressTimer = null;
  }
}

function markArchiveLongPress(): void {
  clearArchiveTapSuppressTimer();
  shouldSuppressNextArchiveTap.value = true;
  archiveTapSuppressTimer = setTimeout(() => {
    archiveTapSuppressTimer = null;
    shouldSuppressNextArchiveTap.value = false;
  }, 450);
}

function consumeArchiveTapSuppression(): boolean {
  if (!shouldSuppressNextArchiveTap.value) {
    return false;
  }

  shouldSuppressNextArchiveTap.value = false;
  clearArchiveTapSuppressTimer();
  return true;
}

function handleRequestDeleteToday(): void {
  if (!archiveStore.hasAnsweredToday || !todayReadableEntry.value) {
    return;
  }

  handleRequestDeleteArchiveEntry(todayReadableEntry.value);
}

function handleRequestDeleteArchiveEntry(entry: ArchiveEntry): void {
  markArchiveLongPress();

  uni.showModal({
    title: copy.value.archive.deleteTitle,
    content: copy.value.archive.deleteCopy,
    cancelText: copy.value.archive.deleteKeep,
    confirmText: copy.value.archive.deleteConfirm,
    confirmColor: "#8b2020",
    success: (result) => {
      if (!result.confirm) {
        return;
      }

      void archiveStore.deleteArchiveEntry(entry.date).then(() => {
        if (memoryEntry.value?.date === entry.date) {
          memoryEntry.value = null;
        }

        view.value = "main";
        uni.showToast({
          title: copy.value.archive.deletedToast,
          icon: "none",
        });
      });
    },
  });
}

function handleBackToMain() {
  textareaFocused.value = false;
  resetKeyboardViewportSync();
  view.value = "main";
}

function handleBackHome() {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.home}`,
  });
}

function estimateContentHeight(content: string): number {
  return estimateEditorContentHeight({
    content,
    availableWidth: estimatedContentWidth.value,
    fontSizePx: ARCHIVE_WRITE_FONT_SIZE_PX,
    lineHeightPx: ARCHIVE_WRITE_LINE_HEIGHT_PX,
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
  writeScrollWithAnimation.value = false;
}

function clearWriteScrollTimer(): void {
  if (writeScrollTimer !== null) {
    clearTimeout(writeScrollTimer);
    writeScrollTimer = null;
  }
}

function setProgrammaticWriteScrollTop(nextScrollTop: number): void {
  clearWriteScrollTimer();
  isProgrammaticWriteScroll.value = true;
  programmaticWriteScrollTop.value = nextScrollTop;
  writeScrollTop.value = nextScrollTop;
  writeScrollTimer = setTimeout(() => {
    writeScrollTimer = null;
    isProgrammaticWriteScroll.value = false;
    programmaticWriteScrollTop.value = undefined;
  }, 120);
}

function measureWriteLayout(onComplete?: () => void): void {
  if (view.value !== "write") {
    onComplete?.();
    return;
  }

  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (!publicInstance || typeof uni === "undefined" || typeof uni.createSelectorQuery !== "function") {
      onComplete?.();
      return;
    }

    uni
      .createSelectorQuery()
      .in(publicInstance)
      .select(".archive-page__write-scroll")
      .boundingClientRect()
      .select(".archive-page__write-stage")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const [writeScrollRect, writeStageRect] = results ?? [];

        if (typeof writeScrollRect?.height === "number") {
          writeViewportHeight.value = Math.max(writeScrollRect.height, 0);
        }

        if (typeof writeScrollRect?.top === "number") {
          writeViewportTop.value = writeScrollRect.top;
        }

        if (typeof writeStageRect?.width === "number") {
          writeStageWidth.value = Math.max(writeStageRect.width, 0);
        }

        onComplete?.();
      });
  });
}

function syncWriteScroll(
  nextContentHeight = measuredContentHeight.value,
  options: {
    force?: boolean;
    animate?: boolean;
    minScrollTop?: number;
  } = {},
): void {
  const {
    force = false,
    animate = false,
    minScrollTop,
  } = options;

  if (deferKeyboardViewportSync({
    nextContentHeight,
    force,
    animate,
  })) {
    return;
  }

  const preferredCaretLineBottom = pendingTapCaretLineBottom.value ?? estimateEditorCaretLineBottom({
    content: draftAnswer.value,
    cursor: caretAnchorCursorPosition.value,
    availableWidth: estimatedContentWidth.value,
    fontSizePx: ARCHIVE_WRITE_FONT_SIZE_PX,
    lineHeightPx: ARCHIVE_WRITE_LINE_HEIGHT_PX,
  });
  const viewportHeight = resolveInteractiveLayerHeight(
    Math.max(writeViewportHeight.value, 0),
    0,
    ARCHIVE_WRITE_MIN_HEIGHT_PX,
  );
  const resolvedScrollTop = resolveCaretAwareScrollTop({
    caretLineBottom: Math.min(Math.max(preferredCaretLineBottom, ARCHIVE_WRITE_LINE_HEIGHT_PX), nextContentHeight),
    viewportHeight,
    minLineGapToKeyboard: minLineGapToKeyboard.value,
  });
  const targetScrollTop = typeof minScrollTop === "number"
    ? Math.max(resolvedScrollTop, minScrollTop)
    : resolvedScrollTop;

  if (force || Math.abs(writeScrollTop.value - targetScrollTop) > 1) {
    writeScrollWithAnimation.value = animate;
    setProgrammaticWriteScrollTop(targetScrollTop);
    return;
  }

  pendingTapCaretLineBottom.value = null;
}

function handleWriteScroll(event: Event): void {
  const detail = (event as Event & { detail?: ScrollEventPayload }).detail;
  writeScrollTop.value = Math.max(detail?.scrollTop ?? 0, 0);

  if (!isProgrammaticWriteScroll.value) {
    programmaticWriteScrollTop.value = undefined;
  }
}

function handleDraftInput(event: Event): void {
  const detail = (event as Event & { detail?: TextareaInputPayload }).detail;
  const nextValue = typeof detail?.value === "string" ? detail.value : "";
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : localCursorPosition.value;
  draftAnswer.value = nextValue;
  localCursorPosition.value = cursor;
  caretAnchorCursorPosition.value = cursor;
}

function handleWriteFocus(event: Event): void {
  const detail = (event as Event & { detail?: TextareaFocusPayload }).detail;
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : localCursorPosition.value;
  textareaFocused.value = true;
  localCursorPosition.value = cursor;
  caretAnchorCursorPosition.value = cursor;

  if (keyboardVisible.value) {
    requestKeyboardViewportSync({
      nextContentHeight: measuredContentHeight.value,
      force: false,
      animate: false,
    }, {
      prepare: () => {
        writeViewportHeight.value = 0;
      },
    });
  }
}

function handleWriteBlur(): void {
  textareaFocused.value = false;
  pendingTapCaretLineBottom.value = null;
  resetKeyboardViewportSync();
}

function handleWriteTextareaTap(event: Event): void {
  const detail = (event as Event & { detail?: { y?: number } }).detail;
  pendingTapCaretLineBottom.value = resolveTapCaretLineBottom({
    tapClientY: detail?.y,
    viewportTop: writeViewportTop.value,
    currentScrollTop: writeScrollTop.value,
    lineHeightPx: ARCHIVE_WRITE_LINE_HEIGHT_PX,
  });
}

function handleWriteLineChange(event: Event): void {
  const detail = (event as Event & { detail?: TextareaLineChangePayload }).detail;
  if (typeof detail?.height !== "number") {
    return;
  }

  const normalizedHeight = Math.max(
    Math.ceil(detail.height / ARCHIVE_WRITE_LINE_HEIGHT_PX),
    1,
  ) * ARCHIVE_WRITE_LINE_HEIGHT_PX;
  const previousMeasuredHeight = measuredContentHeight.value;
  const previousScrollTop = writeScrollTop.value;

  measuredContentHeight.value = normalizedHeight;
  writeScrollWithAnimation.value = false;

  if (normalizedHeight > previousMeasuredHeight) {
    nextTick(() => {
      syncWriteScroll(normalizedHeight, {
        force: true,
        animate: false,
        minScrollTop: previousScrollTop,
      });
    });
    return;
  }

  if (keyboardVisible.value) {
    syncWriteScroll(normalizedHeight, {
      force: false,
      animate: false,
    });
  }
}

applyVisualEstimate(draftAnswer.value);

onMounted(() => {
  measureWriteLayout();
});

onBeforeUnmount(() => {
  clearWriteScrollTimer();
  clearArchiveTapSuppressTimer();
});

watch(
  () => view.value,
  (nextView) => {
    if (nextView !== "write") {
      clearWriteScrollTimer();
      isProgrammaticWriteScroll.value = false;
      programmaticWriteScrollTop.value = undefined;
      resetKeyboardViewportSync();
      return;
    }

    textareaFocused.value = false;
    localCursorPosition.value = draftAnswer.value.length;
    caretAnchorCursorPosition.value = draftAnswer.value.length;
    measureWriteLayout(() => {
      if (keyboardVisible.value) {
        requestKeyboardViewportSync({
          nextContentHeight: measuredContentHeight.value,
          force: false,
          animate: false,
        }, {
          prepare: () => {
            writeViewportHeight.value = 0;
          },
        });
      }
    });
  },
);

watch(
  () => draftAnswer.value,
  (nextContent, previousContent) => {
    applyVisualEstimate(nextContent, previousContent ?? nextContent);
  },
);

watch(
  () => [keyboardVisible.value, visibleWindowHeight.value],
  ([nextKeyboardVisible, nextVisibleWindowHeight], [previousKeyboardVisible, previousVisibleWindowHeight]) => {
    if (view.value !== "write") {
      return;
    }

    const keyboardVisibleChanged = nextKeyboardVisible !== previousKeyboardVisible;
    const visibleWindowHeightChanged = nextVisibleWindowHeight !== previousVisibleWindowHeight;

    if (!keyboardVisibleChanged && !visibleWindowHeightChanged) {
      return;
    }

    nextTick(() => {
      writeScrollWithAnimation.value = false;

      if (nextKeyboardVisible) {
        requestKeyboardViewportSync({
          nextContentHeight: measuredContentHeight.value,
          force: false,
          animate: false,
        }, {
          prepare: () => {
            writeViewportHeight.value = 0;
          },
        });
        return;
      }

      clearWriteScrollTimer();
      isProgrammaticWriteScroll.value = false;
      programmaticWriteScrollTop.value = undefined;
      resetKeyboardViewportSync();
      measureWriteLayout();
    });
  },
);

watch(writeViewportHeight, (nextHeight) => {
  if (nextHeight <= 0 || view.value !== "write") {
    return;
  }

  const payload = flushPendingKeyboardViewportSync();
  if (!payload) {
    return;
  }

  syncWriteScroll(payload.nextContentHeight, {
    force: payload.force,
    animate: payload.animate,
  });
});

onLoad(async (query) => {
  await waitForBootstrapAppRuntime();
  await archiveStore.resolveTodayQuestion(todayDate);

  if (typeof query?.mode === "string" && query.mode === "write" && !archiveStore.hasAnsweredToday) {
    view.value = "write";
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&family=Noto+Serif+SC:wght@300;400;600&display=swap");

.archive-page,
.archive-page * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.archive-page {
  --design-width: 390px;
  --screen-width: min(100vw, 430px);
  --scale: clamp(0.82, calc(var(--screen-width) / var(--design-width)), 1.1);

  --color-bg: #141210;
  --color-surface: #1c1915;
  --color-paper: #f0e8d5;
  --color-paper-dark: #e2d8c0;
  --color-ink: #1e1a14;
  --color-ink-light: #3d3526;
  --color-gold: #c9963c;
  --color-gold-dim: #8a6828;
  --color-muted: #6b5e48;
  --color-red-stamp: #8b2020;
  --color-line-strong: #2a2520;
  --color-line-soft: #1e1b17;
  --color-noise-line: rgba(0, 0, 0, 0.06);

  --font-display: "Cormorant Garamond", serif;
  --font-mono: "IBM Plex Mono", monospace;
  --font-cjk: "Noto Serif SC", serif;

  --fs-8: clamp(8px, calc(8px * var(--scale)), 9px);
  --fs-9: clamp(9px, calc(9px * var(--scale)), 10px);
  --fs-10: clamp(10px, calc(10px * var(--scale)), 11px);
  --fs-13: clamp(12px, calc(13px * var(--scale)), 14px);
  --fs-16: clamp(15px, calc(16px * var(--scale)), 17px);
  --fs-22: clamp(20px, calc(22px * var(--scale)), 24px);
  --fs-26: clamp(23px, calc(26px * var(--scale)), 28px);
  --fs-28: clamp(24px, calc(28px * var(--scale)), 30px);
  --fs-32: clamp(28px, calc(32px * var(--scale)), 34px);
  --fs-42: clamp(34px, calc(42px * var(--scale)), 46px);

  --space-6: calc(6px * var(--scale));
  --space-8: calc(8px * var(--scale));
  --space-10: calc(10px * var(--scale));
  --space-12: calc(12px * var(--scale));
  --space-14: calc(14px * var(--scale));
  --space-16: calc(16px * var(--scale));
  --space-18: calc(18px * var(--scale));
  --space-20: calc(20px * var(--scale));
  --space-24: calc(24px * var(--scale));
  --space-28: calc(28px * var(--scale));
  --space-32: calc(32px * var(--scale));
  --space-36: calc(36px * var(--scale));
  --space-40: calc(40px * var(--scale));
  --space-48: calc(48px * var(--scale));
  --space-52: calc(52px * var(--scale));
  --space-100: calc(100px * var(--scale));

  --app-max-width: 430px;
  --cta-arrow-width: calc(24px * var(--scale));
  --cta-arrow-width-hover: calc(32px * var(--scale));
  --back-arrow-width: calc(20px * var(--scale));
  --arrow-head-size: calc(6px * var(--scale));
  --tap-min-height: 44px;
  --translate-page-hidden-x: calc(24px * var(--scale));
  --translate-fade-up-y: calc(16px * var(--scale));

  position: relative;
  width: 100%;
  max-width: var(--app-max-width);
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-paper);
  font-family: var(--font-cjk);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.archive-page::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.6;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
}

.archive-page__page {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.archive-page__page--visible {
  opacity: 1;
  transform: translateX(0);
}

.archive-page__page--hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateX(var(--translate-page-hidden-x));
}

.archive-page__page--solid {
  background: var(--color-bg);
}

.archive-page__page-scroll {
  flex: 1;
  height: 100%;
  min-height: 0;
}

.archive-page__main-content {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: var(--space-100);
}

.archive-page__home-entry {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  min-height: var(--tap-min-height);
  margin-bottom: var(--space-16);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-paper);
}

.archive-page__header {
  position: relative;
  padding:
    calc(var(--space-52) + env(safe-area-inset-top, 0px))
    var(--space-24)
    var(--space-20);
  border-bottom: 1px solid var(--color-line-strong);
}

.archive-page__header-eyebrow,
.archive-page__header-sub,
.archive-page__badge-label,
.archive-page__section-label,
.archive-page__today-card-no,
.archive-page__stamp,
.archive-page__answered-tag,
.archive-page__today-card-cta-text,
.archive-page__memory-date,
.archive-page__archive-item-date-main,
.archive-page__archive-item-date-year,
.archive-page__write-date-row,
.archive-page__char-count,
.archive-page__submit-btn,
.archive-page__back-btn-label,
.archive-page__memory-detail-date,
.archive-page__memory-detail-serial,
.archive-page__memory-detail-stamp,
.archive-page__memory-detail-sep-label,
.archive-page__success-stamp,
.archive-page__success-sub,
.archive-page__success-back,
.archive-page__nav-btn {
  font-family: var(--font-mono);
}

.archive-page__header-eyebrow {
  display: block;
  margin-bottom: var(--space-6);
  font-size: var(--fs-9);
  letter-spacing: 0.2em;
  color: var(--color-gold-dim);
  text-transform: uppercase;
}

.archive-page__header-title {
  display: flex;
  flex-direction: column;
  gap: calc(2px * var(--scale));
  font-family: var(--font-display);
  font-size: var(--fs-28);
  font-weight: 300;
  font-style: italic;
  line-height: 1.1;
}

.archive-page__header-title-line {
  display: block;
}

.archive-page__header-sub {
  display: block;
  margin-top: calc(4px * var(--scale));
  font-size: var(--fs-10);
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.archive-page__badge {
  position: absolute;
  top: calc(var(--space-52) + env(safe-area-inset-top, 0px));
  right: var(--space-24);
  text-align: right;
}

.archive-page__badge-num {
  display: block;
  font-family: var(--font-display);
  font-size: var(--fs-42);
  font-weight: 600;
  line-height: 1;
  color: var(--color-gold);
  opacity: 0.9;
}

.archive-page__badge-label {
  display: block;
  font-size: var(--fs-8);
  letter-spacing: 0.15em;
  color: var(--color-muted);
}

.archive-page__section {
  padding-right: var(--space-24);
  padding-left: var(--space-24);
}

.archive-page__today-section {
  padding-top: var(--space-20);
}

.archive-page__memory-section {
  padding-top: 0;
  padding-bottom: var(--space-20);
}

.archive-page__archive-section {
  padding-bottom: calc(var(--space-100) + env(safe-area-inset-bottom, 0px));
}

.archive-page__section-label {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
  font-size: var(--fs-9);
  letter-spacing: 0.2em;
  color: var(--color-gold-dim);
  text-transform: uppercase;
}

.archive-page__section-label::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-line-strong);
}

.archive-page__today-card {
  position: relative;
  overflow: hidden;
  padding: var(--space-20);
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.archive-page__today-card:active {
  transform: scale(0.99);
}

.archive-page__today-card-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent calc(27px * var(--scale)),
    var(--color-noise-line) calc(27px * var(--scale)),
    var(--color-noise-line) calc(28px * var(--scale))
  );
}

.archive-page__today-card-head,
.archive-page__today-card-cta,
.archive-page__write-date-row,
.archive-page__memory-detail-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.archive-page__today-card-no,
.archive-page__memory-date,
.archive-page__write-date-row,
.archive-page__memory-detail-date,
.archive-page__memory-detail-serial,
.archive-page__archive-item-date-main,
.archive-page__archive-item-date-year {
  font-size: var(--fs-9);
  letter-spacing: 0.15em;
  color: var(--color-muted);
}

.archive-page__stamp {
  display: inline-block;
  padding: calc(2px * var(--scale)) calc(6px * var(--scale));
  border: 1px solid var(--color-red-stamp);
  font-size: var(--fs-8);
  letter-spacing: 0.1em;
  color: var(--color-red-stamp);
  opacity: 0.8;
  transform: rotate(-2deg);
}

.archive-page__answered-tag {
  display: inline-block;
  padding: calc(3px * var(--scale)) calc(8px * var(--scale));
  background: var(--color-gold);
  font-size: var(--fs-8);
  letter-spacing: 0.15em;
  color: var(--color-ink);
  text-transform: uppercase;
}

.archive-page__today-card-question,
.archive-page__write-question,
.archive-page__memory-detail-question {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: var(--space-16);
  font-family: var(--font-display);
  font-size: var(--fs-22);
  font-style: italic;
  font-weight: 400;
  line-height: 1.35;
}

.archive-page__today-card-cta {
  justify-content: flex-start;
  gap: var(--space-6);
  margin-top: var(--space-16);
}

.archive-page__today-card-cta-text {
  font-size: var(--fs-10);
  letter-spacing: 0.1em;
  color: var(--color-ink-light);
  text-transform: uppercase;
}

.archive-page__today-card-cta-text--answered {
  color: var(--color-gold-dim);
  text-transform: none;
}

.archive-page__cta-arrow {
  width: var(--cta-arrow-width);
  height: 1px;
  background: var(--color-ink-light);
  position: relative;
  transition: width 0.2s ease;
}

.archive-page__today-card:hover .archive-page__cta-arrow {
  width: var(--cta-arrow-width-hover);
}

.archive-page__cta-arrow::after {
  content: "";
  position: absolute;
  right: 0;
  top: calc(-3px * var(--scale));
  width: var(--arrow-head-size);
  height: var(--arrow-head-size);
  border-top: 1px solid var(--color-ink-light);
  border-right: 1px solid var(--color-ink-light);
  transform: rotate(45deg);
}

.archive-page__memory-card {
  position: relative;
  padding: var(--space-16);
  border: 1px solid var(--color-line-strong);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.archive-page__memory-card:hover {
  border-color: var(--color-gold-dim);
}

.archive-page__memory-year-line {
  position: absolute;
  top: 0;
  right: var(--space-16);
  left: var(--space-16);
  height: 2px;
  background: var(--color-gold);
  opacity: 0.4;
}

.archive-page__memory-date {
  display: block;
  margin-top: calc(4px * var(--scale));
  margin-bottom: var(--space-8);
  color: var(--color-gold-dim);
}

.archive-page__memory-question,
.archive-page__archive-item-question {
  display: block;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-muted);
}

.archive-page__memory-question {
  margin-bottom: var(--space-8);
  font-size: var(--fs-13);
  line-height: 1.4;
}

.archive-page__memory-answer {
  display: -webkit-box;
  overflow: hidden;
  font-size: var(--fs-13);
  line-height: 1.6;
  color: var(--color-paper);
  opacity: 0.85;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.archive-page__archive-item {
  display: flex;
  gap: var(--space-16);
  padding: var(--space-14) 0;
  border-bottom: 1px solid var(--color-line-soft);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.archive-page__archive-item:hover {
  opacity: 0.7;
}

.archive-page__archive-item-date {
  min-width: calc(36px * var(--scale));
  padding-top: calc(2px * var(--scale));
  line-height: 1.6;
}

.archive-page__archive-item-date-main,
.archive-page__archive-item-date-year {
  display: block;
}

.archive-page__archive-item-date-year {
  font-size: var(--fs-8);
}

.archive-page__archive-item-content {
  flex: 1;
  min-width: 0;
}

.archive-page__archive-item-question {
  margin-bottom: calc(4px * var(--scale));
  font-size: var(--fs-13);
}

.archive-page__archive-item-answer {
  display: -webkit-box;
  overflow: hidden;
  font-size: var(--fs-13);
  line-height: 1.5;
  color: var(--color-paper);
  opacity: 0.75;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.archive-page__bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--app-max-width);
  padding:
    var(--space-24)
    var(--space-24)
    calc(var(--space-36) + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(transparent, var(--color-bg) 40%);
  transform: translateX(-50%);
}

.archive-page__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--tap-min-height);
  padding: calc(8px * var(--scale)) 0;
  font-size: var(--fs-9);
  letter-spacing: 0.15em;
  color: var(--color-muted);
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s ease;
}

.archive-page__nav-btn--active {
  color: var(--color-gold);
}

.archive-page__nav-btn:hover {
  color: var(--color-paper);
}

.archive-page__nav-btn--center {
  font-size: var(--fs-22);
  letter-spacing: 0;
  color: var(--color-gold);
}

.archive-page__write-paper,
.archive-page__memory-paper {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
}

.archive-page__write-fixed-layer {
  flex: 0 0 auto;
  position: relative;
  z-index: 2;
  background: var(--color-bg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.archive-page__write-header,
.archive-page__memory-topbar {
  padding:
    calc(var(--space-52) + env(safe-area-inset-top, 0px))
    var(--space-24)
    0;
}

.archive-page__write-meta {
  padding: var(--space-24) var(--space-24) 0;
  background: var(--color-bg);
}

.archive-page__write-interactive-layer,
.archive-page__memory-scroll {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
}

.archive-page__write-scroll {
  height: 100%;
}

.archive-page__write-stage {
  padding: 0 var(--space-24);
}

.archive-page__write-blank-spacer {
  width: 100%;
}

.archive-page__back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  color: var(--color-muted);
  cursor: pointer;
  transition: color 0.2s ease;
}

.archive-page__back-btn-label {
  font-size: var(--fs-10);
  letter-spacing: 0.1em;
}

.archive-page__back-btn:hover {
  color: var(--color-paper);
}

.archive-page__back-arrow {
  position: relative;
  width: var(--back-arrow-width);
  height: 1px;
  background: currentColor;
}

.archive-page__back-arrow::before {
  content: "";
  position: absolute;
  left: 0;
  top: calc(-3px * var(--scale));
  width: var(--arrow-head-size);
  height: var(--arrow-head-size);
  border-bottom: 1px solid currentColor;
  border-left: 1px solid currentColor;
  transform: rotate(45deg);
}

.archive-page__write-question {
  font-size: var(--fs-26);
  font-weight: 300;
  color: var(--color-paper);
}

.archive-page__divider {
  width: calc(40px * var(--scale));
  height: 1px;
  margin: var(--space-28) 0;
  background: var(--color-gold);
  opacity: 0.6;
}

.archive-page__write-area {
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-paper);
  font-family: var(--font-cjk);
  font-size: var(--fs-16);
  line-height: 1.8;
  caret-color: var(--color-gold);
}

.archive-page__write-area::-webkit-scrollbar {
  display: none;
}

.archive-page__write-area::placeholder {
  color: var(--color-muted);
  font-style: italic;
}

.archive-page__write-footer {
  flex: 0 0 auto;
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:
    var(--space-16)
    var(--space-24)
    calc(var(--space-40) + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, rgba(20, 18, 16, 0), var(--color-bg) 28%);
  box-shadow: 0 -10px 24px rgba(0, 0, 0, 0.16);
}

.archive-page__char-count {
  font-size: var(--fs-10);
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.archive-page__submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--tap-min-height);
  padding: 0 var(--space-24);
  background: var(--color-gold);
  color: var(--color-ink);
  font-size: var(--fs-10);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.archive-page__submit-btn--disabled {
  opacity: 0.3;
}

.archive-page__submit-btn:not(.archive-page__submit-btn--disabled):hover {
  opacity: 0.85;
}

.archive-page__success-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-24);
  padding: var(--space-48) var(--space-32);
  text-align: center;
}

.archive-page__success-stamp {
  padding: calc(8px * var(--scale)) calc(20px * var(--scale));
  border: 2px solid var(--color-red-stamp);
  font-size: calc(11px * var(--scale));
  letter-spacing: 0.2em;
  color: var(--color-red-stamp);
  opacity: 0;
}

.archive-page__success-title {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  font-style: italic;
  color: var(--color-paper);
  opacity: 0;
}

.archive-page__success-sub {
  font-size: var(--fs-10);
  line-height: 1.8;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  white-space: pre-line;
  opacity: 0;
}

.archive-page__success-back {
  margin-top: var(--space-24);
  padding: var(--space-12) var(--space-32);
  border: 1px solid var(--color-line-strong);
  font-size: var(--fs-10);
  letter-spacing: 0.15em;
  color: var(--color-muted);
  text-transform: uppercase;
  opacity: 0;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.archive-page__success-back:hover {
  border-color: var(--color-gold-dim);
  color: var(--color-paper);
}

.archive-page__memory-detail {
  padding:
    var(--space-24)
    var(--space-24)
    calc(var(--space-100) + env(safe-area-inset-bottom, 0px));
}

.archive-page__memory-detail-top {
  align-items: flex-start;
  margin-bottom: var(--space-32);
}

.archive-page__memory-detail-date {
  display: flex;
  flex-direction: column;
  gap: calc(2px * var(--scale));
  line-height: 1.8;
  color: var(--color-gold-dim);
}

.archive-page__memory-detail-serial {
  color: var(--color-gold-dim);
}

.archive-page__memory-detail-stamp {
  display: inline-block;
  padding: calc(3px * var(--scale)) calc(8px * var(--scale));
  border: 1px solid var(--color-red-stamp);
  font-size: var(--fs-8);
  letter-spacing: 0.1em;
  color: var(--color-red-stamp);
  opacity: 0.7;
}

.archive-page__memory-detail-question {
  margin-bottom: var(--space-20);
  color: var(--color-muted);
}

.archive-page__memory-detail-sep {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  margin-bottom: var(--space-20);
}

.archive-page__memory-detail-sep-line {
  flex: 1;
  height: 1px;
  background: var(--color-line-strong);
}

.archive-page__memory-detail-sep-label {
  font-size: var(--fs-9);
  letter-spacing: 0.15em;
  color: var(--color-muted);
  text-transform: uppercase;
  white-space: nowrap;
}

.archive-page__memory-detail-answer {
  font-size: var(--fs-16);
  line-height: 1.9;
  color: var(--color-paper);
  opacity: 0.9;
}

@keyframes archive-page-fade-up {
  from {
    opacity: 0;
    transform: translateY(var(--translate-fade-up-y));
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes archive-page-stamp-in {
  0% {
    opacity: 0;
    transform: rotate(-8deg) scale(1.3);
  }

  60% {
    opacity: 1;
    transform: rotate(2deg) scale(0.95);
  }

  100% {
    opacity: 0.8;
    transform: rotate(-2deg) scale(1);
  }
}

.archive-page__fade-up {
  animation: archive-page-fade-up 0.5s ease forwards;
}

.archive-page__stamp-anim {
  animation: archive-page-stamp-in 0.6s cubic-bezier(0.2, 0, 0, 1) forwards;
}

.archive-page__success-title.archive-page__fade-up {
  animation-delay: 0.4s;
}

.archive-page__success-sub.archive-page__fade-up {
  animation-delay: 0.6s;
}

.archive-page__success-back.archive-page__fade-up {
  animation-delay: 0.8s;
}
</style>
