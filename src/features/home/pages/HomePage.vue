<template>
  <view class="home-page">
    <view class="home-page__header">
      <view class="home-page__header-spacer"></view>
      <text class="home-page__title">见 字 如 面</text>
      <button class="home-page__avatar" @click="handleNavigate('profile')">
        <text class="home-page__avatar-text">我</text>
      </button>
    </view>

    <view class="home-page__center">
      <button class="home-page__paper" @click="handleNavigate('editor', { type: 'diary' })">
        <view class="home-page__paper-frame">
          <view class="home-page__paper-mark"></view>
          <view class="home-page__paper-content">
            <text class="home-page__paper-icon">·</text>
            <text class="home-page__paper-heading">打开今日信纸</text>
            <text class="home-page__paper-subtitle">写下今天，收好今天</text>
          </view>
          <view class="home-page__paper-seal"></view>
        </view>
      </button>
    </view>

    <view class="home-page__dock">
      <button class="home-page__dock-item" @click="handleOpenJotting">
        <view class="home-page__dock-icon">记</view>
        <text class="home-page__dock-label">随笔</text>
      </button>
      <button class="home-page__dock-item" @click="handleNavigate('editor', { type: 'future' })">
        <view class="home-page__dock-icon">信</view>
        <text class="home-page__dock-label">未来信</text>
      </button>
      <button class="home-page__dock-item" @click="handleNavigate('mailbox')">
        <view class="home-page__dock-icon">箱</view>
        <text class="home-page__dock-label">邮箱</text>
      </button>
    </view>

    <view class="home-page__footer">
      <text class="home-page__footer-text">{{ footerMark }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import { ROUTES } from "@/shared/constants/routes";
import { useDraftStore } from "@/app/store/useDraftStore";
import { resolveDraftSaveAction } from "@/domain/services/entryService";

const draftStore = useDraftStore();
const footerMark = computed(() => `${dayjs().format("YYYY年MM月")} · 安静书写`);

const handleNavigate = (routeKey: keyof typeof ROUTES, query?: Record<string, string>) => {
  let url = `/${ROUTES[routeKey]}`;
  if (query) {
    const queryString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    url += `?${queryString}`;
  }

  uni.navigateTo({
    url,
  });
};

const handleOpenJotting = async () => {
  const existingDraft = await draftStore.peekDraft({
    type: "jotting",
  });

  if (!existingDraft || resolveDraftSaveAction(existingDraft) !== "save-entry") {
    handleNavigate("editor", { type: "jotting" });
    return;
  }

  const tapIndex = await new Promise<number>((resolve) => {
    uni.showActionSheet({
      itemList: ["继续上次", "另起一张", "取消"],
      success: (result) => resolve(result.tapIndex),
      fail: () => resolve(2),
    });
  });

  if (tapIndex === 0) {
    handleNavigate("editor", { type: "jotting" });
    return;
  }

  if (tapIndex === 1) {
    await draftStore.removeDraft(existingDraft.slotKey);
    uni.showToast({
      title: "上一张未封存随笔已放下",
      icon: "none",
    });
    handleNavigate("editor", { type: "jotting" });
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 28rpx 32rpx 40rpx;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.6), transparent 38%),
    linear-gradient(180deg, #fdfbf7 0%, #f7f3ed 100%);
  display: flex;
  flex-direction: column;
}

.home-page__header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding-top: 18rpx;
}

.home-page__header-spacer {
  width: 72rpx;
  height: 72rpx;
}

.home-page__title {
  text-align: center;
  font-size: 34rpx;
  line-height: 1.2;
  color: rgba(44, 46, 42, 0.9);
  letter-spacing: 0.42em;
}

.home-page__avatar {
  justify-self: end;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(34, 34, 34, 0.08);
  background: rgba(255, 255, 255, 0.82);
  color: #2c2e2a;
  padding: 0;
}

.home-page__avatar-text {
  font-size: 26rpx;
  line-height: 72rpx;
}

.home-page__center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0 32rpx;
}

.home-page__paper {
  width: 100%;
  max-width: 620rpx;
  min-height: 920rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.38);
  border: 1rpx solid rgba(218, 212, 199, 0.5);
  box-shadow:
    0 20rpx 80rpx rgba(86, 83, 75, 0.08),
    inset 0 0 0 1rpx rgba(255, 255, 255, 0.4);
}

.home-page__paper-frame {
  min-height: 872rpx;
  border: 1rpx solid rgba(225, 220, 211, 0.6);
  background: rgba(255, 255, 255, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.home-page__paper-mark,
.home-page__paper-seal {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(177, 179, 171, 0.7);
}

.home-page__paper-mark {
  top: 96rpx;
  opacity: 0.28;
}

.home-page__paper-seal {
  bottom: 96rpx;
  opacity: 0.28;
}

.home-page__paper-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
  color: #31332e;
}

.home-page__paper-icon {
  font-size: 48rpx;
  color: rgba(99, 95, 85, 0.26);
}

.home-page__paper-heading {
  font-size: 52rpx;
  line-height: 1.3;
  letter-spacing: 0.18em;
}

.home-page__paper-subtitle {
  font-size: 18rpx;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: rgba(138, 140, 130, 0.72);
}

.home-page__dock {
  display: flex;
  justify-content: center;
  gap: 44rpx;
  padding-bottom: 32rpx;
}

.home-page__dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  background: transparent;
  padding: 0;
  color: #5d605a;
}

.home-page__dock-icon {
  width: 88rpx;
  height: 88rpx;
  border: 1rpx solid rgba(201, 203, 192, 0.56);
  background: rgba(255, 255, 255, 0.64);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  letter-spacing: 0.1em;
}

.home-page__dock-label {
  font-size: 18rpx;
  letter-spacing: 0.22em;
  color: rgba(99, 95, 85, 0.86);
}

.home-page__footer {
  padding-top: 8rpx;
  text-align: center;
}

.home-page__footer-text {
  font-size: 16rpx;
  letter-spacing: 0.38em;
  color: rgba(177, 179, 171, 0.86);
}
</style>
