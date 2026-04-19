<template>
  <view class="day-archive-page" :class="[themeClass, typographyClass]">
    <view class="day-archive-page__hero">
      <text class="day-archive-page__eyebrow">{{ copy.dayArchive.eyebrow }}</text>
      <text class="day-archive-page__title">{{ pageTitle }}</text>
      <text class="day-archive-page__subtitle">{{ pageSubtitle }}</text>
    </view>

    <view v-if="calendarStore.error" class="day-archive-page__banner day-archive-page__banner--error">
      <text>{{ calendarStore.error }}</text>
    </view>

    <view v-if="calendarStore.isLoading" class="day-archive-page__state">
      <text class="day-archive-page__state-text">{{ copy.dayArchive.loading }}</text>
    </view>

    <view v-else-if="entries.length === 0" class="day-archive-page__state">
      <text class="day-archive-page__state-text">{{ emptyText }}</text>
      <button class="day-archive-page__primary-button" @click="handleWriteDiary">
        {{ copy.dayArchive.writeDiary }}
      </button>
    </view>

    <view v-else class="day-archive-page__list">
      <view
        v-for="entry in entries"
        :key="entry.id"
        class="day-archive-page__item"
        @click="handleOpenEntry(entry.id)"
      >
        <view class="day-archive-page__item-head">
          <text class="day-archive-page__item-type">{{ formatEntryTypeLabel(entry.type, settingsStore.locale) }}</text>
          <text class="day-archive-page__item-date">{{ resolveEntryDateLabel(entry) }}</text>
        </view>
        <text class="day-archive-page__item-title">{{ entry.title || fallbackEntryTitle(entry.type, settingsStore.locale) }}</text>
        <text class="day-archive-page__item-content">{{ entry.content }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useCalendarStore } from "@/app/store/useCalendarStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { lockRecordDate } from "@/domain/time/rules";
import { ROUTES } from "@/shared/constants/routes";
import { formatDate } from "@/shared/utils/date";
import { t } from "@/shared/i18n";
import {
  formatDayArchiveEmptyText,
  formatDayArchiveSubtitle,
  formatDayArchiveTitle,
} from "@/features/day-archive/dayArchiveDisplay";
import { fallbackEntryTitle, formatEntryTypeLabel } from "@/features/entries/entryDisplay";
import type { Entry } from "@/domain/entry/types";
import { useThemeClass, useTypographyClass } from "@/shared/theme";

const calendarStore = useCalendarStore();
const settingsStore = useSettingsStore();
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const copy = computed(() => t(settingsStore.locale));
const recordDate = ref(lockRecordDate());

const entries = computed(() => calendarStore.selectedDateEntries);
const pageTitle = computed(() => formatDayArchiveTitle(recordDate.value, settingsStore.locale));
const pageSubtitle = computed(() => formatDayArchiveSubtitle(entries.value.length, settingsStore.locale));
const emptyText = computed(() => formatDayArchiveEmptyText(recordDate.value, settingsStore.locale));

function resolveEntryDateLabel(entry: Entry): string {
  if (entry.type === "future" && entry.unlockDate) {
    return settingsStore.locale === "en-US"
      ? `Opened ${formatDate(entry.unlockDate, "MM/DD")}`
      : `启封 ${formatDate(entry.unlockDate, "MM/DD")}`;
  }

  return formatDate(entry.recordDate, "MM/DD");
}

function handleOpenEntry(entryId: string): void {
  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entryId}`,
  });
}

function handleWriteDiary(): void {
  uni.navigateTo({
    url: `/${ROUTES.editor}?type=diary&recordDate=${recordDate.value}`,
  });
}

onLoad((query) => {
  recordDate.value = typeof query?.recordDate === "string" && query.recordDate.trim()
    ? query.recordDate
    : lockRecordDate();

  uni.setNavigationBarTitle({
    title: formatDayArchiveTitle(recordDate.value, settingsStore.locale),
  });

  void calendarStore.fetchSelectedDateEntries(recordDate.value);
});
</script>

<style scoped>
.day-archive-page {
  min-height: 100vh;
  padding: 56rpx 32rpx 72rpx;
  background: var(--app-bg, var(--noche-bg));
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-body, inherit);
}

.day-archive-page__hero,
.day-archive-page__banner,
.day-archive-page__list,
.day-archive-page__state {
  position: relative;
}

.day-archive-page__hero {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.day-archive-page__eyebrow,
.day-archive-page__item-type,
.day-archive-page__item-date {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  color: rgba(34, 34, 34, 0.58);
}

.day-archive-page__title {
  font-size: 58rpx;
  line-height: 1.1;
  font-weight: 600;
  color: var(--text-primary, #1d1d1d);
  font-family: var(--font-heading);
}

.day-archive-page__subtitle {
  font-size: 28rpx;
  line-height: 1.6;
  color: rgba(34, 34, 34, 0.68);
}

.day-archive-page__banner {
  margin-bottom: 24rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(34, 34, 34, 0.06);
  color: rgba(34, 34, 34, 0.76);
  font-size: 24rpx;
}

.day-archive-page__banner--error {
  background: rgba(136, 49, 49, 0.08);
  color: #7d3535;
}

.day-archive-page__state,
.day-archive-page__item {
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: var(--surface-primary, var(--noche-surface));
  border: 1rpx solid var(--border-subtle, var(--noche-border));
}

.day-archive-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  text-align: center;
}

.day-archive-page__state-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: rgba(34, 34, 34, 0.68);
  font-family: var(--font-body);
}

.day-archive-page__list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.day-archive-page__item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.day-archive-page__item-title {
  display: block;
  margin-top: 14rpx;
  font-size: 34rpx;
  line-height: 1.3;
  font-weight: 600;
  color: var(--text-primary, #1d1d1d);
  font-family: var(--font-heading);
}

.day-archive-page__item-content {
  display: block;
  margin-top: 14rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: rgba(34, 34, 34, 0.74);
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.day-archive-page__primary-button {
  min-width: 240rpx;
  min-height: 88rpx;
  border: 1rpx solid var(--button-primary-border, transparent);
  border-radius: var(--button-pill-radius, 999rpx);
  background: var(--button-primary-bg, #1f1f1f);
  color: var(--button-primary-text, #faf7f2);
  font-size: 28rpx;
  box-shadow: var(--button-primary-shadow, none);
  font-family: var(--font-body, inherit);
}

.type-scale-small .day-archive-page__eyebrow,
.type-scale-small .day-archive-page__item-type,
.type-scale-small .day-archive-page__item-date { font-size: 21rpx; }
.type-scale-large .day-archive-page__eyebrow,
.type-scale-large .day-archive-page__item-type,
.type-scale-large .day-archive-page__item-date { font-size: 24rpx; }
.type-scale-small .day-archive-page__title { font-size: 54rpx; }
.type-scale-large .day-archive-page__title { font-size: 63rpx; }
.type-scale-small .day-archive-page__subtitle,
.type-scale-small .day-archive-page__state-text,
.type-scale-small .day-archive-page__item-content,
.type-scale-small .day-archive-page__primary-button { font-size: 26rpx; }
.type-scale-large .day-archive-page__subtitle,
.type-scale-large .day-archive-page__state-text,
.type-scale-large .day-archive-page__item-content,
.type-scale-large .day-archive-page__primary-button { font-size: 30rpx; }
.type-scale-small .day-archive-page__banner { font-size: 23rpx; }
.type-scale-large .day-archive-page__banner { font-size: 26rpx; }
.type-scale-small .day-archive-page__item-title { font-size: 32rpx; }
.type-scale-large .day-archive-page__item-title { font-size: 37rpx; }
</style>
