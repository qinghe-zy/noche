<template>
  <view class="profile-page">
    <view class="profile-page__topbar">
      <TopbarIconButton @tap="handleGoBack" />
      <text class="profile-page__title">我的角落</text>
      <view class="profile-page__topbar-spacer"></view>
    </view>

    <view class="profile-page__content">
      <view class="profile-page__portrait">
        <view class="profile-page__portrait-ring">
          <view class="profile-page__avatar">夜</view>
        </view>
        <text class="profile-page__name">夜书人</text>
        <text class="profile-page__signature">把今天收好，也给未来留一封信。</text>
      </view>

      <view v-if="settingsStore.error || mailboxStore.error" class="profile-page__banner">
        <text>{{ settingsStore.error ?? mailboxStore.error }}</text>
      </view>

      <view class="profile-page__stats-card">
        <view class="profile-page__stat">
          <text class="profile-page__stat-value">{{ diaryCount }}</text>
          <text class="profile-page__stat-label">日记</text>
        </view>
        <view class="profile-page__stat-divider"></view>
        <view class="profile-page__stat">
          <text class="profile-page__stat-value">{{ futureCount }}</text>
          <text class="profile-page__stat-label">未来信</text>
        </view>
        <view class="profile-page__stat-divider"></view>
        <view class="profile-page__stat">
          <text class="profile-page__stat-value">{{ mailboxCount }}</text>
          <text class="profile-page__stat-label">信箱</text>
        </view>
      </view>

      <view class="profile-page__menu">
        <view class="profile-page__menu-group">
          <view class="profile-page__menu-item profile-page__menu-item--stack">
            <view class="profile-page__menu-copy">
              <text class="profile-page__menu-label">外观设置</text>
              <text class="profile-page__menu-note">选择当前设备下最舒服的阅读方式。</text>
            </view>
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

          <view class="profile-page__menu-item profile-page__menu-item--stack">
            <view class="profile-page__menu-copy">
              <text class="profile-page__menu-label">每周起始日</text>
              <text class="profile-page__menu-note">影响日历视图的排布与阅读习惯。</text>
            </view>
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
        </view>

        <view class="profile-page__menu-group">
          <view class="profile-page__menu-item profile-page__menu-item--stack">
            <view class="profile-page__menu-copy">
              <text class="profile-page__menu-label">隐私锁</text>
              <text class="profile-page__menu-note">主验收设备优先保证恢复与静默暂存体验。</text>
            </view>
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

          <view class="profile-page__menu-item">
            <view class="profile-page__menu-copy">
              <text class="profile-page__menu-label">语言</text>
              <text class="profile-page__menu-note">当前版本以中文书写体验为主。</text>
            </view>
            <text class="profile-page__menu-value">{{ localeLabel }}</text>
          </view>

          <view class="profile-page__menu-item">
            <view class="profile-page__menu-copy">
              <text class="profile-page__menu-label">数据备份</text>
              <text class="profile-page__menu-note">本地优先，云备份后续开放。</text>
            </view>
            <text class="profile-page__menu-value">稍后开放</text>
          </view>

          <view class="profile-page__menu-item">
            <view class="profile-page__menu-copy">
              <text class="profile-page__menu-label">关于 noche</text>
              <text class="profile-page__menu-note">Android / local-first / 私人写信。</text>
            </view>
            <text class="profile-page__menu-value">v1 草案</text>
          </view>
        </view>
      </view>

      <view class="profile-page__footer">
        <view class="profile-page__footer-line"></view>
        <text class="profile-page__footer-copy">岁月安好，纸短情长</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useMailboxStore } from "@/app/store/useMailboxStore";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

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

function handleGoBack(): void {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({
        url: "/pages/index/index",
        fail: () => {
          uni.reLaunch({
            url: "/pages/index/index",
          });
        },
      });
    },
  });
}

onMounted(() => {
  void settingsStore.hydrate();
  void mailboxStore.refreshMailbox();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(224, 214, 194, 0.26), transparent 28%),
    #fbf9f5;
}

.profile-page__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 28rpx 32rpx 24rpx;
}

.profile-page__chip {
  border: none;
  background: transparent;
  line-height: 1;
}

.profile-page__title {
  font-size: 30rpx;
  letter-spacing: 6rpx;
  color: #31332e;
}

.profile-page__topbar-spacer {
  width: 72rpx;
  height: 72rpx;
}

.profile-page__content {
  max-width: 720rpx;
  margin: 0 auto;
  padding: 12rpx 30rpx 72rpx;
}

.profile-page__portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14rpx;
  margin-bottom: 54rpx;
}

.profile-page__portrait-ring {
  width: 150rpx;
  height: 150rpx;
  padding: 8rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12rpx 30rpx rgba(49, 51, 46, 0.04);
}

.profile-page__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #6a6763, #31332e 72%);
  color: #faf7f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  letter-spacing: 6rpx;
}

.profile-page__name {
  font-size: 44rpx;
  color: #31332e;
}

.profile-page__signature {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(93, 96, 90, 0.92);
  letter-spacing: 4rpx;
}

.profile-page__banner {
  margin-bottom: 28rpx;
  padding: 18rpx 22rpx;
  background: rgba(159, 64, 61, 0.1);
  color: #8a3d3a;
  font-size: 24rpx;
  line-height: 1.6;
}

.profile-page__stats-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
  padding: 30rpx 28rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12rpx 28rpx rgba(49, 51, 46, 0.04);
  margin-bottom: 46rpx;
}

.profile-page__stat {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.profile-page__stat-value {
  font-size: 40rpx;
  color: #31332e;
}

.profile-page__stat-label,
.profile-page__footer-copy {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  color: rgba(93, 96, 90, 0.82);
}

.profile-page__stat-divider {
  width: 1rpx;
  height: 54rpx;
  background: rgba(177, 179, 171, 0.3);
}

.profile-page__menu {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.profile-page__menu-group {
  background: rgba(255, 255, 255, 0.9);
  padding: 8rpx 0;
}

.profile-page__menu-item {
  padding: 24rpx 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.profile-page__menu-item--stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.profile-page__menu-item + .profile-page__menu-item {
  border-top: 1rpx solid rgba(177, 179, 171, 0.18);
}

.profile-page__menu-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.profile-page__menu-label {
  font-size: 28rpx;
  color: #31332e;
}

.profile-page__menu-note,
.profile-page__menu-value {
  font-size: 22rpx;
  line-height: 1.7;
  color: rgba(93, 96, 90, 0.9);
}

.profile-page__menu-value {
  white-space: nowrap;
}

.profile-page__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding-top: 8rpx;
}

.profile-page__chip {
  min-height: 66rpx;
  padding: 0 24rpx;
  font-size: 22rpx;
  color: rgba(93, 96, 90, 0.92);
  border: 1rpx solid rgba(177, 179, 171, 0.32);
}

.profile-page__chip--active {
  background: #5f5e5e;
  color: #faf7f6;
  border-color: #5f5e5e;
}

.profile-page__footer {
  margin-top: 74rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.profile-page__footer-line {
  width: 120rpx;
  height: 1rpx;
  background: rgba(177, 179, 171, 0.42);
}
</style>
