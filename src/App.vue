<template>
  <view class="app-shell">
    <view v-if="appStore.isPrivacyLocked" class="privacy-lock">
      <view class="privacy-lock__panel">
        <text class="privacy-lock__eyebrow">{{ copy.app.privacyLock }}</text>
        <text class="privacy-lock__title">{{ copy.app.lockedTitle }}</text>
        <text class="privacy-lock__description">{{ copy.app.lockedDescription }}</text>
        <button class="privacy-lock__button" @click="appStore.unlockPrivacy()">
          {{ copy.app.unlock }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { t } from "@/shared/i18n";
import { applyThemeMode } from "@/shared/theme";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));

watch(
  () => settingsStore.theme,
  (theme) => {
    applyThemeMode(theme);
  },
  {
    immediate: true,
  },
);

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

<style>
:root,
page,
body,
.uni-app,
.uni-page-body {
  --noche-bg: #fbf9f5;
  --noche-surface: rgba(252, 248, 241, 0.98);
  --noche-panel: #ffffff;
  --noche-text: #31332e;
  --noche-muted: rgba(99, 95, 85, 0.8);
  --noche-border: rgba(221, 212, 200, 0.72);
  --noche-overlay: rgba(44, 46, 42, 0.24);
  background: var(--noche-bg);
  color: var(--noche-text);
}

[data-theme="dark"] {
  --noche-bg: #171716;
  --noche-surface: rgba(30, 30, 29, 0.98);
  --noche-panel: #222220;
  --noche-text: #f1ede6;
  --noche-muted: rgba(224, 218, 208, 0.72);
  --noche-border: rgba(117, 110, 101, 0.48);
  --noche-overlay: rgba(6, 6, 6, 0.5);
}
</style>

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
  background: var(--noche-surface);
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
  color: var(--noche-muted);
}

.privacy-lock__title {
  font-size: 42rpx;
  line-height: 1.2;
  font-weight: 600;
  color: var(--noche-text);
}

.privacy-lock__description {
  font-size: 28rpx;
  line-height: 1.7;
  color: var(--noche-muted);
}

.privacy-lock__button {
  min-height: 88rpx;
  margin-top: 8rpx;
  border: none;
  border-radius: 999rpx;
  background: var(--noche-text);
  color: var(--noche-bg);
  font-size: 28rpx;
}
</style>
