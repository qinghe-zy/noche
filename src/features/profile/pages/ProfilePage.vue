<template>
  <view class="profile-page">
    <view class="profile-page__hero">
      <view class="profile-page__avatar">夜</view>
      <view class="profile-page__identity">
        <text class="profile-page__name">夜书人</text>
        <text class="profile-page__signature">把今天收好，也给未来留一封信。</text>
      </view>
    </view>

    <view v-if="settingsStore.error || mailboxStore.error" class="profile-page__banner profile-page__banner--error">
      <text>{{ settingsStore.error ?? mailboxStore.error }}</text>
    </view>

    <view class="profile-page__section">
      <text class="profile-page__section-title">轻统计</text>
      <view class="profile-page__stats">
        <view class="profile-page__stat-card">
          <text class="profile-page__stat-value">{{ diaryCount }}</text>
          <text class="profile-page__stat-label">日记</text>
        </view>
        <view class="profile-page__stat-card">
          <text class="profile-page__stat-value">{{ futureCount }}</text>
          <text class="profile-page__stat-label">未来信</text>
        </view>
        <view class="profile-page__stat-card">
          <text class="profile-page__stat-value">{{ mailboxCount }}</text>
          <text class="profile-page__stat-label">信箱</text>
        </view>
      </view>
    </view>

    <view class="profile-page__section">
      <text class="profile-page__section-title">外观</text>
      <view class="profile-page__setting-block">
        <text class="profile-page__setting-label">主题</text>
        <view class="profile-page__chips">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="profile-page__chip"
            :class="{ 'profile-page__chip--active': settingsStore.theme === option.value }"
            @click="settingsStore.setTheme(option.value)"
          >
            {{ option.label }}
          </button>
        </view>
      </view>

      <view class="profile-page__setting-block">
        <text class="profile-page__setting-label">每周起始日</text>
        <view class="profile-page__chips">
          <button
            v-for="option in weekOptions"
            :key="String(option.value)"
            class="profile-page__chip"
            :class="{ 'profile-page__chip--active': settingsStore.weekStartsOn === option.value }"
            @click="settingsStore.setWeekStartsOn(option.value)"
          >
            {{ option.label }}
          </button>
        </view>
      </view>

      <view class="profile-page__setting-row">
        <text class="profile-page__setting-label">语言</text>
        <text class="profile-page__setting-value">{{ localeLabel }}</text>
      </view>
    </view>

    <view class="profile-page__section">
      <text class="profile-page__section-title">隐私与数据</text>
      <view class="profile-page__setting-block">
        <text class="profile-page__setting-label">隐私锁</text>
        <view class="profile-page__chips">
          <button
            v-for="option in privacyLockOptions"
            :key="option.label"
            class="profile-page__chip"
            :class="{ 'profile-page__chip--active': settingsStore.privacyLockEnabled === option.value }"
            @click="settingsStore.setPrivacyLockEnabled(option.value)"
          >
            {{ option.label }}
          </button>
        </view>
      </view>
      <view class="profile-page__setting-row">
        <text class="profile-page__setting-label">数据备份</text>
        <text class="profile-page__setting-value">本地优先，云备份后续开放</text>
      </view>
      <view class="profile-page__setting-row">
        <text class="profile-page__setting-label">关于 noche</text>
        <text class="profile-page__setting-value">Android / local-first / 私人写信</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useMailboxStore } from "@/app/store/useMailboxStore";

const settingsStore = useSettingsStore();
const mailboxStore = useMailboxStore();

const themeOptions = [
  { value: "system" as const, label: "跟随系统" },
  { value: "light" as const, label: "浅色" },
  { value: "dark" as const, label: "深色" },
];

const weekOptions = [
  { value: 1 as const, label: "周一开始" },
  { value: 0 as const, label: "周日开始" },
];
const privacyLockOptions = [
  { value: true, label: "已开启" },
  { value: false, label: "未开启" },
];

const mailboxCount = computed(() => mailboxStore.pastEntries.length + mailboxStore.sealedFutureEntries.length);
const diaryCount = computed(() => mailboxStore.pastEntries.filter((entry) => entry.type === "diary").length);
const futureCount = computed(
  () =>
    mailboxStore.pastEntries.filter((entry) => entry.type === "future").length
    + mailboxStore.sealedFutureEntries.length,
);
const localeLabel = computed(() => (settingsStore.locale === "zh-CN" ? "简体中文" : settingsStore.locale));

onMounted(() => {
  void settingsStore.hydrate();
  void mailboxStore.refreshMailbox();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 56rpx 32rpx 72rpx;
  background:
    radial-gradient(circle at top right, rgba(178, 158, 119, 0.12), transparent 30%),
    linear-gradient(180deg, #f8f4ef 0%, #f3eee8 100%);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.profile-page__hero,
.profile-page__section,
.profile-page__banner {
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(34, 34, 34, 0.06);
}

.profile-page__hero {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.profile-page__avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #1f1f1f;
  color: #faf7f2;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 96rpx;
  text-align: center;
}

.profile-page__identity {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.profile-page__name {
  font-size: 38rpx;
  font-weight: 600;
  color: #1d1d1d;
}

.profile-page__signature {
  font-size: 26rpx;
  line-height: 1.6;
  color: rgba(34, 34, 34, 0.68);
}

.profile-page__banner {
  font-size: 24rpx;
  color: #7d3535;
  background: rgba(136, 49, 49, 0.08);
}

.profile-page__section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.profile-page__section-title {
  font-size: 24rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  color: rgba(34, 34, 34, 0.58);
}

.profile-page__stats {
  display: flex;
  gap: 16rpx;
}

.profile-page__stat-card {
  min-width: 0;
  flex: 1;
  padding: 22rpx 18rpx;
  border-radius: 22rpx;
  background: rgba(248, 244, 239, 0.92);
}

.profile-page__stat-value {
  display: block;
  font-size: 42rpx;
  font-weight: 600;
  color: #1d1d1d;
}

.profile-page__stat-label {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(34, 34, 34, 0.62);
}

.profile-page__setting-block {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.profile-page__setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}

.profile-page__setting-label {
  font-size: 28rpx;
  color: #1d1d1d;
}

.profile-page__setting-value {
  font-size: 24rpx;
  text-align: right;
  color: rgba(34, 34, 34, 0.62);
}

.profile-page__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.profile-page__chip {
  min-height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(34, 34, 34, 0.08);
  background: rgba(255, 255, 255, 0.76);
  color: rgba(34, 34, 34, 0.68);
  font-size: 24rpx;
}

.profile-page__chip--active {
  background: #1f1f1f;
  color: #faf7f2;
}
</style>
