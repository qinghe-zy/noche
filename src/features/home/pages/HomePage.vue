<template>
  <view class="home-page">
    <HomeHero />

    <view class="home-page__actions">
      <!-- Main Action: Today Diary -->
      <view class="home-page__section">
        <HomeActionCard 
          label="Write Today" 
          sub-label="Keep a record of your day" 
          size="large"
          @click="handleNavigate('editor', { type: 'diary' })"
        />
      </view>

      <!-- Secondary Actions: Jotting & Future Letter -->
      <view class="home-page__row">
        <HomeActionCard 
          label="Quick Jotting" 
          sub-label="Instant thoughts" 
          size="small"
          @click="handleNavigate('editor', { type: 'jotting' })"
        />
        <HomeActionCard 
          label="To Future" 
          sub-label="Send a message later" 
          size="small"
          @click="handleNavigate('editor', { type: 'future' })"
        />
      </view>
    </view>

    <view class="home-page__footer">
      <view class="home-page__footer-item" @click="handleNavigate('mailbox')">
        <view class="home-page__footer-icon">M</view>
        <text class="home-page__footer-label">Mailbox</text>
      </view>
      <view class="home-page__footer-item" @click="handleNavigate('profile')">
        <view class="home-page__footer-icon">P</view>
        <text class="home-page__footer-label">Profile</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import HomeHero from "../components/HomeHero.vue";
import HomeActionCard from "../components/HomeActionCard.vue";
import { ROUTES } from "@/shared/constants/routes";

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
  font-size: 40rpx;
  line-height: 48rpx;
  text-align: center;
  color: var(--noche-color-text);
}

.home-page__footer-label {
  font-size: 24rpx;
  color: var(--noche-color-muted);
}
</style>
