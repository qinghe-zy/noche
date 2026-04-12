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
  border-top: 1rpx solid color-mix(in srgb, var(--noche-border) 58%, transparent);
}

.profile-action-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 20rpx 0;
}

.profile-action-list__item + .profile-action-list__item {
  border-top: 1rpx solid color-mix(in srgb, var(--noche-border) 42%, transparent);
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
  color: var(--noche-ink-strong);
  letter-spacing: 0.02em;
}

.profile-action-list__note,
.profile-action-list__value {
  font-size: 17rpx;
  line-height: 1.58;
  color: var(--noche-ink-faint);
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
  color: var(--noche-ink-faint);
}
</style>
