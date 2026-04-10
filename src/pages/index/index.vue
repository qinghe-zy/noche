<template>
  <view class="page">
    <text class="title">noche initialized</text>
    <text class="desc">Minimal Uni-app scaffold is ready.</text>
  </view>
</template>

<script setup lang="ts"></script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 48rpx;
  background: var(--noche-color-bg);
}

.title {
  font-size: 40rpx;
  color: var(--noche-color-text);
  font-weight: 600;
}

.desc {
  font-size: 28rpx;
  color: #666666;
}
</style>
