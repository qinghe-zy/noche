<template>
  <view class="mailbox-page">
    <view class="mailbox-page__header">
      <view class="mailbox-page__title-group">
        <text class="mailbox-page__title">信箱</text>
        <text class="mailbox-page__subtitle">已经收好的记录，与仍在等待开启的信。</text>
      </view>
      <view class="mailbox-page__header-actions">
        <button class="mailbox-page__icon-button" @click="handleGoToCalendar">
          <text class="mailbox-page__icon-text">日历</text>
        </button>
      </view>
    </view>

    <view class="mailbox-page__tabs">
      <view 
        class="mailbox-page__tab" 
        :class="{ 'mailbox-page__tab--active': activeTab === 'past' }"
        @click="activeTab = 'past'"
      >
        <text class="mailbox-page__tab-text">往日信件</text>
        <view v-if="activeTab === 'past'" class="mailbox-page__tab-line" />
      </view>
      <view 
        class="mailbox-page__tab" 
        :class="{ 'mailbox-page__tab--active': activeTab === 'future' }"
        @click="activeTab = 'future'"
      >
        <text class="mailbox-page__tab-text">待启之信</text>
        <view v-if="activeTab === 'future'" class="mailbox-page__tab-line" />
      </view>
    </view>

    <scroll-view scroll-y class="mailbox-page__content">
      <view v-if="mailboxStore.isLoading" class="mailbox-page__state">
        <text class="mailbox-page__state-text">正在整理信箱…</text>
      </view>

      <view v-else-if="mailboxStore.error" class="mailbox-page__state mailbox-page__state--error">
        <text class="mailbox-page__state-text">{{ mailboxStore.error }}</text>
        <button class="mailbox-page__retry-button" @click="refresh">Retry</button>
      </view>

      <view v-else-if="currentEntries.length === 0" class="mailbox-page__state">
        <text class="mailbox-page__state-text">这里暂时还没有内容。</text>
      </view>

      <view v-else class="mailbox-page__list">
        <view 
          v-for="entry in currentEntries" 
          :key="entry.id" 
          class="mailbox-page__item"
          @click="handleEntryClick(entry)"
        >
          <view class="mailbox-page__item-header">
            <text class="mailbox-page__item-date">{{ formatDateLabel(entry) }}</text>
            <text v-if="entry.type !== 'jotting'" class="mailbox-page__item-type">{{ entry.type }}</text>
          </view>
          
          <text class="mailbox-page__item-title">{{ entry.title || "未命名" }}</text>
          
          <view class="mailbox-page__item-body">
            <text v-if="isSealedFuture(entry)" class="mailbox-page__item-excerpt mailbox-page__item-excerpt--sealed">
              这封未来信会在 {{ entry.unlockDate }} 当天开启。
            </text>
            <text v-else class="mailbox-page__item-excerpt">
              {{ entry.content.slice(0, 100) }}{{ entry.content.length > 100 ? '...' : '' }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMailboxStore } from '@/app/store/useMailboxStore';
import type { Entry } from '@/domain/entry/types';
import { formatDate } from '@/shared/utils/date';
import { ROUTES } from '@/shared/constants/routes';

const mailboxStore = useMailboxStore();
const activeTab = ref<'past' | 'future'>('past');

const currentEntries = computed(() => {
  return activeTab.value === 'past' 
    ? mailboxStore.pastEntries 
    : mailboxStore.sealedFutureEntries;
});

function isSealedFuture(entry: Entry): boolean {
  return entry.type === 'future' && entry.status === 'sealed';
}

function formatDateLabel(entry: Entry): string {
  if (entry.type === 'future') {
    return activeTab.value === 'past' 
      ? `Unlocked ${formatDate(entry.recordDate, 'MMM DD, YYYY')}`
      : `Unlocks ${entry.unlockDate}`;
  }
  return formatDate(entry.recordDate, 'MMM DD, YYYY');
}

async function refresh() {
  await mailboxStore.refreshMailbox();
}

function handleGoToCalendar() {
  uni.navigateTo({ url: `/${ROUTES.calendar}` });
}

function handleEntryClick(entry: Entry) {
  if (isSealedFuture(entry)) {
    uni.showModal({
      title: '尚未开启',
      content: `这封未来信会在 ${entry.unlockDate} 当天开启。`,
      showCancel: false,
      confirmText: '知道了'
    });
    return;
  }
  
  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entry.id}`
  });
}

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.mailbox-page {
  min-height: 100vh;
  background-color: var(--noche-color-bg);
  display: flex;
  flex-direction: column;
}

.mailbox-page__header {
  padding: 80rpx 40rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.mailbox-page__title {
  font-size: 64rpx;
  font-weight: 600;
  color: var(--noche-color-text);
  line-height: 1.2;
}

.mailbox-page__subtitle {
  font-size: 26rpx;
  color: var(--noche-color-muted);
  margin-top: 8rpx;
}

.mailbox-page__icon-button {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: white;
  border: 1rpx solid var(--noche-color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.mailbox-page__icon-text {
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.mailbox-page__tabs {
  display: flex;
  padding: 0 40rpx;
  gap: 48rpx;
  border-bottom: 1rpx solid var(--noche-color-border);
}

.mailbox-page__tab {
  padding: 24rpx 0;
  position: relative;
}

.mailbox-page__tab-text {
  font-size: 28rpx;
  color: var(--noche-color-muted);
  font-weight: 500;
  transition: color 0.2s;
}

.mailbox-page__tab--active .mailbox-page__tab-text {
  color: var(--noche-color-text);
}

.mailbox-page__tab-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background-color: var(--noche-color-text);
  border-radius: 2rpx;
}

.mailbox-page__content {
  flex: 1;
  overflow: hidden;
}

.mailbox-page__state {
  padding: 120rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.mailbox-page__state-text {
  font-size: 28rpx;
  color: var(--noche-color-muted);
  text-align: center;
}

.mailbox-page__retry-button {
  font-size: 24rpx;
  padding: 12rpx 32rpx;
  background: white;
  border: 1rpx solid var(--noche-color-border);
  border-radius: 999rpx;
}

.mailbox-page__list {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.mailbox-page__item {
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid var(--noche-color-border);
}

.mailbox-page__item:last-child {
  border-bottom: none;
}

.mailbox-page__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.mailbox-page__item-date {
  font-size: 22rpx;
  color: var(--noche-color-muted);
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.mailbox-page__item-type {
  font-size: 20rpx;
  color: var(--noche-color-muted);
  background: #eee;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  text-transform: uppercase;
}

.mailbox-page__item-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--noche-color-text);
  margin-bottom: 12rpx;
  display: block;
}

.mailbox-page__item-excerpt {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--noche-color-muted);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.mailbox-page__item-excerpt--sealed {
  font-style: italic;
  opacity: 0.6;
}
</style>
