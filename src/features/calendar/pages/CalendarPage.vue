<template>
  <view class="calendar-page">
    <view class="calendar-page__topbar">
      <view class="calendar-page__topbar-inner">
        <TopbarIconButton @tap="handleBackToMailbox" />
        <text class="calendar-page__topbar-title">{{ copy.calendar.title }}</text>
        <view class="calendar-page__topbar-button calendar-page__topbar-button--label" @tap="goToToday">{{ copy.calendar.today }}</view>
      </view>
    </view>

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
          <button
            v-if="mailboxState.actionLabel"
            class="calendar-page__day-mailbox-action"
            @click="handlePrimaryAction"
          >
            {{ mailboxState.actionLabel }}
          </button>
          <text v-else class="calendar-page__day-mailbox-empty-text">{{ mailboxState.body }}</text>
        </view>

        <view v-else class="calendar-page__day-mailbox-list">
          <view
            v-for="entry in selectedEntries"
            :key="entry.id"
            class="calendar-page__day-mailbox-item"
            @click="handleOpenEntry(entry.id)"
          >
              <view class="calendar-page__day-mailbox-item-head">
                <text class="calendar-page__day-mailbox-item-type">{{ formatEntryTypeLabel(entry.type) }}</text>
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
              <text class="calendar-page__day-mailbox-item-title">{{ entry.title || fallbackEntryTitle(entry.type) }}</text>
              <text class="calendar-page__day-mailbox-item-content">{{ entry.content }}</text>
              <text class="calendar-page__day-mailbox-item-status">{{ formatEntryStatus(entry) }}</text>
            </view>
          </view>
        </view>

    <view class="calendar-page__footer">
      <view v-if="calendarStore.isLoading" class="calendar-page__status">
        <text class="calendar-page__status-text">{{ copy.calendar.refresh }}</text>
      </view>
        <view v-else class="calendar-page__legend">
          <view class="calendar-page__legend-dot"></view>
          <text class="calendar-page__legend-text">{{ copy.calendar.recordMarker }}</text>
        </view>
      </view>
    </view>

    <PaperConfirmDialog
      :open="isLockedFutureDialogOpen"
      :title="copy.calendar.lockedTitle"
      :copy="lockedFutureDialogCopy"
      :actions="lockedFutureDialogActions"
      @close="closeLockedFutureDialog"
      @action="handleLockedFutureDialogAction"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useCalendarStore } from "@/app/store/useCalendarStore";
import { addMonth, formatDate, getDaysInMonth, getFirstDayOfWeek, isSameDay } from "@/shared/utils/date";
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
import { t } from "@/shared/i18n";

const calendarStore = useCalendarStore();
const settingsStore = useSettingsStore();
const currentMonthDate = ref(formatDate(new Date(), "YYYY-MM-DD"));
const selectedDate = ref<string | null>(null);
const mailboxVariantIndex = ref(0);
const lockedFutureEntry = ref<Entry | null>(null);
const isLockedFutureDialogOpen = ref(false);
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

const contextDate = computed(() => (selectedDate.value ? selectedDate.value : "选择日期"));
const selectedEntries = computed(() => calendarStore.selectedDateEntries);
const lockedFutureDialogCopy = computed(() =>
  lockedFutureEntry.value?.unlockDate
    ? `这封未来信会在 ${lockedFutureEntry.value.unlockDate} 当天开启。`
    : "这封未来信还没有到开启的时候。",
);
const lockedFutureDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "acknowledge",
    title: copy.value.calendar.lockedKeep,
  },
]));
const mailboxState = computed(() => resolveCalendarMailboxState(
  selectedDate.value ?? formatDate(new Date(), "YYYY-MM-DD"),
  selectedEntries.value,
  formatDate(new Date(), "YYYY-MM-DD"),
  mailboxVariantIndex.value,
));

function formatEntryStatus(entry: Entry): string {
  if (entry.type === "future") {
    return entry.status === "sealed" ? "待启" : "已启";
  }

  return "已收好";
}

function hasDiaryPreludeGlyphs(entry: Entry): boolean {
  return entry.type === "diary" && Boolean(entry.diaryPrelude?.weatherCode || entry.diaryPrelude?.moodCode);
}

function handlePrimaryAction() {
  if (mailboxState.value.kind === "empty-past") {
    handleWriteDiary();
    return;
  }

  if (mailboxState.value.kind === "empty-today") {
    uni.navigateTo({
      url: `/${ROUTES.editor}?type=diary`,
    });
  }
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

function closeLockedFutureDialog(): void {
  isLockedFutureDialogOpen.value = false;
  lockedFutureEntry.value = null;
}

function handleLockedFutureDialogAction(): void {
  closeLockedFutureDialog();
}

const mailboxEmptyText = computed(() => {
  return mailboxState.value.body;
});

function formatMonthLabel(date: string) {
  return formatCalendarMonthLabel(date);
}

function formatYearLabel(date: string) {
  return formatCalendarYearLabel(date);
}

function isToday(date: string) {
  return isSameDay(date, new Date());
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
  currentMonthDate.value = formatDate(new Date(), "YYYY-MM-DD");
  selectedDate.value = formatDate(new Date(), "YYYY-MM-DD");
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
  selectedDate.value = formatDate(new Date(), "YYYY-MM-DD");
  void calendarStore.fetchMarkedDates();
  void loadSelectedDatePanel(selectedDate.value);
});

onShow(() => {
  const nextToday = formatDate(new Date(), "YYYY-MM-DD");
  if (!selectedDate.value) {
    selectedDate.value = nextToday;
  }
  void calendarStore.fetchMarkedDates();
  void loadSelectedDatePanel(selectedDate.value ?? nextToday);
});
</script>

<style scoped>
.calendar-page,
.calendar-page * {
  box-sizing: border-box;
}

.calendar-page {
  min-height: 100vh;
  background-color: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.calendar-page__topbar {
  width: 100%;
  background: rgba(251, 249, 245, 0.98);
}

.calendar-page__topbar-inner {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 28rpx 32rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-page__topbar-button {
  width: 72rpx;
  height: 72rpx;
  border: none;
  background: transparent;
  color: rgba(138, 129, 120, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.calendar-page__topbar-button--label {
  font-family: "Inter", sans-serif;
  font-size: 20rpx;
  letter-spacing: 0.18em;
  padding-left: 0.18em;
}

.calendar-page__topbar-title {
  font-size: 30rpx;
  letter-spacing: 0.14em;
  color: #31332e;
  padding-left: 0.14em;
}

.calendar-page__main {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 8px 24px 60px;
}

.calendar-page__hero {
  margin-bottom: 34px;
  text-align: center;
}

.calendar-page__hero-title {
  display: block;
  font-size: 36px;
  line-height: 1.2;
  color: #31332e;
}

.calendar-page__hero-subtitle {
  display: block;
  margin-top: 8px;
  font-family: "Inter", sans-serif;
  font-size: 11px;
  letter-spacing: 0.36em;
  color: rgba(99, 95, 85, 0.76);
  padding-left: 0.36em;
  text-transform: uppercase;
}

.calendar-page__banner {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(221, 212, 200, 0.8);
  color: rgba(49, 51, 46, 0.8);
  font-size: 13px;
  line-height: 1.7;
}

.calendar-page__banner--error {
  color: #8a3d3a;
}

.calendar-page__paper-panel {
  background: var(--noche-panel);
  border: 1px solid var(--noche-border);
  border-radius: 18px;
  padding: 24px 18px 22px;
}

.calendar-page__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-page__month-button {
  width: 56rpx;
  height: 56rpx;
  border: none;
  background: transparent;
  color: rgba(138, 129, 120, 0.82);
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
  font-family: "Inter", sans-serif;
  font-size: 12px;
  letter-spacing: 0.28em;
  color: rgba(49, 51, 46, 0.82);
  padding-left: 0.28em;
}

.calendar-page__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 18px;
}

.calendar-page__weekday {
  text-align: center;
  font-family: "Inter", sans-serif;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(121, 124, 117, 0.78);
  padding-left: 0.14em;
}

.calendar-page__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 26px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 0;
}

.calendar-page__day-number {
  font-family: "Inter", sans-serif;
  font-size: 18px;
  color: rgba(49, 51, 46, 0.84);
  position: relative;
  z-index: 1;
}

.calendar-page__day--today .calendar-page__day-number {
  font-weight: 700;
}

.calendar-page__day--selected .calendar-page__day-number {
  color: #1d1d1d;
}

.calendar-page__day--selected .calendar-page__day-inner::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(246, 240, 232, 0.96) 0%, rgba(246, 240, 232, 0.52) 48%, rgba(246, 240, 232, 0) 72%);
  transform: translate(-50%, -58%);
  z-index: -1;
}

.calendar-page__marker,
.calendar-page__legend-dot {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: #5f5e5e;
}

.calendar-page__day-mailbox {
  margin-top: 30px;
  padding-top: 24px;
  border-top: 1px solid rgba(221, 212, 200, 0.58);
}

.calendar-page__day-mailbox-head {
  display: grid;
  grid-template-columns: 108px 1fr;
  gap: 18px;
  align-items: start;
  margin-bottom: 16px;
}

.calendar-page__day-mailbox-date {
  font-family: "Inter", sans-serif;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: rgba(99, 95, 85, 0.8);
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
  color: #31332e;
  margin-bottom: 8px;
}

.calendar-page__day-mailbox-body {
  display: block;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(99, 95, 85, 0.82);
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
  color: rgba(99, 95, 85, 0.74);
}

.calendar-page__day-mailbox-action {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 1px solid rgba(221, 212, 200, 0.8);
  background: #fbf8f3;
  color: #8a8178;
  font-size: 12px;
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
  border: 1px solid rgba(221, 212, 200, 0.52);
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
  font-family: "Inter", sans-serif;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(121, 124, 117, 0.76);
  padding-left: 0.14em;
  text-transform: uppercase;
}

.calendar-page__day-mailbox-item-prelude {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(121, 124, 117, 0.76);
}

.calendar-page__day-mailbox-item-prelude-glyph {
  width: 14px;
  height: 14px;
}

.calendar-page__day-mailbox-item-title {
  display: block;
  font-size: 18px;
  line-height: 1.45;
  color: #31332e;
  margin-bottom: 8px;
  text-align: center;
}

.calendar-page__day-mailbox-item-content {
  display: block;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(99, 95, 85, 0.82);
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
  font-family: "Inter", sans-serif;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(121, 124, 117, 0.76);
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
  font-family: "Inter", sans-serif;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: rgba(121, 124, 117, 0.8);
  padding-left: 0.22em;
}

.calendar-page__legend {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
