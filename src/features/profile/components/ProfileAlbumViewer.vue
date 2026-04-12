<template>
  <view v-if="open && item" class="profile-album-viewer" @tap.self="$emit('close')">
    <view class="profile-album-viewer__dialog">
      <view class="profile-album-viewer__topbar">
        <text class="profile-album-viewer__counter">{{ currentIndex + 1 }} / {{ total }}</text>
        <view class="profile-album-viewer__close" @tap="$emit('close')">
          <text class="profile-album-viewer__close-text">{{ copy.home.cancel }}</text>
        </view>
      </view>

      <view class="profile-album-viewer__image-wrap">
        <image class="profile-album-viewer__image" :src="item.localUri" mode="widthFix" />
      </view>

      <view class="profile-album-viewer__meta">
        <view class="profile-album-viewer__meta-copy">
          <text class="profile-album-viewer__date">{{ formatProfileRecordDate(item.recordDate) }}</text>
          <text class="profile-album-viewer__type">{{ formatProfileTypeLabel(item.type, settingsStore.locale) }}</text>
        </view>

        <view class="profile-album-viewer__actions">
          <view
            class="profile-album-viewer__pager"
            :class="{ 'profile-album-viewer__pager--disabled': !canPrev }"
            @tap="canPrev && $emit('prev')"
          >
            <AppIcon name="chevron-left" class="profile-album-viewer__pager-icon" />
          </view>
          <view class="profile-album-viewer__jump" @tap="$emit('jump')">
            <text class="profile-album-viewer__jump-text">{{ jumpLabel }}</text>
          </view>
          <view
            class="profile-album-viewer__pager"
            :class="{ 'profile-album-viewer__pager--disabled': !canNext }"
            @tap="canNext && $emit('next')"
          >
            <AppIcon name="chevron-right" class="profile-album-viewer__pager-icon" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { t } from "@/shared/i18n";
import AppIcon from "@/shared/ui/AppIcon.vue";
import {
  formatProfileRecordDate,
  formatProfileTypeLabel,
  type ProfileAlbumItem,
} from "@/features/profile/profileData";

const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));
const jumpLabel = computed(() => settingsStore.locale === "en-US" ? "Open linked page" : "跳转到对应文章");

defineProps<{
  open: boolean;
  item: ProfileAlbumItem | null;
  currentIndex: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
}>();

defineEmits<{
  (event: "close"): void;
  (event: "prev"): void;
  (event: "next"): void;
  (event: "jump"): void;
}>();
</script>

<style scoped>
.profile-album-viewer {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 32rpx 24rpx 36rpx;
  background: rgba(34, 32, 28, 0.42);
  backdrop-filter: blur(14rpx);
}

.profile-album-viewer__dialog {
  width: min(100%, 700rpx);
  max-height: 88vh;
  border-radius: 32rpx;
  overflow: hidden;
  background: rgba(250, 247, 242, 0.98);
  display: flex;
  flex-direction: column;
}

.profile-album-viewer__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx 0;
}

.profile-album-viewer__counter,
.profile-album-viewer__close-text,
.profile-album-viewer__type {
  font-size: 19rpx;
  line-height: 1.6;
  color: rgba(99, 95, 85, 0.72);
  letter-spacing: 0.14em;
}

.profile-album-viewer__image-wrap {
  padding: 18rpx 18rpx 0;
  overflow-y: auto;
}

.profile-album-viewer__image {
  width: 100%;
  border-radius: 24rpx;
  background: rgba(239, 234, 226, 0.86);
}

.profile-album-viewer__meta {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 24rpx 24rpx 28rpx;
}

.profile-album-viewer__meta-copy {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20rpx;
}

.profile-album-viewer__date {
  font-size: 28rpx;
  line-height: 1.4;
  color: #31332e;
}

.profile-album-viewer__actions {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.profile-album-viewer__pager {
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: rgba(238, 232, 223, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c655c;
}

.profile-album-viewer__pager--disabled {
  opacity: 0.4;
}

.profile-album-viewer__pager-icon {
  width: 30rpx;
  height: 30rpx;
}

.profile-album-viewer__jump {
  flex: 1;
  min-height: 72rpx;
  border-radius: 999rpx;
  background: #6a635a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-album-viewer__jump-text {
  font-size: 24rpx;
  line-height: 1.4;
  color: #fbf9f5;
  letter-spacing: 0.08em;
}
</style>
