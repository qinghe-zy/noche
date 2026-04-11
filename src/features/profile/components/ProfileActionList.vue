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
  border-top: 1rpx solid rgba(177, 179, 171, 0.26);
}

.profile-action-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 26rpx 4rpx;
}

.profile-action-list__item + .profile-action-list__item {
  border-top: 1rpx solid rgba(177, 179, 171, 0.18);
}

.profile-action-list__copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.profile-action-list__title {
  font-size: 28rpx;
  line-height: 1.4;
  color: #31332e;
  letter-spacing: 0.08em;
}

.profile-action-list__note,
.profile-action-list__value {
  font-size: 20rpx;
  line-height: 1.7;
  color: rgba(99, 95, 85, 0.72);
}

.profile-action-list__meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.profile-action-list__value {
  white-space: nowrap;
}

.profile-action-list__icon {
  width: 28rpx;
  height: 28rpx;
  color: rgba(138, 129, 120, 0.72);
}
</style>
