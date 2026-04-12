<template>
  <PageScaffold
    class="day-archive-page"
    :title="pageTitle"
    :show-left="true"
    :topbar-bordered="true"
    :max-width="'720px'"
    scrollable
    @left-tap="handleGoBack"
  >
    <view class="day-archive-page__content">
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
  </PageScaffold>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useCalendarStore } from "@/app/store/useCalendarStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { lockRecordDate } from "@/domain/time/rules";
import { ROUTES } from "@/shared/constants/routes";
import { formatDate } from "@/shared/utils/date";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import PageScaffold from "@/shared/ui/PageScaffold.vue";
import { t } from "@/shared/i18n";
import {
  formatDayArchiveEmptyText,
  formatDayArchiveSubtitle,
  formatDayArchiveTitle,
} from "@/features/day-archive/dayArchiveDisplay";
import { fallbackEntryTitle, formatEntryTypeLabel } from "@/features/entries/entryDisplay";
import type { Entry } from "@/domain/entry/types";

const calendarStore = useCalendarStore();
const settingsStore = useSettingsStore();
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

function handleGoBack(): void {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.calendar}`,
  });
}

onLoad((query) => {
  recordDate.value = typeof query?.recordDate === "string" && query.recordDate.trim()
    ? query.recordDate
    : lockRecordDate();

  void calendarStore.fetchSelectedDateEntries(recordDate.value);
});
</script>

<style scoped>
.day-archive-page {
  background: var(--noche-bg);
  color: var(--noche-text);
}

.day-archive-page__content {
  padding: 14rpx var(--noche-page-padding-x) var(--noche-page-bottom-padding);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.day-archive-page__hero {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.day-archive-page__eyebrow,
.day-archive-page__item-type,
.day-archive-page__item-date {
  font-family: "Inter", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--noche-ink-subtle);
  padding-left: 0.22em;
}

.day-archive-page__title {
  font-size: 52rpx;
  line-height: 1.08;
  font-weight: 600;
  color: var(--noche-text);
}

.day-archive-page__subtitle {
  font-size: 24rpx;
  line-height: 1.72;
  color: var(--noche-ink-soft);
}

.day-archive-page__banner {
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: color-mix(in srgb, var(--noche-surface) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--noche-border) 72%, transparent);
  color: var(--noche-ink-soft);
  font-size: 22rpx;
}

.day-archive-page__banner--error {
  background: var(--noche-danger-soft);
  color: var(--noche-danger);
}

.day-archive-page__state,
.day-archive-page__item {
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: var(--noche-surface);
  border: 1px solid var(--noche-border);
}

.day-archive-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  text-align: center;
}

.day-archive-page__state-text {
  font-size: 24rpx;
  line-height: 1.72;
  color: var(--noche-ink-soft);
}

.day-archive-page__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
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
  font-size: 32rpx;
  line-height: 1.36;
  font-weight: 600;
  color: var(--noche-text);
}

.day-archive-page__item-content {
  display: block;
  margin-top: 14rpx;
  font-size: 22rpx;
  line-height: 1.76;
  color: var(--noche-ink-soft);
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.day-archive-page__primary-button {
  min-width: 260rpx;
  min-height: 88rpx;
  border: none;
  border-radius: 999rpx;
  background: var(--noche-text);
  color: var(--noche-bg);
  font-size: 24rpx;
}
</style>
