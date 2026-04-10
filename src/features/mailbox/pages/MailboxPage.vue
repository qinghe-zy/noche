<template>
  <view class="mailbox-page">
    <view class="mailbox-page__topbar">
      <button class="mailbox-page__nav-btn" @click="handleGoHome">‹</button>
      <text class="mailbox-page__topbar-title">私人信箱</text>
      <button class="mailbox-page__nav-btn mailbox-page__nav-btn--icon" @click="handleGoToCalendar">
        日历
      </button>
    </view>

    <view class="mailbox-page__tabs">
      <button
        class="mailbox-page__tab"
        :class="{ 'mailbox-page__tab--active': activeTab === 'past' }"
        @click="activeTab = 'past'"
      >
        <text class="mailbox-page__tab-text">往日信件</text>
      </button>
      <button
        class="mailbox-page__tab"
        :class="{ 'mailbox-page__tab--active': activeTab === 'future' }"
        @click="activeTab = 'future'"
      >
        <text class="mailbox-page__tab-text">待启之信</text>
      </button>
    </view>

    <scroll-view scroll-y class="mailbox-page__content">
      <view v-if="mailboxStore.isLoading" class="mailbox-page__state">
        <text class="mailbox-page__state-text">正在整理信箱…</text>
      </view>

      <view v-else-if="mailboxStore.error" class="mailbox-page__state mailbox-page__state--error">
        <text class="mailbox-page__state-text">{{ mailboxStore.error }}</text>
        <button class="mailbox-page__retry" @click="refresh">重新加载</button>
      </view>

      <view v-else-if="currentEntries.length === 0" class="mailbox-page__state">
        <text class="mailbox-page__state-text">这里暂时还没有内容。</text>
      </view>

      <view v-else class="mailbox-page__list">
        <view
          v-for="entry in currentEntries"
          :key="entry.id"
          class="mailbox-page__stack"
          :class="{
            'mailbox-page__stack--paper': activeTab === 'past',
            'mailbox-page__stack--sealed': activeTab === 'future',
          }"
          @click="handleEntryClick(entry)"
        >
          <view class="mailbox-page__item">
            <view class="mailbox-page__item-head">
              <view class="mailbox-page__item-badge">
                <view class="mailbox-page__item-dot"></view>
                <text class="mailbox-page__item-type">{{ formatTypeLabel(entry.type) }}</text>
              </view>
              <text class="mailbox-page__item-date">{{ formatDateLabel(entry) }}</text>
            </view>

            <template v-if="activeTab === 'past'">
              <text class="mailbox-page__item-title">{{ entry.title || "未命名" }}</text>
              <text class="mailbox-page__item-excerpt">{{ formatExcerpt(entry) }}</text>
              <view class="mailbox-page__item-foot">
                <text class="mailbox-page__item-meta">记录已收好</text>
                <text class="mailbox-page__item-arrow">›</text>
              </view>
            </template>

            <template v-else>
              <view class="mailbox-page__sealed-center">
                <view class="mailbox-page__sealed-icon">信</view>
                <text class="mailbox-page__sealed-title">{{ entry.title || "写给未来的信" }}</text>
              </view>
              <view class="mailbox-page__sealed-foot">
                <text class="mailbox-page__sealed-copy">{{ formatExcerpt(entry) }}</text>
                <view class="mailbox-page__sealed-wax"></view>
              </view>
            </template>
          </view>
        </view>
      </view>
    </scroll-view>

    <button class="mailbox-page__floating" @click="handleOpenJotting">写</button>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMailboxStore } from "@/app/store/useMailboxStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import type { Entry, EntryType } from "@/domain/entry/types";
import { ROUTES } from "@/shared/constants/routes";
import {
  formatMailboxDateLabel,
  formatMailboxExcerpt,
  formatMailboxTypeLabel,
} from "@/features/mailbox/mailboxDisplay";

const mailboxStore = useMailboxStore();
const activeTab = ref<"past" | "future">("past");

const currentEntries = computed(() =>
  activeTab.value === "past" ? mailboxStore.pastEntries : mailboxStore.sealedFutureEntries,
);

function isSealedFuture(entry: Entry): boolean {
  return entry.type === "future" && entry.status === "sealed";
}

function formatDateLabel(entry: Entry): string {
  return formatMailboxDateLabel(entry, activeTab.value);
}

function formatTypeLabel(type: EntryType): string {
  return formatMailboxTypeLabel(type);
}

function formatExcerpt(entry: Entry): string {
  return formatMailboxExcerpt(entry);
}

async function refresh() {
  await mailboxStore.refreshMailbox();
}

function handleGoHome() {
  uni.reLaunch({ url: `/${ROUTES.home}` });
}

function handleGoToCalendar() {
  uni.navigateTo({ url: `/${ROUTES.calendar}` });
}

function handleOpenJotting() {
  uni.navigateTo({ url: `/${ROUTES.editor}?type=jotting` });
}

function handleEntryClick(entry: Entry) {
  if (isSealedFuture(entry)) {
    void handleLockedFuture(entry);
    return;
  }

  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entry.id}`,
  });
}

onMounted(() => {
  void refresh();
});

async function handleLockedFuture(entry: Entry): Promise<void> {
  const shouldKeep = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: "尚未开启",
      content: `这封未来信会在 ${entry.unlockDate} 当天开启。你也可以现在销毁它。`,
      confirmText: "知道了",
      cancelText: "销毁",
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(true),
    });
  });

  if (shouldKeep) {
    return;
  }

  await mailboxStore.fetchEntryById(entry.id);
  const entryStore = useEntryStore();
  await entryStore.destroyEntry(entry.id);
  await refresh();

  uni.showToast({
    title: "已销毁",
    icon: "none",
  });
}
</script>

<style scoped>
.mailbox-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fbf9f5 0%, #f3efe8 100%);
  padding: 24rpx 28rpx 120rpx;
  position: relative;
}

.mailbox-page__topbar {
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  padding: 12rpx 0 28rpx;
}

.mailbox-page__nav-btn {
  width: 72rpx;
  height: 72rpx;
  background: transparent;
  color: rgba(49, 51, 46, 0.78);
  font-size: 34rpx;
  padding: 0;
}

.mailbox-page__nav-btn--icon {
  font-size: 18rpx;
  letter-spacing: 0.18em;
}

.mailbox-page__topbar-title {
  text-align: center;
  font-size: 20rpx;
  letter-spacing: 0.28em;
  color: rgba(49, 51, 46, 0.82);
}

.mailbox-page__tabs {
  display: flex;
  justify-content: center;
  gap: 48rpx;
  padding-bottom: 36rpx;
}

.mailbox-page__tab {
  background: transparent;
  padding: 0 0 12rpx;
  position: relative;
}

.mailbox-page__tab--active::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 28rpx;
  height: 2rpx;
  transform: translateX(-50%);
  background: rgba(95, 94, 94, 0.9);
}

.mailbox-page__tab-text {
  font-size: 18rpx;
  letter-spacing: 0.28em;
  color: rgba(99, 95, 85, 0.72);
}

.mailbox-page__tab--active .mailbox-page__tab-text {
  color: rgba(49, 51, 46, 0.92);
}

.mailbox-page__content {
  height: calc(100vh - 220rpx);
}

.mailbox-page__state {
  padding: 160rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.mailbox-page__state-text {
  font-size: 28rpx;
  line-height: 1.7;
  color: rgba(99, 95, 85, 0.74);
  text-align: center;
}

.mailbox-page__retry {
  min-height: 72rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(201, 203, 192, 0.6);
  color: #31332e;
  font-size: 24rpx;
}

.mailbox-page__list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  padding-bottom: 48rpx;
}

.mailbox-page__stack {
  position: relative;
}

.mailbox-page__stack::before,
.mailbox-page__stack::after {
  content: "";
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  height: 100%;
  z-index: 0;
}

.mailbox-page__stack--paper::before,
.mailbox-page__stack--paper::after {
  background: rgba(255, 255, 255, 0.88);
  border: 1rpx solid rgba(239, 238, 232, 0.9);
}

.mailbox-page__stack--paper::before {
  top: 8rpx;
  transform: rotate(-0.25deg);
}

.mailbox-page__stack--paper::after {
  top: 16rpx;
  transform: rotate(0.35deg);
}

.mailbox-page__stack--sealed::before,
.mailbox-page__stack--sealed::after {
  background: #f0ede6;
  border: 1rpx solid rgba(224, 221, 213, 0.9);
}

.mailbox-page__stack--sealed::before {
  top: 10rpx;
  transform: scale(0.99);
}

.mailbox-page__stack--sealed::after {
  top: 20rpx;
  transform: scale(0.98);
}

.mailbox-page__item {
  position: relative;
  z-index: 1;
  padding: 30rpx 28rpx;
  border: 1rpx solid rgba(239, 238, 232, 0.95);
  background: rgba(255, 255, 255, 0.96);
}

.mailbox-page__stack--sealed .mailbox-page__item {
  background: rgba(240, 237, 230, 0.96);
  border-color: rgba(224, 221, 213, 0.95);
}

.mailbox-page__item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.mailbox-page__item-badge {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.mailbox-page__item-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(177, 179, 171, 0.65);
}

.mailbox-page__item-type,
.mailbox-page__item-date,
.mailbox-page__item-meta {
  font-size: 16rpx;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(121, 124, 117, 0.82);
}

.mailbox-page__item-title {
  display: block;
  font-size: 34rpx;
  line-height: 1.45;
  color: #31332e;
  margin-bottom: 18rpx;
}

.mailbox-page__item-excerpt {
  display: block;
  font-size: 24rpx;
  line-height: 1.9;
  color: rgba(99, 95, 85, 0.84);
}

.mailbox-page__item-foot {
  margin-top: 28rpx;
  padding-top: 18rpx;
  border-top: 1rpx dashed rgba(201, 203, 192, 0.7);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mailbox-page__item-arrow {
  font-size: 28rpx;
  color: rgba(121, 124, 117, 0.58);
}

.mailbox-page__sealed-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
  padding: 30rpx 0 40rpx;
}

.mailbox-page__sealed-icon {
  font-size: 34rpx;
  color: rgba(99, 95, 85, 0.32);
}

.mailbox-page__sealed-title {
  font-size: 28rpx;
  letter-spacing: 0.18em;
  color: rgba(87, 83, 73, 0.88);
}

.mailbox-page__sealed-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22rpx;
}

.mailbox-page__sealed-copy {
  font-size: 20rpx;
  line-height: 1.6;
  color: rgba(99, 95, 85, 0.68);
  text-align: center;
}

.mailbox-page__sealed-wax {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(159, 64, 61, 0.24);
  background: rgba(159, 64, 61, 0.14);
}

.mailbox-page__floating {
  position: fixed;
  right: 28rpx;
  bottom: 36rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 2rpx;
  background: rgba(95, 94, 94, 0.92);
  color: #faf7f6;
  font-size: 30rpx;
  box-shadow: 0 14rpx 32rpx rgba(49, 51, 46, 0.18);
}
</style>
