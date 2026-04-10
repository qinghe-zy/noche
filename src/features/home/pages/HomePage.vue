<template>
  <view class="home-page">
    <HomeHero />

    <view class="home-page__actions">
      <!-- Main Action: Today Diary -->
      <view class="home-page__section">
        <HomeActionCard 
          label="打开今日信纸" 
          sub-label="写下今天，收好今天" 
          size="large"
          @click="handleNavigate('editor', { type: 'diary' })"
        />
      </view>

      <!-- Secondary Actions: Jotting & Future Letter -->
      <view class="home-page__row">
        <HomeActionCard 
          label="随手记一笔" 
          sub-label="记下灵光和碎片" 
          size="small"
          @click="handleOpenJotting"
        />
        <HomeActionCard 
          label="写给未来" 
          sub-label="留到以后再打开" 
          size="small"
          @click="handleNavigate('editor', { type: 'future' })"
        />
      </view>
    </view>

    <view class="home-page__footer">
      <view class="home-page__footer-item" @click="handleNavigate('mailbox')">
        <view class="home-page__footer-icon">信</view>
        <text class="home-page__footer-label">信箱</text>
      </view>
      <view class="home-page__footer-item" @click="handleNavigate('profile')">
        <view class="home-page__footer-icon">我</view>
        <text class="home-page__footer-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import HomeHero from "../components/HomeHero.vue";
import HomeActionCard from "../components/HomeActionCard.vue";
import { ROUTES } from "@/shared/constants/routes";
import { useDraftStore } from "@/app/store/useDraftStore";
import { resolveDraftSaveAction } from "@/domain/services/entryService";

const draftStore = useDraftStore();

const handleNavigate = (routeKey: keyof typeof ROUTES, query?: Record<string, string>) => {
  let url = `/${ROUTES[routeKey]}`;
  if (query) {
    const queryString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    url += `?${queryString}`;
  }
  
  uni.navigateTo({
    url
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
  background: var(--noche-color-bg);
  padding: 0 40rpx 80rpx;
  display: flex;
  flex-direction: column;
}

.home-page__actions {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  margin-top: 40rpx;
}

.home-page__row {
  display: flex;
  gap: 32rpx;
}

.home-page__footer {
  margin-top: auto;
  padding: 80rpx 0 40rpx;
  display: flex;
  justify-content: center;
  gap: 120rpx;
}

.home-page__footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.home-page__footer-item:active {
  opacity: 1;
}

.home-page__footer-icon {
  width: 48rpx;
  height: 48rpx;
  border: 1rpx solid var(--noche-color-border);
  border-radius: 50%;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 48rpx;
  text-align: center;
  color: var(--noche-color-text);
}

.home-page__footer-label {
  font-size: 24rpx;
  color: var(--noche-color-muted);
}
</style>
