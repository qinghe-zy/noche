<template>
  <view 
    class="home-action-card" 
    :class="[`home-action-card--${size}`]"
    @click="$emit('click')"
  >
    <view class="home-action-card__inner">
      <view class="home-action-card__content">
        <text class="home-action-card__label">{{ label }}</text>
        <text class="home-action-card__sub-label">{{ subLabel }}</text>
      </view>
      <view class="home-action-card__arrow">
        <text>→</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  subLabel: string;
  size?: 'large' | 'small';
}>();

defineEmits(['click']);
</script>

<style scoped>
.home-action-card {
  width: 100%;
  padding: var(--noche-space-4);
  background: #ffffff;
  border: 1rpx solid var(--noche-color-border);
  border-radius: 2rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.home-action-card:active {
  background: #fdfdfd;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.01);
  transform: translateY(2rpx);
}

.home-action-card--large {
  padding: 60rpx 40rpx;
}

.home-action-card--small {
  padding: 32rpx 24rpx;
  flex: 1;
}

.home-action-card__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home-action-card__label {
  display: block;
  font-size: 36rpx;
  font-weight: 500;
  color: var(--noche-color-text);
  margin-bottom: 4rpx;
}

.home-action-card__sub-label {
  display: block;
  font-size: 24rpx;
  color: var(--noche-color-muted);
  font-style: italic;
  opacity: 0.7;
}

.home-action-card__arrow {
  font-size: 40rpx;
  color: var(--noche-color-muted);
  opacity: 0.3;
}
</style>
