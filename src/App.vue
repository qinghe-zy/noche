<template>
  <view class="app-shell">
    <view v-if="appStore.isPrivacyLocked" class="privacy-lock">
      <view class="privacy-lock__panel">
        <text class="privacy-lock__eyebrow">隐私锁</text>
        <text class="privacy-lock__title">已为你暂时遮住纸页</text>
        <text class="privacy-lock__description">
          回到前台后，需要先解锁，才会恢复离开前的页面和草稿。
        </text>
        <button class="privacy-lock__button" @click="appStore.unlockPrivacy()">
          解锁继续
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";

const appStore = useAppStore();
const settingsStore = useSettingsStore();

onLaunch(() => {
  if (settingsStore.privacyLockEnabled) {
    appStore.lockPrivacy();
  }
});

onShow(() => {
  if (settingsStore.privacyLockEnabled) {
    appStore.lockPrivacy();
  }
});

onHide(() => {
  if (settingsStore.privacyLockEnabled) {
    appStore.lockPrivacy();
  }
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.privacy-lock {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: rgba(17, 17, 17, 0.78);
  backdrop-filter: blur(18rpx);
}

.privacy-lock__panel {
  width: 100%;
  max-width: 620rpx;
  padding: 40rpx 32rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(34, 34, 34, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  text-align: center;
}

.privacy-lock__eyebrow {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  color: rgba(34, 34, 34, 0.56);
}

.privacy-lock__title {
  font-size: 42rpx;
  line-height: 1.2;
  font-weight: 600;
  color: #1d1d1d;
}

.privacy-lock__description {
  font-size: 28rpx;
  line-height: 1.7;
  color: rgba(34, 34, 34, 0.68);
}

.privacy-lock__button {
  min-height: 88rpx;
  margin-top: 8rpx;
  border: none;
  border-radius: 999rpx;
  background: #1f1f1f;
  color: #faf7f2;
  font-size: 28rpx;
}
</style>
