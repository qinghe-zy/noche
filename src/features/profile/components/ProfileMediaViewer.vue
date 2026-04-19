<template>
  <view v-if="open" class="profile-media-viewer" @tap.self="$emit('close')">
    <view class="profile-media-viewer__dialog">
      <view class="profile-media-viewer__topbar">
        <text class="profile-media-viewer__title">{{ title }}</text>
        <view class="profile-media-viewer__close" @tap="$emit('close')">
          <text class="profile-media-viewer__close-text">{{ closeLabel }}</text>
        </view>
      </view>

      <view class="profile-media-viewer__image-wrap">
        <image
          v-if="imageUri"
          class="profile-media-viewer__image"
          :src="imageUri"
          mode="aspectFill"
        />
        <view v-else class="profile-media-viewer__fallback"></view>
      </view>

      <view class="profile-media-viewer__actions">
        <view class="profile-media-viewer__action" @tap="$emit('replace')">
          <text class="profile-media-viewer__action-text">{{ replaceLabel }}</text>
        </view>
        <view
          v-if="showDelete"
          class="profile-media-viewer__action profile-media-viewer__action--danger"
          @tap="$emit('remove')"
        >
          <text class="profile-media-viewer__action-text profile-media-viewer__action-text--danger">{{ deleteLabel }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean;
  title: string;
  imageUri: string | null;
  replaceLabel: string;
  deleteLabel: string;
  closeLabel: string;
  showDelete?: boolean;
}>(), {
  showDelete: false,
});

defineEmits<{
  (event: "close"): void;
  (event: "replace"): void;
  (event: "remove"): void;
}>();
</script>

<style scoped>
.profile-media-viewer {
  position: fixed;
  inset: 0;
  z-index: 72;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 28rpx 24rpx 34rpx;
  background: var(--overlay-mask, rgba(34, 32, 28, 0.42));
  backdrop-filter: blur(14rpx);
}

.profile-media-viewer__dialog {
  width: min(100%, 700rpx);
  border-radius: 32rpx;
  overflow: hidden;
  background: var(--surface-primary, rgba(250, 247, 242, 0.98));
  display: flex;
  flex-direction: column;
}

.profile-media-viewer__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx 0;
}

.profile-media-viewer__title,
.profile-media-viewer__close-text {
  font-size: 19rpx;
  line-height: 1.6;
  color: rgba(99, 95, 85, 0.72);
  letter-spacing: 0.14em;
}

.profile-media-viewer__image-wrap {
  padding: 18rpx 18rpx 0;
}

.profile-media-viewer__image,
.profile-media-viewer__fallback {
  width: 100%;
  aspect-ratio: 1.25;
  border-radius: 24rpx;
  background: rgba(235, 231, 224, 0.88);
}

.profile-media-viewer__fallback {
  background: linear-gradient(180deg, rgba(233, 226, 213, 0.94), rgba(244, 239, 232, 0.94));
}

.profile-media-viewer__actions {
  display: flex;
  gap: 12rpx;
  padding: 24rpx;
}

.profile-media-viewer__action {
  flex: 1;
  min-height: 76rpx;
  border-radius: var(--button-pill-radius, 999rpx);
  background: var(--button-secondary-bg, rgba(238, 232, 223, 0.92));
  border: 1rpx solid var(--button-secondary-border, transparent);
  box-shadow: var(--button-secondary-shadow, none);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-media-viewer__action--danger {
  background: color-mix(in srgb, var(--button-primary-bg, #c96442) 12%, transparent);
  border-color: color-mix(in srgb, var(--button-primary-bg, #c96442) 22%, transparent);
}

.profile-media-viewer__action-text {
  font-size: 24rpx;
  line-height: 1.4;
  color: var(--button-secondary-text, #6a635a);
  letter-spacing: 0.08em;
  font-family: var(--font-body, inherit);
}

.profile-media-viewer__action-text--danger {
  color: var(--button-danger-text, #8a3d3a);
}

.type-scale-small .profile-media-viewer__title,
.type-scale-small .profile-media-viewer__close-text { font-size: 18rpx; }
.type-scale-large .profile-media-viewer__title,
.type-scale-large .profile-media-viewer__close-text { font-size: 21rpx; }
.type-scale-small .profile-media-viewer__action-text { font-size: 23rpx; }
.type-scale-large .profile-media-viewer__action-text { font-size: 26rpx; }
</style>
