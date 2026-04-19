<template>
  <view class="calendar-page" :class="[themeClass, typographyClass]">
    <view class="calendar-page__topbar">
      <view class="calendar-page__topbar-inner" :style="topbarInnerStyle">
        <TopbarIconButton @tap="handleBackToMailbox" />
        <text class="calendar-page__topbar-title">{{ copy.calendar.title }}</text>
        <view class="calendar-page__topbar-button calendar-page__topbar-button--label" @tap="goToToday">{{ copy.calendar.today }}</view>
      </view>
    </view>

    <component :is="bodyContainerTag" class="calendar-page__body" :scroll-y="shouldUnlockPageScroll">
      <view class="calendar-page__body-content">
        <view class="calendar-page__main">
          <view class="calendar-page__hero">
            <text class="calendar-page__hero-title">{{ copy.calendar.title }}</text>
            <text class="calendar-page__hero-subtitle">
              {{ formatMonthLabel(currentMonthDate) }} {{ formatYearLabel(currentMonthDate) }}
            </text>
          </view>

          <view v-if="calendarStore.error" class="calendar-page__banner calendar-page__banner--error">
            <text>{{ calendarStore.error }}</text>
          </view>

          <view class="calendar-page__paper-panel">
            <view class="calendar-page__panel-head">
              <view class="calendar-page__month-button" @tap="prevMonth">
                <AppIcon name="chevron-left" class="calendar-page__month-button-icon" />
              </view>
              <text class="calendar-page__month-label">{{ formatMonthLabel(currentMonthDate) }}</text>
              <view class="calendar-page__month-button" @tap="nextMonth">
                <AppIcon name="chevron-right" class="calendar-page__month-button-icon" />
              </view>
            </view>

            <view class="calendar-page__weekdays">
              <text v-for="day in displayWeekLabels" :key="day" class="calendar-page__weekday">{{ day }}</text>
            </view>

            <view class="calendar-page__grid">
              <view
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-page__day"
                :class="{
                  'calendar-page__day--empty': !day,
                  'calendar-page__day--today': day && isToday(day.fullDate),
                  'calendar-page__day--selected': day && isSelected(day.fullDate),
                }"
                @click="day && handleDateClick(day.fullDate)"
              >
                <view v-if="day" class="calendar-page__day-inner">
                  <text class="calendar-page__day-number">{{ day.date }}</text>
                  <view v-if="hasMarker(day.fullDate)" class="calendar-page__marker"></view>
                </view>
              </view>
            </view>
          </view>

          <view class="calendar-page__day-mailbox">
            <view class="calendar-page__day-mailbox-head">
              <text class="calendar-page__day-mailbox-date">{{ contextDate }}</text>
              <view class="calendar-page__day-mailbox-copy">
                <text class="calendar-page__day-mailbox-title">{{ mailboxState.title }}</text>
                <text class="calendar-page__day-mailbox-body">{{ mailboxState.body }}</text>
              </view>
            </view>

            <view v-if="mailboxState.kind !== 'entries'" class="calendar-page__day-mailbox-empty">
              <navigator
                v-if="mailboxActionUrl"
                class="calendar-page__day-mailbox-action"
                :url="mailboxActionUrl"
              >
                {{ mailboxState.actionLabel }}
              </navigator>
            </view>

            <view v-else class="calendar-page__day-mailbox-list">
              <view
                v-for="entry in selectedEntries"
                :key="entry.id"
                class="calendar-page__day-mailbox-item"
                @click="handleOpenEntry(entry.id)"
                @longpress="handleEntryLongPress(entry)"
              >
                <view class="calendar-page__day-mailbox-item-head">
                  <text class="calendar-page__day-mailbox-item-type">{{ formatEntryTypeLabel(entry.type, settingsStore.locale) }}</text>
                  <view class="calendar-page__day-mailbox-item-meta-cluster">
                    <text class="calendar-page__day-mailbox-item-date">{{ formatDate(entry.savedAt ?? entry.createdAt, "HH:mm") }}</text>
                    <view
                      v-if="hasDiaryPreludeGlyphs(entry)"
                      class="calendar-page__day-mailbox-item-prelude"
                    >
                      <DiaryPreludeGlyph
                        v-if="entry.diaryPrelude?.weatherCode"
                        class="calendar-page__day-mailbox-item-prelude-glyph"
                        kind="weather"
                        :code="entry.diaryPrelude.weatherCode"
                      />
                      <DiaryPreludeGlyph
                        v-if="entry.diaryPrelude?.moodCode"
                        class="calendar-page__day-mailbox-item-prelude-glyph"
                        kind="mood"
                        :code="entry.diaryPrelude.moodCode"
                      />
                    </view>
                  </view>
                </view>
                <text class="calendar-page__day-mailbox-item-title">{{ entry.title || fallbackEntryTitle(entry.type, settingsStore.locale) }}</text>
                <text class="calendar-page__day-mailbox-item-content">{{ entry.content }}</text>
                <text class="calendar-page__day-mailbox-item-status">{{ formatEntryStatus(entry) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="calendar-page__footer" :style="footerStyle">
          <view v-if="calendarStore.isLoading" class="calendar-page__status">
            <text class="calendar-page__status-text">{{ copy.calendar.refresh }}</text>
          </view>
          <view v-else-if="mailboxState.kind === 'entries'" class="calendar-page__legend">
            <view class="calendar-page__legend-dot"></view>
            <text class="calendar-page__legend-text">{{ copy.calendar.recordMarker }}</text>
          </view>
        </view>
      </view>
    </component>

    <PaperConfirmDialog
      :open="isLockedFutureDialogOpen"
      :title="copy.calendar.lockedTitle"
      :copy="lockedFutureDialogCopy"
      :actions="lockedFutureDialogActions"
      @close="closeLockedFutureDialog"
      @action="handleLockedFutureDialogAction"
    />

    <PaperConfirmDialog
      :open="isDeleteDialogOpen"
      :title="copy.calendar.deleteTitle"
      :copy="copy.calendar.deleteCopy"
      :actions="deleteDialogActions"
      @close="closeDeleteDialog"
      @action="handleDeleteDialogAction"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useCalendarStore } from "@/app/store/useCalendarStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import { addMonth, formatDate, getDaysInMonth, getFirstDayOfWeek, isSameDay } from "@/shared/utils/date";
import { createDateChangeWatcher } from "@/shared/utils/dateChange";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import AppIcon from "@/shared/ui/AppIcon.vue";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import {
  formatCalendarMonthLabel,
  formatCalendarYearLabel,
} from "@/features/calendar/calendarDisplay";
import { fallbackEntryTitle, formatEntryTypeLabel } from "@/features/entries/entryDisplay";
import { resolveCalendarMailboxState } from "@/features/calendar/calendarMailbox";
import type { Entry } from "@/domain/entry/types";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { useThemeClass, useTypographyClass } from "@/shared/theme";
import { t } from "@/shared/i18n";

const calendarStore = useCalendarStore();
const settingsStore = useSettingsStore();
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const { statusBarHeight, safeAreaBottom, topbarBottomSpacing, rpxToPx } = useEditorKeyboardViewport();
const currentMonthDate = ref(formatDate(new Date(), "YYYY-MM-DD"));
const todayDateKey = ref(formatDate(new Date(), "YYYY-MM-DD"));
const selectedDate = ref<string | null>(null);
const mailboxVariantIndex = ref(0);
const lockedFutureEntry = ref<Entry | null>(null);
const isLockedFutureDialogOpen = ref(false);
const pendingDeleteEntry = ref<Entry | null>(null);
const isDeleteDialogOpen = ref(false);
const copy = computed(() => t(settingsStore.locale));
const displayWeekLabels = computed(() => {
  if (settingsStore.locale === "en-US") {
    return settingsStore.weekStartsOn === 1
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }

  return settingsStore.weekStartsOn === 1
    ? ["一", "二", "三", "四", "五", "六", "日"]
    : ["日", "一", "二", "三", "四", "五", "六"];
});

const calendarDays = computed(() => {
  const daysInMonth = getDaysInMonth(currentMonthDate.value);
  const firstDay = getFirstDayOfWeek(currentMonthDate.value, settingsStore.weekStartsOn);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  const yearMonth = formatDate(currentMonthDate.value, "YYYY-MM");
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    days.push({
      date: i,
      fullDate: `${yearMonth}-${dayStr}`,
    });
  }

  return days;
});

const contextDate = computed(() => (selectedDate.value ? selectedDate.value : (
  settingsStore.locale === "en-US" ? "Select a day" : "选择日期"
)));
const selectedEntries = computed(() => calendarStore.selectedDateEntries);
const lockedFutureDialogCopy = computed(() =>
  settingsStore.locale === "en-US"
    ? (lockedFutureEntry.value?.unlockDate
      ? `This note opens on ${lockedFutureEntry.value.unlockDate}.`
      : "This note is not ready to open yet.")
    : (lockedFutureEntry.value?.unlockDate
      ? `这封信会在 ${lockedFutureEntry.value.unlockDate} 当天开启。`
      : "这封信还没有到开启的时候。"),
);
const lockedFutureDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "acknowledge",
    title: copy.value.calendar.lockedKeep,
  },
]));
const deleteDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "keep",
    title: copy.value.calendar.deleteKeep,
    tone: "muted",
  },
  {
    key: "delete",
    title: copy.value.calendar.deleteConfirm,
    tone: "danger",
  },
]));
const mailboxState = computed(() => resolveCalendarMailboxState(
  selectedDate.value ?? todayDateKey.value,
  selectedEntries.value,
  todayDateKey.value,
  mailboxVariantIndex.value,
  settingsStore.locale,
));
function resolveH5AwareRouteUrl(path: string): string {
  if (typeof window !== "undefined" && window.location.href.includes("/#/")) {
    return `/#/${path}`;
  }

  return `/${path}`;
}

const mailboxActionUrl = computed(() => {
  if (mailboxState.value.kind === "entries" || mailboxState.value.kind === "empty-future") {
    return "";
  }

  const targetDate = selectedDate.value ?? todayDateKey.value;
  return `${resolveH5AwareRouteUrl(ROUTES.editor)}?type=diary&recordDate=${targetDate}`;
});
const shouldUnlockPageScroll = computed(() => mailboxState.value.kind === "entries" && selectedEntries.value.length > 0);
const bodyContainerTag = computed(() => (shouldUnlockPageScroll.value ? "scroll-view" : "view"));
const topbarInnerStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
  paddingLeft: `${rpxToPx(32)}px`,
  paddingRight: `${rpxToPx(32)}px`,
  paddingBottom: `${topbarBottomSpacing.value}px`,
}));
const footerStyle = computed(() => ({
  paddingBottom: `${safeAreaBottom.value + rpxToPx(32)}px`,
}));
const dateChangeWatcher = createDateChangeWatcher({
  getDateKey: () => formatDate(new Date(), "YYYY-MM-DD"),
  onDateChange: async (nextDateKey) => {
    const previousToday = todayDateKey.value;
    todayDateKey.value = nextDateKey;
    if (selectedDate.value === previousToday) {
      selectedDate.value = nextDateKey;
      currentMonthDate.value = nextDateKey;
    }
    await calendarStore.fetchMarkedDates();
    await loadSelectedDatePanel(selectedDate.value ?? nextDateKey);
  },
});

function formatEntryStatus(entry: Entry): string {
  if (entry.type === "future") {
    return settingsStore.locale === "en-US"
      ? (entry.status === "sealed" ? "Pending" : "Opened")
      : (entry.status === "sealed" ? "待启" : "已启");
  }

  return settingsStore.locale === "en-US" ? "Filed" : "已收好";
}

function hasDiaryPreludeGlyphs(entry: Entry): boolean {
  return entry.type === "diary" && Boolean(entry.diaryPrelude?.weatherCode || entry.diaryPrelude?.moodCode);
}

function handleWriteDiary() {
  const targetDate = selectedDate.value ?? formatDate(new Date(), "YYYY-MM-DD");
  uni.navigateTo({
    url: `/${ROUTES.editor}?type=diary&recordDate=${targetDate}`,
  });
}

function handleOpenEntry(entryId: string) {
  const entry = selectedEntries.value.find((item) => item.id === entryId);
  if (entry?.type === "future" && entry.status === "sealed") {
    lockedFutureEntry.value = entry;
    isLockedFutureDialogOpen.value = true;
    return;
  }

  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entryId}`,
  });
}

function handleEntryLongPress(entry: Entry): void {
  pendingDeleteEntry.value = entry;
  isDeleteDialogOpen.value = true;
}

function closeLockedFutureDialog(): void {
  isLockedFutureDialogOpen.value = false;
  lockedFutureEntry.value = null;
}

function closeDeleteDialog(): void {
  isDeleteDialogOpen.value = false;
  pendingDeleteEntry.value = null;
}

function handleLockedFutureDialogAction(): void {
  closeLockedFutureDialog();
}

async function handleDeleteDialogAction(actionKey: string): Promise<void> {
  const entry = pendingDeleteEntry.value;
  closeDeleteDialog();

  if (actionKey !== "delete" || !entry) {
    return;
  }

  const entryStore = useEntryStore();
  await entryStore.destroyEntry(entry.id);
  if ((selectedDate.value ?? todayDateKey.value) === entry.recordDate) {
    await loadSelectedDatePanel(entry.recordDate);
  }
  await calendarStore.fetchMarkedDates();

  uni.showToast({
    title: copy.value.calendar.deletedToast,
    icon: "none",
  });
}

const mailboxEmptyText = computed(() => {
  return mailboxState.value.body;
});

function formatMonthLabel(date: string) {
  return formatCalendarMonthLabel(date, settingsStore.locale);
}

function formatYearLabel(date: string) {
  return formatCalendarYearLabel(date, settingsStore.locale);
}

function isToday(date: string) {
  return isSameDay(date, todayDateKey.value);
}

function isSelected(date: string) {
  return selectedDate.value === date;
}

function hasMarker(date: string) {
  return calendarStore.markedDates.includes(date);
}

function prevMonth() {
  currentMonthDate.value = addMonth(currentMonthDate.value, -1);
}

function nextMonth() {
  currentMonthDate.value = addMonth(currentMonthDate.value, 1);
}

function goToToday() {
  currentMonthDate.value = todayDateKey.value;
  selectedDate.value = todayDateKey.value;
  void loadSelectedDatePanel(selectedDate.value);
}

function handleBackToMailbox() {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.mailbox}`,
  });
}

async function loadSelectedDatePanel(recordDate: string): Promise<void> {
  mailboxVariantIndex.value = Math.floor(Math.random() * 3);
  await calendarStore.fetchSelectedDateEntries(recordDate);
}

async function handleDateClick(date: string) {
  selectedDate.value = date;
  await loadSelectedDatePanel(date);
}

onMounted(() => {
  selectedDate.value = todayDateKey.value;
  void calendarStore.fetchMarkedDates();
  void loadSelectedDatePanel(selectedDate.value);
  dateChangeWatcher.start();
});

onUnmounted(() => {
  dateChangeWatcher.stop();
});

onShow(() => {
  const nextToday = formatDate(new Date(), "YYYY-MM-DD");
  todayDateKey.value = nextToday;
  if (!selectedDate.value) {
    selectedDate.value = nextToday;
  }
  void calendarStore.fetchMarkedDates();
  void loadSelectedDatePanel(selectedDate.value ?? nextToday);
  dateChangeWatcher.sync();
});
</script>

<style scoped>
.calendar-page,
.calendar-page * {
  box-sizing: border-box;
}

.calendar-page {
  height: 100vh;
  background:
    radial-gradient(circle at top left, var(--page-atmosphere-primary, transparent), transparent 28%),
    radial-gradient(circle at top right, var(--page-atmosphere-secondary, transparent), transparent 24%),
    var(--app-bg, var(--noche-bg));
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-body, inherit);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  --calendar-accent-brand: var(--accent-brand);
}

.calendar-page__body {
  flex: 1;
  min-height: 0;
}

.calendar-page__body-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-page__topbar {
  width: 100%;
  background: var(--surface-primary, var(--noche-surface));
}

.calendar-page__topbar-inner {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-page__topbar-button {
  width: 88rpx;
  height: 88rpx;
  border: none;
  background: transparent;
  color: var(--button-secondary-text, var(--noche-muted));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: var(--button-pill-radius, 999px);
  border: 1px solid var(--button-secondary-border, transparent);
  box-shadow: var(--button-secondary-shadow, none);
}

.calendar-page__topbar-button--label {
  font-family: var(--font-body, inherit);
  font-size: 20rpx;
  letter-spacing: 0.18em;
  padding-left: 0.18em;
}

.calendar-page__topbar-title {
  font-size: 30rpx;
  letter-spacing: 0.14em;
  color: var(--text-primary, var(--noche-text));
  padding-left: 0.14em;
  font-family: var(--font-heading);
}

.calendar-page__main {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 8px 24px 60px;
  display: flex;
  flex-direction: column;
}

.calendar-page__hero {
  margin-bottom: 34px;
  text-align: center;
}

.calendar-page__hero-title {
  display: block;
  font-size: 36px;
  line-height: 1.2;
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-heading);
}

.calendar-page__hero-subtitle {
  display: block;
  margin-top: 8px;
  font-family: var(--font-body, inherit);
  font-size: 11px;
  letter-spacing: 0.36em;
  color: var(--text-secondary, var(--noche-muted));
  padding-left: 0.36em;
  text-transform: uppercase;
}

.calendar-page__banner {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--noche-panel);
  border: 1px solid var(--noche-border);
  color: var(--noche-muted);
  font-size: 13px;
  line-height: 1.7;
}

.calendar-page__banner--error {
  color: var(--button-danger-text, #8a3d3a);
}

.calendar-page__paper-panel {
  background: var(--surface-primary, var(--noche-panel));
  border: 1px solid var(--border-subtle, var(--noche-border));
  border-radius: 18px;
  padding: 24px 18px calc(22px - 24rpx);
}

.calendar-page__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(20px - 8rpx);
}

.calendar-page__month-button {
  width: 56rpx;
  height: 56rpx;
  border: none;
  background: transparent;
  color: var(--button-secondary-text, var(--noche-muted));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.calendar-page__month-button-icon {
  width: 32rpx;
  height: 32rpx;
  color: currentColor;
}

.calendar-page__month-label {
  font-family: var(--font-body, inherit);
  font-size: 12px;
  letter-spacing: 0.28em;
  color: var(--text-primary, var(--noche-text));
  padding-left: 0.28em;
}

.calendar-page__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: calc(18px - 6rpx);
}

.calendar-page__weekday {
  text-align: center;
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--text-secondary, var(--noche-muted));
  padding-left: 0.14em;
}

.calendar-page__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: calc(26px - 10rpx);
}

.calendar-page__day {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-page__day--empty {
  pointer-events: none;
}

.calendar-page__day-inner {
  position: relative;
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.calendar-page__day-number {
  font-family: var(--font-body, inherit);
  font-size: 18px;
  color: var(--text-primary, var(--noche-text));
  position: relative;
  z-index: 1;
}

.calendar-page__day--today .calendar-page__day-number {
  font-weight: 500;
  font-size: 20px;
  color: var(--text-primary, #2b2925);
}

.calendar-page__day--selected .calendar-page__day-number {
  color: var(--text-primary, #1d1d1d);
}

.calendar-page__day--selected .calendar-page__day-inner::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--calendar-accent-brand, #c96442) 18%, rgba(246, 240, 232, 0.96)) 0%, rgba(246, 240, 232, 0.52) 48%, rgba(246, 240, 232, 0) 72%);
  transform: translate(-50%, -58%);
  z-index: -1;
}

.calendar-page__marker,
.calendar-page__legend-dot {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: var(--text-tertiary, #5f5e5e);
}

.calendar-page__marker {
  position: absolute;
  left: 50%;
  bottom: 2px;
  transform: translateX(-50%);
}

.calendar-page__day-mailbox {
  margin-top: 30px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle, var(--noche-border));
  min-height: 0;
}

.calendar-page__day-mailbox-head {
  display: grid;
  grid-template-columns: 108px 1fr;
  gap: 18px;
  align-items: start;
  margin-bottom: 16px;
}

.calendar-page__day-mailbox-date {
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--text-secondary, var(--noche-muted));
  padding-left: 0.22em;
  text-transform: uppercase;
}

.calendar-page__day-mailbox-copy {
  min-width: 0;
}

.calendar-page__day-mailbox-title {
  display: block;
  font-size: 22px;
  line-height: 1.35;
  color: var(--text-primary, var(--noche-text));
  margin-bottom: 8px;
  font-family: var(--font-heading);
}

.calendar-page__day-mailbox-body {
  display: block;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary, var(--noche-muted));
}

.calendar-page__day-mailbox-empty {
  padding: 10px 0 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.calendar-page__day-mailbox-empty-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary, var(--noche-muted));
}

.calendar-page__day-mailbox-action {
  min-height: 34px;
  padding: 0 14px;
  border-radius: var(--button-pill-radius, 999px);
  border: 1px solid var(--button-secondary-border, var(--noche-border));
  background: var(--button-secondary-bg, var(--noche-panel));
  color: var(--button-secondary-text, var(--noche-text));
  font-size: 12px;
  box-shadow: var(--button-secondary-shadow, none);
}

.calendar-page__day-mailbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 0;
  max-width: 360px;
  margin: 0 auto;
}

.calendar-page__day-mailbox-item {
  padding: 18px 0 20px;
  background: transparent;
  border: 1px solid var(--border-subtle, var(--noche-border));
  text-align: center;
  border-radius: 2px;
}

.calendar-page__day-mailbox-item-head {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-bottom: 10px;
}

.calendar-page__day-mailbox-item-meta-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calendar-page__day-mailbox-item-type,
.calendar-page__day-mailbox-item-date {
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--text-tertiary, var(--noche-muted));
  padding-left: 0.14em;
  text-transform: uppercase;
}

.calendar-page__day-mailbox-item-prelude {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-tertiary, var(--noche-muted));
}

.calendar-page__day-mailbox-item-prelude-glyph {
  width: 14px;
  height: 14px;
}

.calendar-page__day-mailbox-item-title {
  display: block;
  font-size: 18px;
  line-height: 1.45;
  color: var(--text-primary, var(--noche-text));
  margin-bottom: 8px;
  text-align: center;
}

.calendar-page__day-mailbox-item-content {
  display: block;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary, var(--noche-text));
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-align: center;
}

.calendar-page__day-mailbox-item-status {
  display: block;
  margin-top: 10px;
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--text-tertiary, var(--noche-muted));
  padding-left: 0.14em;
  text-transform: uppercase;
  text-align: center;
}

.calendar-page__footer {
  padding-top: 24px;
  display: flex;
  justify-content: center;
}

.calendar-page__status-text,
.calendar-page__legend-text {
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--text-tertiary, var(--noche-muted));
  padding-left: 0.22em;
}

.calendar-page__legend {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-scale-small .calendar-page__topbar-button--label { font-size: 19rpx; }
.type-scale-large .calendar-page__topbar-button--label { font-size: 22rpx; }
.type-scale-small .calendar-page__topbar-title { font-size: 28rpx; }
.type-scale-large .calendar-page__topbar-title { font-size: 32rpx; }
.type-scale-small .calendar-page__hero-title { font-size: 34px; }
.type-scale-large .calendar-page__hero-title { font-size: 39px; }
.type-scale-small .calendar-page__hero-subtitle { font-size: 10px; }
.type-scale-large .calendar-page__hero-subtitle { font-size: 12px; }
.type-scale-small .calendar-page__banner,
.type-scale-small .calendar-page__day-mailbox-body { font-size: 12px; }
.type-scale-large .calendar-page__banner,
.type-scale-large .calendar-page__day-mailbox-body { font-size: 14px; }
.type-scale-small .calendar-page__month-label { font-size: 11px; }
.type-scale-large .calendar-page__month-label { font-size: 13px; }
.type-scale-small .calendar-page__weekday,
.type-scale-small .calendar-page__day-mailbox-date { font-size: 9px; }
.type-scale-large .calendar-page__weekday,
.type-scale-large .calendar-page__day-mailbox-date { font-size: 11px; }
.type-scale-small .calendar-page__day-number { font-size: 17px; }
.type-scale-large .calendar-page__day-number { font-size: 19px; }
.type-scale-small .calendar-page__day--today .calendar-page__day-number { font-size: 19px; }
.type-scale-large .calendar-page__day--today .calendar-page__day-number { font-size: 22px; }
.type-scale-small .calendar-page__day-mailbox-title { font-size: 21px; }
.type-scale-large .calendar-page__day-mailbox-title { font-size: 24px; }
</style>
