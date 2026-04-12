<template>
  <PageScaffold
    class="calendar-page"
    :title="copy.calendar.title"
    :show-left="true"
    :reserve-right="false"
    :topbar-bordered="true"
    :max-width="'720px'"
    @left-tap="handleBackToMailbox"
  >
    <template #right>
      <view class="calendar-page__today-button" @tap="goToToday">{{ copy.calendar.today }}</view>
    </template>

    <scroll-view class="calendar-page__scroll noche-mobile-scroll" scroll-y>
      <view class="calendar-page__main noche-mobile-scroll-fill">
        <view class="calendar-page__hero">
          <text class="calendar-page__hero-title">{{ formatMonthLabel(currentMonthDate) }}</text>
          <text class="calendar-page__hero-subtitle">
            {{ formatYearLabel(currentMonthDate) }}
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
    </scroll-view>

    <PaperConfirmDialog
      :open="isLockedFutureDialogOpen"
      :title="copy.calendar.lockedTitle"
      :copy="lockedFutureDialogCopy"
      :actions="lockedFutureDialogActions"
      @close="closeLockedFutureDialog"
      @action="handleLockedFutureDialogAction"
    />
  </PageScaffold>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useCalendarStore } from "@/app/store/useCalendarStore";
import { addMonth, formatDate, getDaysInMonth, getFirstDayOfWeek, isSameDay } from "@/shared/utils/date";
import { createDateChangeWatcher } from "@/shared/utils/dateChange";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import AppIcon from "@/shared/ui/AppIcon.vue";
import PageScaffold from "@/shared/ui/PageScaffold.vue";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
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
const todayDateKey = ref(formatDate(new Date(), "YYYY-MM-DD"));
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
const mailboxState = computed(() => resolveCalendarMailboxState(
  selectedDate.value ?? todayDateKey.value,
  selectedEntries.value,
  todayDateKey.value,
  mailboxVariantIndex.value,
  settingsStore.locale,
));
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
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.calendar-page__today-button {
  min-width: 88rpx;
  min-height: 88rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "Inter", sans-serif;
  font-size: 20rpx;
  letter-spacing: 0.16em;
  color: var(--noche-muted);
  padding-left: 0.16em;
}

.calendar-page__main {
  width: 100%;
  min-height: var(--noche-content-min-height);
  padding: 12rpx var(--noche-page-padding-x) var(--noche-page-bottom-padding);
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.calendar-page__hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.calendar-page__hero-title {
  display: block;
  font-size: 54rpx;
  line-height: 1.08;
  color: var(--noche-text);
}

.calendar-page__hero-subtitle {
  display: block;
  font-family: "Inter", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.3em;
  color: var(--noche-muted);
  padding-left: 0.3em;
  text-transform: uppercase;
}

.calendar-page__banner {
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: var(--noche-panel);
  border: 1px solid var(--noche-border);
  color: var(--noche-muted);
  font-size: 22rpx;
  line-height: 1.7;
}

.calendar-page__banner--error {
  color: var(--noche-danger);
}

.calendar-page__paper-panel {
  background: var(--noche-panel);
  border: 1px solid var(--noche-border);
  border-radius: 22rpx;
  padding: 24rpx 18rpx 20rpx;
}

.calendar-page__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;
}

.calendar-page__month-button {
  width: 88rpx;
  height: 88rpx;
  border: none;
  background: transparent;
  color: var(--noche-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-page__month-button-icon {
  width: 34rpx;
  height: 34rpx;
  color: currentColor;
}

.calendar-page__month-label {
  font-family: "Inter", sans-serif;
  font-size: 22rpx;
  letter-spacing: 0.24em;
  color: var(--noche-text);
  padding-left: 0.24em;
}

.calendar-page__weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6rpx;
  margin-bottom: 16rpx;
}

.calendar-page__weekday {
  text-align: center;
  font-family: "Inter", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.12em;
  color: var(--noche-muted);
  padding-left: 0.12em;
}

.calendar-page__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10rpx 4rpx;
}

.calendar-page__day {
  min-height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-page__day--empty {
  pointer-events: none;
}

.calendar-page__day-inner {
  width: 100%;
  max-width: 76rpx;
  aspect-ratio: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  border-radius: 20rpx;
  z-index: 0;
}

.calendar-page__day-number {
  font-family: "Inter", sans-serif;
  font-size: 28rpx;
  color: var(--noche-text);
  position: relative;
  z-index: 1;
}

.calendar-page__day--today .calendar-page__day-number {
  font-weight: 700;
}

.calendar-page__day--selected .calendar-page__day-inner {
  background: color-mix(in srgb, var(--noche-surface-soft) 94%, transparent);
}

.calendar-page__marker,
.calendar-page__legend-dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 9999rpx;
  background: var(--noche-accent);
}

.calendar-page__day-mailbox {
  padding-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.calendar-page__day-mailbox-head {
  display: grid;
  grid-template-columns: minmax(120rpx, 148rpx) minmax(0, 1fr);
  gap: 18rpx;
  align-items: start;
}

.calendar-page__day-mailbox-date {
  font-family: "Inter", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.22em;
  color: var(--noche-ink-soft);
  padding-left: 0.22em;
  text-transform: uppercase;
}

.calendar-page__day-mailbox-copy {
  min-width: 0;
}

.calendar-page__day-mailbox-title {
  display: block;
  font-size: 34rpx;
  line-height: 1.35;
  color: var(--noche-text);
  margin-bottom: 10rpx;
}

.calendar-page__day-mailbox-body {
  display: block;
  font-size: 22rpx;
  line-height: 1.82;
  color: var(--noche-muted);
}

.calendar-page__day-mailbox-empty {
  padding: 12rpx 0 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  text-align: center;
}

.calendar-page__day-mailbox-empty-text {
  font-size: 22rpx;
  line-height: 1.8;
  color: var(--noche-ink-faint);
}

.calendar-page__day-mailbox-action {
  min-height: 72rpx;
  padding: 0 24rpx;
  border-radius: 9999rpx;
  border: 1px solid var(--noche-border);
  background: var(--noche-panel);
  color: var(--noche-text);
  font-size: 22rpx;
}

.calendar-page__day-mailbox-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.calendar-page__day-mailbox-item {
  padding: 22rpx 20rpx;
  background: color-mix(in srgb, var(--noche-surface-strong) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--noche-border) 72%, transparent);
  border-radius: 20rpx;
}

.calendar-page__day-mailbox-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.calendar-page__day-mailbox-item-meta-cluster {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.calendar-page__day-mailbox-item-type,
.calendar-page__day-mailbox-item-date,
.calendar-page__day-mailbox-item-status,
.calendar-page__status-text,
.calendar-page__legend-text {
  font-family: "Inter", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.14em;
  color: var(--noche-ink-subtle);
  padding-left: 0.14em;
  text-transform: uppercase;
}

.calendar-page__day-mailbox-item-prelude {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: var(--noche-ink-subtle);
}

.calendar-page__day-mailbox-item-prelude-glyph {
  width: 14px;
  height: 14px;
}

.calendar-page__day-mailbox-item-title {
  display: block;
  font-size: 30rpx;
  line-height: 1.42;
  color: var(--noche-ink-strong);
  margin-bottom: 8rpx;
}

.calendar-page__day-mailbox-item-content {
  display: block;
  font-size: 22rpx;
  line-height: 1.8;
  color: var(--noche-ink-soft);
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.calendar-page__day-mailbox-item-status {
  display: block;
  margin-top: 12rpx;
}

.calendar-page__footer {
  padding-top: 10rpx;
  display: flex;
  justify-content: center;
}

.calendar-page__legend {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

@media (max-width: 380px) {
  .calendar-page__day-mailbox-head {
    grid-template-columns: 1fr;
    gap: 10rpx;
  }

  .calendar-page__hero-title {
    font-size: 48rpx;
  }
}
</style>
