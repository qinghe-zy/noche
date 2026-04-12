<template>
  <view class="editor-page noche-mobile-page" :class="`editor-page--${entryType}`">
    <view class="editor-page__paper-noise"></view>

    <view class="editor-page__canvas noche-mobile-main">
      <view class="editor-page__paper-surface">
        <SafeTopbar
          class="editor-page__topbar"
          :show-left="true"
          :reserve-right="false"
          :max-width="'100%'"
          :translucent="true"
          @left-tap="$emit('go-back')"
        >
          <template #right>
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
          </template>
        </SafeTopbar>

        <scroll-view
          :id="writingSurfaceIds.body"
          class="editor-page__body noche-mobile-scroll"
          :scroll-y="writingScrollEnabled"
          :scroll-top="writingScrollTop"
          :style="writingBodyStyle"
          @scroll="writingSurface.handleScroll"
        >
          <view :id="writingSurfaceIds.content" class="editor-page__body-fill noche-mobile-scroll-fill">
            <view class="editor-page__letter-sheet">
              <view class="editor-page__meta">
                <text class="editor-page__meta-date literary-text">{{ paperDateDisplay }}</text>
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
                  <image class="editor-page__attachment-image" :src="normalizeLocalImageSrc(attachment.localUri)" mode="aspectFill" />
                  <view
                    v-if="mode === 'edit'"
                    class="editor-page__attachment-remove"
                    @tap.stop="$emit('remove-attachment', attachment.id)"
                  >
                    <AppIcon name="close" class="editor-page__attachment-remove-svg" />
                  </view>
                </view>
              </view>

              <view v-if="mode === 'edit'" class="editor-page__writing-area">
                <textarea
                  :id="writingSurfaceIds.surface"
                  class="editor-page__textarea editor-page__writing-lines noche-writing-surface literary-text"
                  :style="writingSurfaceStyle"
                  :value="content"
                  auto-height
                  adjust-position="false"
                  maxlength="-1"
                  :show-confirm-bar="false"
                  :placeholder="bodyPlaceholder"
                  placeholder-class="editor-page__placeholder"
                  @blur="writingSurface.handleBlur"
                  @focus="writingSurface.handleFocus"
                  @input="handleWritingInput"
                  @keyboardheightchange="writingSurface.handleKeyboardHeightChange"
                  @linechange="writingSurface.handleLineChange"
                />
              </view>

              <view v-else class="editor-page__writing-area editor-page__writing-area--read">
                <view class="editor-page__read-header">
                  <text class="editor-page__read-headline">{{ readTitle }}</text>
                  <text class="editor-page__read-meta">{{ readMeta }}</text>
                </view>
                <text
                  :id="writingSurfaceIds.surface"
                  class="editor-page__read-content editor-page__writing-lines noche-writing-surface literary-text"
                  :style="writingSurfaceStyle"
                >{{ content }}</text>
              </view>

              <view v-if="mode === 'edit'" class="editor-page__attachment-toolbar">
                <view class="editor-page__attachment-trigger" @tap="$emit('pick-images')">
                  <AppIcon name="image" class="editor-page__attachment-trigger-svg" />
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
        </scroll-view>
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
import { computed, toRefs } from "vue";
import type { Attachment } from "@/shared/types/attachment";
import type { EntryType } from "@/domain/entry/types";
import { useWritingSurfaceController } from "@/features/editor/composables/useWritingSurfaceController";
import AppIcon from "@/shared/ui/AppIcon.vue";
import SafeTopbar from "@/shared/ui/SafeTopbar.vue";
import { normalizeLocalImageSrc } from "@/shared/utils/localFiles";

type EditorMode = "edit" | "read";

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
  stampOpacity: number;
  attachments: Attachment[];
  focusedAttachmentId?: string;
}>();

const emit = defineEmits<{
  (event: "go-back"): void;
  (event: "formal-save"): void;
  (event: "continue-write"): void;
  (event: "content-input", payload: Event | { detail?: { value?: string } }): void;
  (event: "pick-images"): void;
  (event: "remove-attachment", attachmentId: string): void;
  (event: "preview-attachment", attachmentId: string): void;
  (event: "open-future-date-sheet"): void;
  (event: "close-future-date-sheet"): void;
  (event: "pick-future-date", value: string): void;
  (event: "prev-future-picker-month"): void;
  (event: "next-future-picker-month"): void;
  (event: "confirm-future-date"): void;
}>();
const {
  attachments,
  bodyPlaceholder,
  canContinueWrite,
  content,
  continueWriteLabel,
  entryType,
  errorMessage,
  focusedAttachmentId,
  futureDateLabel,
  futureHint,
  futurePickerDays,
  futurePickerMonthLabel,
  futurePickerWeekLabels,
  futureQuickDateOptions,
  futureSheetConfirmLabel,
  futureSheetCopy,
  futureSheetSkipLabel,
  futureSheetTitle,
  futureUnlockLabel,
  isFutureDateSheetOpen,
  mode,
  paperDateDisplay,
  paperSubline,
  pendingUnlockDate,
  readMeta,
  readTitle,
  savedHintLabel,
  showFutureUnlockRibbon,
  showSavedHint,
  stampOpacity,
} = toRefs(props);
const surfaceLayoutSignature = computed(() => [
  props.mode,
  props.attachments.length,
  props.focusedAttachmentId ?? "none",
  props.errorMessage ?? "clean",
  props.showFutureUnlockRibbon ? "unlock-ribbon" : "plain",
  props.futureHint ?? "",
].join(":"));
const writingSurface = useWritingSurfaceController({
  variant: "future",
  mode,
  content,
  layoutSignature: surfaceLayoutSignature,
});
const writingSurfaceIds = writingSurface.ids;
const writingBodyStyle = writingSurface.bodyStyle;
const writingScrollEnabled = writingSurface.scrollEnabled;
const writingScrollTop = writingSurface.scrollTop;
const writingSurfaceStyle = computed(() => writingSurface.surfaceStyle.value);

function handleWritingInput(event: Event | { detail?: { value?: string; cursor?: number } }): void {
  writingSurface.handleInput(event);
  emit("content-input", event);
}
</script>

<style scoped>
.editor-page,
.editor-page * {
  box-sizing: border-box;
}

.editor-page {
  background:
    radial-gradient(circle at top left, rgba(var(--noche-shadow-rgb), 0.14), transparent 24%),
    radial-gradient(circle at top right, rgba(var(--noche-shadow-rgb), 0.08), transparent 24%),
    var(--noche-bg);
  position: relative;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  color: var(--noche-text);
}

.editor-page__paper-noise { position: fixed; inset: 0; pointer-events: none; opacity: 0.03; background: radial-gradient(circle at center, transparent 0%, rgba(var(--noche-shadow-rgb), 0.06) 100%); }
.literary-text { letter-spacing: 0.05em; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
.editor-page__canvas { padding: 0; display: flex; justify-content: stretch; width: 100%; }
.editor-page__paper-surface { width: 100%; max-width: none; min-height: var(--noche-content-min-height); padding: 0 calc(var(--noche-page-padding-x) + 2px) calc(var(--noche-safe-bottom) + 18px); background: linear-gradient(180deg, var(--noche-paper-1), var(--noche-paper-2)); border: none; box-shadow: none; display: flex; flex-direction: column; position: relative; }
.editor-page__topbar { width: 100%; margin-bottom: 0; flex-shrink: 0; }
.editor-page__topbar-button { width: 88rpx; height: 88rpx; padding: 0; display: flex; align-items: center; justify-content: center; position: relative; color: var(--noche-ink-faint); border: none; background: transparent; }
.editor-page__topbar-svg { width: 40rpx; height: 40rpx; color: currentColor; }
.editor-page__saved-hint { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); font-family: "Inter", "PingFang SC", sans-serif; font-size: 10px; letter-spacing: 2rpx; color: var(--noche-ink-ghost); }
.editor-page__topbar-spacer { width: 88rpx; height: 88rpx; }
.editor-page__body { padding-top: 16rpx; }
.editor-page__body-fill { gap: 0; align-items: center; }
.editor-page__letter-sheet { width: 100%; max-width: 700px; min-height: calc(var(--noche-content-min-height) - 18px); padding: 28rpx 28rpx 32rpx; border-radius: 28rpx; border: 1px solid color-mix(in srgb, var(--noche-border) 86%, transparent); background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(249,244,236,0.98)); box-shadow: 0 16rpx 42rpx rgba(var(--noche-paper-shadow-rgb), 0.08), inset 0 0 0 2rpx rgba(255,255,255,0.32); display: flex; flex-direction: column; position: relative; overflow: hidden; }
.editor-page__letter-sheet::before { content: ""; position: absolute; inset: 12rpx; border: 1px solid rgba(0, 0, 0, 0.03); pointer-events: none; }
.editor-page__meta { margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; padding: 0 12px; }
.editor-page__meta-date { font-size: 14px; letter-spacing: 0.25em; color: var(--noche-ink-strong); }
.editor-page__meta-subtitle { font-family: "Inter", "PingFang SC", sans-serif; font-size: 12px; letter-spacing: 0.32em; color: var(--noche-ink-ghost); text-transform: uppercase; }
.editor-page__notice { margin-bottom: 14rpx; font-size: 22rpx; line-height: 1.6; }
.editor-page__notice--error { color: var(--noche-danger); }
.editor-page__future-ribbon { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1rpx solid color-mix(in srgb, var(--noche-border) 45%, transparent); }
.editor-page__future-ribbon-label,.editor-page__read-meta { font-size: 13px; letter-spacing: 0.12em; color: var(--noche-ink-faint); }
.editor-page__future-ribbon-value { color: var(--noche-accent); font-size: 14px; letter-spacing: 0.08em; }
.editor-page__future-ribbon-copy { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.editor-page__future-ribbon-hint { font-size: 12px; color: var(--noche-ink-soft); }
.editor-page__attachments { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; margin-bottom: 20rpx; padding: 0 8px; }
.editor-page__attachment-card { position: relative; width: 100%; aspect-ratio: 4 / 3; padding: 0; border-radius: 20rpx; overflow: hidden; background: var(--noche-card-soft); }
.editor-page__attachment-card--focused { box-shadow: 0 0 0 2rpx rgba(var(--noche-paper-shadow-rgb), 0.38); }
.editor-page__attachment-image { width: 100%; height: 100%; }
.editor-page__attachment-remove { position: absolute; top: 10rpx; right: 10rpx; width: 44rpx; height: 44rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; background: var(--noche-surface-strong); }
.editor-page__attachment-remove-svg { width: 28rpx; height: 28rpx; color: var(--noche-ink-faint); }
.editor-page__writing-area { flex: 1; min-height: 0; display: flex; flex-direction: column; padding-top: 12px; }
.editor-page__textarea,.editor-page__read-content { width: 100%; flex: 1; border: none; color: var(--noche-ink-strong); font-size: 18px; padding-right: 14px; padding-bottom: 0; padding-left: 14px; overflow-wrap: anywhere; }
.editor-page__placeholder { color: var(--noche-ink-ghost); }
.editor-page__read-header { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; padding: 0 12px; }
.editor-page__read-headline { font-size: 24px; line-height: 1.4; color: var(--noche-ink-strong); }
.editor-page__read-content { white-space: pre-wrap; }
.editor-page__attachment-toolbar { display: flex; justify-content: flex-start; padding: 18rpx 12px 0; }
.editor-page__attachment-trigger { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; padding: 0; }
.editor-page__attachment-trigger-svg { width: 32rpx; height: 32rpx; color: var(--noche-ink-ghost); }
.editor-page__sheet-mask { position: fixed; inset: 0; z-index: 20; background: var(--noche-overlay); display: flex; align-items: flex-end; }
.editor-page__date-sheet { width: 100%; padding: 34rpx 28rpx 40rpx; background: var(--noche-bg); display: flex; flex-direction: column; gap: 18rpx; }
.editor-page__sheet-title { font-size: 34rpx; color: var(--noche-ink-strong); }
.editor-page__sheet-copy { font-size: 24rpx; line-height: 1.7; color: var(--noche-ink-soft); }
.editor-page__sheet-calendar-head { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.editor-page__sheet-calendar-nav { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; color: var(--noche-ink-faint); }
.editor-page__sheet-calendar-nav-icon { width: 28rpx; height: 28rpx; color: currentColor; }
.editor-page__sheet-calendar-month { font-size: 24rpx; letter-spacing: 0.16em; color: var(--noche-accent); }
.editor-page__date-chip-row { display: flex; flex-wrap: wrap; gap: 12rpx; }
.editor-page__date-chip { min-height: 52rpx; padding: 0 18rpx; display: flex; align-items: center; justify-content: center; border-radius: 9999rpx; background: var(--noche-surface-faint); border: 1rpx solid var(--noche-border); color: var(--noche-ink-soft); font-size: 22rpx; }
.editor-page__date-chip--active { background: var(--noche-accent); color: var(--noche-accent-contrast); border-color: var(--noche-accent); }
.editor-page__date-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8rpx; }
.editor-page__date-weekday { text-align: center; font-family: "Inter", "PingFang SC", sans-serif; font-size: 18rpx; letter-spacing: 0.14em; color: var(--noche-ink-subtle); }
.editor-page__date-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10rpx; }
.editor-page__date-cell { min-height: 60rpx; display: flex; align-items: center; justify-content: center; border-radius: 18rpx; color: var(--noche-ink-soft); }
.editor-page__date-cell--selected { background: var(--noche-accent); color: var(--noche-accent-contrast); }
.editor-page__date-cell--disabled { opacity: 0.34; }
.editor-page__date-cell-text { font-size: 24rpx; }
.editor-page__sheet-actions { display: flex; justify-content: space-between; gap: 16rpx; padding-top: 12rpx; }
.editor-page__sheet-button { flex: 1; min-height: 84rpx; font-size: 26rpx; display: flex; align-items: center; justify-content: center; }
.editor-page__sheet-button--primary { background: var(--noche-accent); color: var(--noche-accent-contrast); }
.editor-page__sheet-button--secondary { color: var(--noche-accent); border: 1rpx solid color-mix(in srgb, var(--noche-border) 70%, transparent); }
.editor-page__watermark { align-self: flex-end; margin-top: 12rpx; font-size: 180rpx; line-height: 1; color: rgba(var(--noche-shadow-rgb), 0.12); pointer-events: none; }
.editor-page__seal { align-self: flex-end; margin-top: 16rpx; pointer-events: none; }
.editor-page__signature-svg { width: 84rpx; height: 84rpx; color: color-mix(in srgb, var(--noche-accent) 76%, transparent); }
</style>
