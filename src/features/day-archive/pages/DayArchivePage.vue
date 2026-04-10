<template>
  <view class="day-archive-page">
    <view class="day-archive-page__hero">
      <text class="day-archive-page__eyebrow">当日归档</text>
      <text class="day-archive-page__title">{{ pageTitle }}</text>
      <text class="day-archive-page__subtitle">{{ pageSubtitle }}</text>
    </view>

    <view v-if="entryStore.error" class="day-archive-page__banner day-archive-page__banner--error">
      <text>{{ entryStore.error }}</text>
    </view>

    <view v-if="entryStore.isLoading" class="day-archive-page__state">
      <text class="day-archive-page__state-text">正在整理这一天的内容…</text>
    </view>

    <view v-else-if="entries.length === 0" class="day-archive-page__state">
      <text class="day-archive-page__state-text">这一天还没有可阅读的记录。</text>
      <button class="day-archive-page__primary-button" @click="handleWriteDiary">
        补写这一天
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
          <text class="day-archive-page__item-type">{{ formatType(entry.type) }}</text>
          <text class="day-archive-page__item-date">{{ formatDate(entry.recordDate, "MM/DD") }}</text>
        </view>
        <text class="day-archive-page__item-title">{{ entry.title || fallbackTitle(entry.type) }}</text>
        <text class="day-archive-page__item-content">{{ entry.content }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useEntryStore } from "@/app/store/useEntryStore";
import type { EntryType } from "@/domain/entry/types";
import { listDayArchiveEntries } from "@/domain/services/entryQueryService";
import { lockRecordDate } from "@/domain/time/rules";
import { ROUTES } from "@/shared/constants/routes";
import { formatDate } from "@/shared/utils/date";

const entryStore = useEntryStore();
const recordDate = ref(lockRecordDate());

const entries = computed(() => listDayArchiveEntries(entryStore.entryList, recordDate.value));
const pageTitle = computed(() => formatDate(recordDate.value, "MMM DD, YYYY"));
const pageSubtitle = computed(() => `${entries.value.length} 封可阅读记录`);

function fallbackTitle(type: EntryType): string {
  if (type === "jotting") {
    return "随笔";
  }

  if (type === "future") {
    return "已开启的未来信";
  }

  return "日记";
}

function formatType(type: EntryType): string {
  if (type === "jotting") {
    return "随笔";
  }

  if (type === "future") {
    return "未来信";
  }

  return "日记";
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
    title: formatDate(recordDate.value, "MMM DD"),
  });

  void entryStore.fetchEntriesByDate(recordDate.value);
});
</script>

<style scoped>
.day-archive-page {
  min-height: 100vh;
  padding: 56rpx 32rpx 72rpx;
  background:
    radial-gradient(circle at top right, rgba(206, 184, 141, 0.16), transparent 34%),
    linear-gradient(180deg, #f8f4ef 0%, #f3eee7 100%);
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
  color: #1d1d1d;
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
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(34, 34, 34, 0.06);
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
  color: #1d1d1d;
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
  border: none;
  border-radius: 999rpx;
  background: #1f1f1f;
  color: #faf7f2;
  font-size: 28rpx;
}
</style>
