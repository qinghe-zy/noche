<template>
  <view class="base-page-shell">
    <text class="base-page-shell__title">{{ title }}</text>
    <text v-if="description" class="base-page-shell__description">{{ description }}</text>
    <slot />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<style scoped>
.base-page-shell {
  min-height: 100vh;
  padding: var(--noche-space-8);
  display: flex;
  flex-direction: column;
  gap: var(--noche-space-4);
  background: var(--noche-color-bg);
}

.base-page-shell__title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--noche-color-text);
}

.base-page-shell__description {
  font-size: 28rpx;
  color: var(--noche-color-muted);
}

.type-scale-small .base-page-shell__title { font-size: 34rpx; }
.type-scale-large .base-page-shell__title { font-size: 39rpx; }
.type-scale-small .base-page-shell__description { font-size: 26rpx; }
.type-scale-large .base-page-shell__description { font-size: 30rpx; }
</style>
