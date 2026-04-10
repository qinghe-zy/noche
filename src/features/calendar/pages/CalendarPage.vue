<template>
  <view class="calendar-page">
    <view class="calendar-page__topbar">
      <button class="calendar-page__topbtn" @click="handleBackToMailbox">‹</button>
      <text class="calendar-page__toptitle">日历</text>
      <button class="calendar-page__topbtn calendar-page__topbtn--label" @click="goToToday">
        今天
      </button>
    </view>

    <view class="calendar-page__hero">
      <text class="calendar-page__hero-title">日历</text>
      <text class="calendar-page__hero-subtitle">{{ formatMonthLabel(currentMonthDate) }} {{ formatYearLabel(currentMonthDate) }}</text>
    </view>

    <view v-if="calendarStore.error" class="calendar-page__banner calendar-page__banner--error">
      <text>{{ calendarStore.error }}</text>
    </view>

    <view class="calendar-page__panel">
      <view class="calendar-page__panel-head">
        <button class="calendar-page__month-btn" @click="prevMonth">‹</button>
        <text class="calendar-page__month-label">{{ formatMonthLabel(currentMonthDate) }}</text>
        <button class="calendar-page__month-btn" @click="nextMonth">›</button>
      </view>

      <view class="calendar-page__weekdays">
        <text v-for="day in weekLabels" :key="day" class="calendar-page__weekday">{{ day }}</text>
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

    <view class="calendar-page__context">
      <view class="calendar-page__context-date">
        <text class="calendar-page__context-date-text">{{ contextDate }}</text>
      </view>
      <view class="calendar-page__context-copy">
        <text class="calendar-page__context-title">{{ contextTitle }}</text>
        <text class="calendar-page__context-body">{{ guideText }}</text>
      </view>
    </view>

    <view class="calendar-page__footer">
      <view v-if="calendarStore.isLoading" class="calendar-page__status">
        <text class="calendar-page__status-text">正在更新日期标记…</text>
      </view>
      <view v-else class="calendar-page__legend">
        <view class="calendar-page__legend-dot"></view>
        <text class="calendar-page__legend-text">有记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCalendarStore } from "@/app/store/useCalendarStore";
import { addMonth, formatDate, getDaysInMonth, getFirstDayOfWeek, isSameDay } from "@/shared/utils/date";
import { ROUTES } from "@/shared/constants/routes";
import {
  formatCalendarGuideText,
  formatCalendarMonthLabel,
  formatCalendarYearLabel,
} from "@/features/calendar/calendarDisplay";

const calendarStore = useCalendarStore();
const currentMonthDate = ref(formatDate(new Date(), "YYYY-MM-DD"));
const selectedDate = ref<string | null>(null);
const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

const calendarDays = computed(() => {
  const daysInMonth = getDaysInMonth(currentMonthDate.value);
  const firstDay = getFirstDayOfWeek(currentMonthDate.value);
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

const guideText = computed(() =>
  formatCalendarGuideText(
    selectedDate.value,
    selectedDate.value ? hasMarker(selectedDate.value) : false,
  ),
);

const contextDate = computed(() => (selectedDate.value ? selectedDate.value : "选择日期"));
const contextTitle = computed(() => {
  if (!selectedDate.value) {
    return "从这里翻找已经收好的记录";
  }

  return hasMarker(selectedDate.value) ? "这一天已经留过字" : "这一天还可以补一页日记";
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
}

function handleBackToMailbox() {
  uni.navigateBack({
    fail: () => {
      uni.reLaunch({ url: `/${ROUTES.mailbox}` });
    },
  });
}

async function handleDateClick(date: string) {
  selectedDate.value = date;

  try {
    const result = await calendarStore.resolveDate(date);

    switch (result.kind) {
      case "entry":
        uni.navigateTo({
          url: `/${ROUTES.editor}?mode=read&entryId=${result.entryId}`,
        });
        break;
      case "entry-list":
        uni.navigateTo({
          url: `/${ROUTES.dayArchive}?recordDate=${result.recordDate}`,
        });
        break;
      case "new-diary":
        uni.navigateTo({
          url: `/${ROUTES.editor}?type=diary&recordDate=${result.recordDate}`,
        });
        break;
    }
  } catch (e) {
    uni.showToast({ title: calendarStore.error ?? "日期跳转失败", icon: "none" });
  }
}

onMounted(() => {
  selectedDate.value = formatDate(new Date(), "YYYY-MM-DD");
  void calendarStore.fetchMarkedDates();
});
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  padding: 24rpx 28rpx 52rpx;
  background: linear-gradient(180deg, #fbf9f5 0%, #f3efe8 100%);
}

.calendar-page__topbar {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  padding: 12rpx 0 18rpx;
}

.calendar-page__topbtn {
  width: 72rpx;
  height: 72rpx;
  background: transparent;
  font-size: 34rpx;
  color: rgba(49, 51, 46, 0.82);
  padding: 0;
}

.calendar-page__topbtn--label {
  font-size: 18rpx;
  letter-spacing: 0.18em;
}

.calendar-page__toptitle {
  text-align: center;
  font-size: 20rpx;
  color: rgba(49, 51, 46, 0.84);
  letter-spacing: 0.2em;
}

.calendar-page__hero {
  padding: 18rpx 0 32rpx;
  text-align: center;
}

.calendar-page__hero-title {
  display: block;
  font-size: 58rpx;
  line-height: 1.2;
  color: #31332e;
}

.calendar-page__hero-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 18rpx;
  letter-spacing: 0.36em;
  color: rgba(99, 95, 85, 0.76);
  text-transform: uppercase;
}

.calendar-page__banner {
  margin-bottom: 24rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(34, 34, 34, 0.06);
  color: rgba(34, 34, 34, 0.76);
  font-size: 24rpx;
}

.calendar-page__banner--error {
  background: rgba(136, 49, 49, 0.08);
  color: #7d3535;
}

.calendar-page__panel {
  padding: 28rpx 24rpx 34rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(226, 227, 219, 0.9);
  box-shadow: 0 14rpx 34rpx rgba(49, 51, 46, 0.04);
}

.calendar-page__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22rpx;
}

.calendar-page__month-btn {
  width: 56rpx;
  height: 56rpx;
  background: transparent;
  font-size: 28rpx;
  color: rgba(99, 95, 85, 0.82);
  padding: 0;
}

.calendar-page__month-label {
  font-size: 22rpx;
  letter-spacing: 0.28em;
  color: rgba(49, 51, 46, 0.82);
}

.calendar-page__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 24rpx;
}

.calendar-page__weekday {
  text-align: center;
  font-size: 16rpx;
  letter-spacing: 0.18em;
  color: rgba(121, 124, 117, 0.78);
}

.calendar-page__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 34rpx;
}

.calendar-page__day {
  min-height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-page__day-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.calendar-page__day-number {
  font-size: 28rpx;
  color: rgba(49, 51, 46, 0.82);
}

.calendar-page__day--today .calendar-page__day-number {
  font-weight: 700;
}

.calendar-page__day--selected .calendar-page__day-number {
  color: #1d1d1d;
}

.calendar-page__marker,
.calendar-page__legend-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(95, 94, 94, 0.88);
}

.calendar-page__context {
  margin-top: 48rpx;
  padding-top: 26rpx;
  border-top: 1rpx solid rgba(177, 179, 171, 0.16);
  display: grid;
  grid-template-columns: 180rpx 1fr;
  gap: 24rpx;
  align-items: start;
}

.calendar-page__context-date-text {
  font-size: 18rpx;
  letter-spacing: 0.18em;
  color: rgba(99, 95, 85, 0.8);
  text-transform: uppercase;
}

.calendar-page__context-title {
  display: block;
  font-size: 34rpx;
  line-height: 1.35;
  color: #31332e;
  margin-bottom: 12rpx;
}

.calendar-page__context-body {
  display: block;
  font-size: 26rpx;
  line-height: 1.75;
  color: rgba(99, 95, 85, 0.82);
}

.calendar-page__footer {
  padding-top: 40rpx;
  display: flex;
  justify-content: center;
}

.calendar-page__status-text,
.calendar-page__legend-text {
  font-size: 18rpx;
  letter-spacing: 0.24em;
  color: rgba(121, 124, 117, 0.8);
}

.calendar-page__legend {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
</style>
