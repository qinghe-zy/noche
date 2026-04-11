<template>
  <view class="editor-page" :class="`editor-page--${entryType}`">
    <view class="editor-page__paper-noise"></view>

    <view class="editor-page__canvas">
      <view class="editor-page__paper-surface">
        <view class="editor-page__topbar">
          <view class="editor-page__topbar-inner">
            <TopbarIconButton @tap="$emit('go-back')" />

            <view
              v-if="mode === 'edit'"
              class="editor-page__topbar-button editor-page__topbar-button--action"
              @tap="$emit('formal-save')"
            >
              <text v-if="showSavedHint" class="editor-page__saved-hint">已存</text>
              <AppIcon name="mail" class="editor-page__topbar-svg" />
            </view>
            <view
              v-else-if="canContinueWrite"
              class="editor-page__topbar-button editor-page__topbar-button--continue"
              @tap="$emit('continue-write')"
            >
              续写
            </view>
            <view v-else class="editor-page__topbar-spacer"></view>
          </view>
        </view>

        <view class="editor-page__meta">
          <text class="editor-page__meta-date literary-text">{{ paperDateDisplay }}</text>
          <text class="editor-page__meta-subtitle">{{ paperSubline }}</text>
        </view>

        <view v-if="errorMessage" class="editor-page__notice editor-page__notice--error">
          <text>{{ errorMessage }}</text>
        </view>

        <view v-if="mode === 'edit'" class="editor-page__future-ribbon">
          <text class="editor-page__future-ribbon-label">启封日期</text>
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

        <view v-if="mode === 'edit'" class="editor-page__writing-area">
          <textarea
            class="editor-page__textarea editor-page__writing-lines literary-text"
            :value="content"
            auto-height
            maxlength="-1"
            :cursor-spacing="cursorSpacing"
            :show-confirm-bar="false"
            :placeholder="bodyPlaceholder"
            placeholder-class="editor-page__placeholder"
            @input="$emit('content-input', $event)"
          />
        </view>

        <view v-else class="editor-page__writing-area editor-page__writing-area--read">
          <view class="editor-page__read-header">
            <text class="editor-page__read-headline">{{ readTitle }}</text>
            <text class="editor-page__read-meta">{{ readMeta }}</text>
          </view>
          <text class="editor-page__read-content editor-page__writing-lines literary-text">{{ content }}</text>
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

    <view
      v-if="isFutureDateSheetOpen"
      class="editor-page__sheet-mask"
      @click="$emit('close-future-date-sheet')"
    >
      <view class="editor-page__date-sheet" @click.stop>
        <text class="editor-page__sheet-title">选择开启日期</text>
        <text class="editor-page__sheet-copy">这封未来信会在当天零点之后进入可阅读状态。</text>
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
          <view class="editor-page__sheet-button editor-page__sheet-button--secondary" @tap="$emit('close-future-date-sheet')">暂不设置</view>
          <view class="editor-page__sheet-button editor-page__sheet-button--primary" @tap="$emit('confirm-future-date')">确认日期</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Attachment } from "@/shared/types/attachment";
import type { EntryType } from "@/domain/entry/types";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";

defineProps<{
  entryType: EntryType;
  mode: EditorMode;
  paperDateDisplay: string;
  paperSubline: string;
  futureDateLabel: string;
  futureHint: string;
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
  errorMessage: string | null;
  showSavedHint: boolean;
  canContinueWrite: boolean;
  cursorSpacing: number;
  stampOpacity: number;
  attachments: Attachment[];
}>();

defineEmits<{
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
</script>

<style scoped>
.editor-page,
.editor-page * {
  box-sizing: border-box;
}

.editor-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(240, 222, 197, 0.36), transparent 24%),
    radial-gradient(circle at top right, rgba(222, 214, 233, 0.15), transparent 24%),
    #faf7f1;
  position: relative;
  overflow: hidden;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  color: #31332e;
}

.editor-page__paper-noise { position: fixed; inset: 0; pointer-events: none; opacity: 0.03; background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.01) 100%); }
.literary-text { letter-spacing: 0.05em; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
.editor-page__canvas { padding: 0 8px 24px; display: flex; justify-content: center; }
.editor-page__paper-surface { width: 100%; max-width: 680rpx; min-height: calc(100vh - 12px); padding: 10px 18px 22px; background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.02); box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03); display: flex; flex-direction: column; position: relative; }
.editor-page__topbar { width: 100%; margin-bottom: 10px; }
.editor-page__topbar-inner { width: 100%; padding: 28rpx 32rpx 24rpx; display: flex; align-items: center; justify-content: space-between; }
.editor-page__topbar-button { width: 72rpx; height: 72rpx; padding: 0; display: flex; align-items: center; justify-content: center; position: relative; color: rgba(138, 129, 120, 0.82); border: none; background: transparent; }
.editor-page__topbar-svg { width: 40rpx; height: 40rpx; color: currentColor; }
.editor-page__saved-hint { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); font-family: "Inter", "PingFang SC", sans-serif; font-size: 10px; letter-spacing: 2rpx; color: rgba(177, 179, 171, 0.82); }
.editor-page__topbar-spacer { width: 72rpx; height: 72rpx; }
.editor-page__meta { margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; padding: 0 8px; }
.editor-page__meta-date { font-size: 14px; letter-spacing: 0.25em; color: rgba(49, 51, 46, 0.84); }
.editor-page__meta-subtitle { font-family: "Inter", "PingFang SC", sans-serif; font-size: 12px; letter-spacing: 0.32em; color: rgba(177, 179, 171, 0.52); text-transform: uppercase; }
.editor-page__notice { margin-bottom: 20rpx; font-size: 22rpx; line-height: 1.6; }
.editor-page__notice--error { color: #8a3d3a; }
.editor-page__future-ribbon { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1rpx solid rgba(177, 179, 171, 0.24); }
.editor-page__future-ribbon-label,.editor-page__read-meta { font-size: 13px; letter-spacing: 0.12em; color: rgba(72, 69, 61, 0.56); }
.editor-page__future-ribbon-value { color: #5f5b51; font-size: 14px; letter-spacing: 0.08em; }
.editor-page__future-ribbon-copy { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.editor-page__future-ribbon-hint { font-size: 12px; color: rgba(138, 129, 120, 0.86); }
.editor-page__attachments { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; margin-bottom: 20rpx; padding: 0 8px; }
.editor-page__attachment-card { position: relative; width: 100%; aspect-ratio: 4 / 3; padding: 0; border-radius: 20rpx; overflow: hidden; background: rgba(248, 246, 242, 0.72); }
.editor-page__attachment-image { width: 100%; height: 100%; }
.editor-page__attachment-remove { position: absolute; top: 10rpx; right: 10rpx; width: 44rpx; height: 44rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.72); }
.editor-page__attachment-remove-svg { width: 28rpx; height: 28rpx; color: rgba(49, 51, 46, 0.72); }
.editor-page__writing-area { flex: 1; display: flex; flex-direction: column; padding-top: 10px; }
.editor-page__textarea,.editor-page__read-content { width: 100%; flex: 1; border: none; color: rgba(49, 51, 46, 0.92); font-size: 18px; line-height: 44px; padding: 0 8px; overflow-wrap: anywhere; }
.editor-page__writing-lines { background-image: repeating-linear-gradient(to bottom, transparent, transparent 42px, rgba(177, 179, 171, 0.18) 42px, rgba(177, 179, 171, 0.18) 44px); background-size: 100% 44px; }
.editor-page__textarea { min-height: calc(100vh - 320px); }
.editor-page__placeholder { color: rgba(177, 179, 171, 0.56); }
.editor-page__read-header { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; padding: 0 8px; }
.editor-page__read-headline { font-size: 24px; line-height: 1.4; color: #31332e; }
.editor-page__read-content { white-space: pre-wrap; }
.editor-page__attachment-toolbar { display: flex; justify-content: flex-start; padding: 18rpx 8px 0; }
.editor-page__attachment-trigger { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; padding: 0; }
.editor-page__attachment-trigger-svg { width: 32rpx; height: 32rpx; color: rgba(177, 179, 171, 0.88); }
.editor-page__sheet-mask { position: fixed; inset: 0; z-index: 20; background: rgba(49, 51, 46, 0.24); display: flex; align-items: flex-end; }
.editor-page__date-sheet { width: 100%; padding: 34rpx 28rpx 40rpx; background: #fbf9f5; display: flex; flex-direction: column; gap: 18rpx; }
.editor-page__sheet-title { font-size: 34rpx; color: #31332e; }
.editor-page__sheet-copy { font-size: 24rpx; line-height: 1.7; color: rgba(93, 96, 90, 0.9); }
.editor-page__sheet-calendar-head { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.editor-page__sheet-calendar-nav { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; color: rgba(138, 129, 120, 0.82); }
.editor-page__sheet-calendar-nav-icon { width: 28rpx; height: 28rpx; color: currentColor; }
.editor-page__sheet-calendar-month { font-size: 24rpx; letter-spacing: 0.16em; color: #5f5b51; }
.editor-page__date-chip-row { display: flex; flex-wrap: wrap; gap: 12rpx; }
.editor-page__date-chip { min-height: 52rpx; padding: 0 18rpx; display: flex; align-items: center; justify-content: center; border-radius: 9999rpx; background: rgba(255,255,255,0.72); border: 1rpx solid rgba(221,212,200,0.76); color: rgba(99,95,85,0.82); font-size: 22rpx; }
.editor-page__date-chip--active { background: #5f5e5e; color: #faf7f6; border-color: #5f5e5e; }
.editor-page__date-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8rpx; }
.editor-page__date-weekday { text-align: center; font-family: "Inter", "PingFang SC", sans-serif; font-size: 18rpx; letter-spacing: 0.14em; color: rgba(121,124,117,0.76); }
.editor-page__date-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10rpx; }
.editor-page__date-cell { min-height: 60rpx; display: flex; align-items: center; justify-content: center; border-radius: 18rpx; color: rgba(99,95,85,0.82); }
.editor-page__date-cell--selected { background: rgba(95,94,94,0.92); color: #faf7f6; }
.editor-page__date-cell--disabled { opacity: 0.34; }
.editor-page__date-cell-text { font-size: 24rpx; }
.editor-page__sheet-actions { display: flex; justify-content: space-between; gap: 16rpx; padding-top: 12rpx; }
.editor-page__sheet-button { flex: 1; min-height: 84rpx; font-size: 26rpx; display: flex; align-items: center; justify-content: center; }
.editor-page__sheet-button--primary { background: #5f5e5e; color: #faf7f6; }
.editor-page__sheet-button--secondary { color: #5f5b51; border: 1rpx solid rgba(177, 179, 171, 0.4); }
.editor-page__watermark { position: absolute; bottom: 20rpx; right: 40rpx; font-size: 180rpx; color: rgba(217, 219, 210, 0.2); pointer-events: none; }
.editor-page__seal { position: absolute; right: 28rpx; bottom: 20rpx; pointer-events: none; }
.editor-page__signature-svg { width: 84rpx; height: 84rpx; color: rgba(95, 94, 94, 0.72); }
</style>
