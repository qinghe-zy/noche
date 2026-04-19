<template>
  <view class="profile-action-list">
    <view
      v-for="item in items"
      :key="item.key"
      class="profile-action-list__item"
      @tap="$emit('select', item.key)"
    >
      <view class="profile-action-list__copy">
        <text class="profile-action-list__title">{{ item.title }}</text>
        <text class="profile-action-list__note">{{ item.note }}</text>
      </view>

      <view class="profile-action-list__meta">
        <text class="profile-action-list__value">{{ item.value }}</text>
        <AppIcon name="chevron-right" class="profile-action-list__icon" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/shared/ui/AppIcon.vue";
import type { ProfileActionItem } from "@/features/profile/profileData";

defineProps<{
  items: ProfileActionItem[];
}>();

defineEmits<{
  (event: "select", key: ProfileActionItem["key"]): void;
}>();
</script>

<style scoped>
.profile-action-list {
  border-top: 1rpx solid color-mix(in srgb, var(--border-subtle, #d7c8b1) 54%, transparent);
  background: var(--surface-primary, transparent);
  border-radius: 24rpx;
  padding: 0 16rpx;
  box-shadow: var(--shadow-ring, 0 0 0 1px rgba(165, 133, 102, 0.28));
}

.profile-action-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 20rpx 0;
}

.profile-action-list__item + .profile-action-list__item {
  border-top: 1rpx solid color-mix(in srgb, var(--border-subtle, #d7c8b1) 42%, transparent);
}

.profile-action-list__copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.profile-action-list__title {
  font-size: 25rpx;
  line-height: 1.35;
  color: var(--text-primary, #31332e);
  letter-spacing: 0.02em;
  font-family: var(--font-heading);
}

.profile-action-list__note,
.profile-action-list__value {
  font-size: 17rpx;
  line-height: 1.58;
  color: var(--profile-soft-meta, rgba(99, 95, 85, 0.58));
  font-family: var(--font-body);
}

.profile-action-list__meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  max-width: 44%;
}

.profile-action-list__value {
  white-space: normal;
  text-align: right;
}

.profile-action-list__icon {
  width: 24rpx;
  height: 24rpx;
  color: var(--profile-soft-hint, rgba(138, 129, 120, 0.46));
}

.type-scale-small .profile-action-list__title { font-size: 24rpx; }
.type-scale-large .profile-action-list__title { font-size: 27rpx; }
.type-scale-small .profile-action-list__note,
.type-scale-small .profile-action-list__value { font-size: 16rpx; }
.type-scale-large .profile-action-list__note,
.type-scale-large .profile-action-list__value { font-size: 18rpx; }
</style>
