<template>
  <view class="calendar-page">
    <view class="calendar-page__header">
      <view class="calendar-page__nav">
        <button class="calendar-page__nav-btn" @click="prevMonth">
          <text class="calendar-page__nav-icon">←</text>
        </button>
        <view class="calendar-page__current-month" @click="goToToday">
          <text class="calendar-page__month-text">{{ formatMonthLabel(currentMonthDate) }}</text>
          <text class="calendar-page__year-text">{{ formatYearLabel(currentMonthDate) }}</text>
        </view>
        <button class="calendar-page__nav-btn" @click="nextMonth">
          <text class="calendar-page__nav-icon">→</text>
        </button>
      </view>
    </view>

    <view v-if="calendarStore.error" class="calendar-page__banner calendar-page__banner--error">
      <text>{{ calendarStore.error }}</text>
    </view>

    <view class="calendar-page__body">
      <view class="calendar-page__weekdays">
        <text v-for="day in weekLabels" :key="day" class="calendar-page__weekday">{{ day }}</text>
      </view>

      <view class="calendar-page__grid">
        <view 
          v-for="(day, index) in calendarDays" 
          :key="index" 
          class="calendar-page__day-cell"
          :class="{ 
            'calendar-page__day-cell--empty': !day,
            'calendar-page__day-cell--today': day && isToday(day.fullDate),
            'calendar-page__day-cell--selected': day && isSelected(day.fullDate)
          }"
          @click="day && handleDateClick(day.fullDate)"
        >
          <view v-if="day" class="calendar-page__day-content">
            <text class="calendar-page__day-number">{{ day.date }}</text>
            <view v-if="hasMarker(day.fullDate)" class="calendar-page__marker" />
          </view>
        </view>
      </view>
    </view>

    <view class="calendar-page__footer">
      <view v-if="calendarStore.isLoading" class="calendar-page__status">
        <text class="calendar-page__status-text">正在更新日期标记…</text>
      </view>
      <view v-else class="calendar-page__legend">
        <view class="calendar-page__legend-item">
          <view class="calendar-page__marker" />
          <text class="calendar-page__legend-text">有记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCalendarStore } from "@/app/store/useCalendarStore";
import { formatDate, getDaysInMonth, getFirstDayOfWeek, addMonth, isSameDay } from "@/shared/utils/date";
import { ROUTES } from "@/shared/constants/routes";

const calendarStore = useCalendarStore();
const currentMonthDate = ref(formatDate(new Date(), "YYYY-MM-DD"));
const selectedDate = ref<string | null>(null);

const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

const calendarDays = computed(() => {
  const daysInMonth = getDaysInMonth(currentMonthDate.value);
  const firstDay = getFirstDayOfWeek(currentMonthDate.value);
  const days = [];

  // Fill empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Fill days of the current month
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

function formatMonthLabel(date: string) {
  return formatDate(date, 'MMMM');
}

function formatYearLabel(date: string) {
  return formatDate(date, 'YYYY');
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
  currentMonthDate.value = formatDate(new Date(), 'YYYY-MM-DD');
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
  void calendarStore.fetchMarkedDates();
});
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background-color: var(--noche-color-bg);
  display: flex;
  flex-direction: column;
}

.calendar-page__header {
  padding: 80rpx 40rpx 40rpx;
}

.calendar-page__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-page__nav-btn {
  background: white;
  border: 1rpx solid var(--noche-color-border);
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.calendar-page__nav-icon {
  font-size: 28rpx;
  color: var(--noche-color-text);
}

.calendar-page__current-month {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calendar-page__month-text {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--noche-color-text);
}

.calendar-page__year-text {
  font-size: 24rpx;
  color: var(--noche-color-muted);
  letter-spacing: 2rpx;
}

.calendar-page__body {
  padding: 0 40rpx;
}

.calendar-page__banner {
  margin: 0 40rpx 24rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid var(--noche-color-border);
  color: var(--noche-color-text);
  font-size: 24rpx;
}

.calendar-page__banner--error {
  background: rgba(136, 49, 49, 0.08);
  color: #7d3535;
}

.calendar-page__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 32rpx;
}

.calendar-page__weekday {
  text-align: center;
  font-size: 20rpx;
  color: var(--noche-color-muted);
  font-weight: 600;
  letter-spacing: 2rpx;
}

.calendar-page__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16rpx;
}

.calendar-page__day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  position: relative;
}

.calendar-page__day-cell--today {
  background-color: rgba(0, 0, 0, 0.04);
}

.calendar-page__day-cell--selected {
  background-color: var(--noche-color-text);
}

.calendar-page__day-cell--selected .calendar-page__day-number {
  color: white;
}

.calendar-page__day-number {
  font-size: 28rpx;
  color: var(--noche-color-text);
  font-weight: 500;
}

.calendar-page__marker {
  position: absolute;
  bottom: 12rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 6rpx;
  height: 6rpx;
  background-color: var(--noche-color-text);
  border-radius: 50%;
}

.calendar-page__day-cell--selected .calendar-page__marker {
  background-color: white;
}

.calendar-page__footer {
  margin-top: auto;
  padding: 60rpx 40rpx 80rpx;
}

.calendar-page__legend {
  display: flex;
  justify-content: center;
}

.calendar-page__legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.calendar-page__legend-item .calendar-page__marker {
  position: static;
  transform: none;
}

.calendar-page__legend-text {
  font-size: 22rpx;
  color: var(--noche-color-muted);
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.calendar-page__status-text {
  font-size: 24rpx;
  color: var(--noche-color-muted);
  display: block;
  text-align: center;
}
</style>
