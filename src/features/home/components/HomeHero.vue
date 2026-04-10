<template>
  <view class="home-hero">
    <view class="home-hero__date-box">
      <text class="home-hero__day">{{ day }}</text>
      <text class="home-hero__date-info">{{ dateInfo }}</text>
    </view>
    <view class="home-hero__greeting">
      <text class="home-hero__greeting-text">{{ greeting }}</text>
      <view class="home-hero__moon"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";

const day = computed(() => dayjs().format("DD"));
const dateInfo = computed(() => dayjs().format("MMM. YYYY / dddd"));

const greeting = computed(() => {
  const hour = dayjs().hour();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});
</script>

<style scoped>
.home-hero {
  padding: 80rpx 40rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.home-hero__date-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.home-hero__day {
  font-size: 120rpx;
  font-weight: 200;
  line-height: 1;
  color: var(--noche-color-text);
  letter-spacing: 0;
}

.home-hero__date-info {
  font-size: 24rpx;
  color: var(--noche-color-muted);
  text-transform: uppercase;
  letter-spacing: 0;
  margin-top: 8rpx;
}

.home-hero__greeting {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 12rpx;
}

.home-hero__greeting-text {
  font-size: 32rpx;
  font-style: italic;
  color: var(--noche-color-text);
  opacity: 0.8;
}

.home-hero__moon {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  box-shadow: 6rpx 2rpx 0 0 var(--noche-color-text);
  transform: rotate(-20deg);
}
</style>
