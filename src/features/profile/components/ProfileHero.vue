<template>
  <view class="profile-hero">
    <view class="profile-hero__visual">
      <image
        class="profile-hero__cover-image"
        :src="resolvedCoverUri"
        mode="aspectFill"
      />
      <view class="profile-hero__mist"></view>

      <view class="profile-hero__avatar-shell" @tap="$emit('edit-avatar')">
        <image
          v-if="avatarUri"
          class="profile-hero__avatar-image"
          :src="avatarUri"
          mode="aspectFill"
        />
        <view v-else class="profile-hero__avatar-fallback">
          <text class="profile-hero__avatar-initial">{{ avatarInitial }}</text>
        </view>

        <view class="profile-hero__avatar-edit">
          <AppIcon name="edit-square" class="profile-hero__avatar-edit-icon" />
        </view>
      </view>
    </view>

    <view class="profile-hero__identity" @tap="$emit('edit-profile')">
      <view class="profile-hero__name-row">
        <text class="profile-hero__name">{{ displayName }}</text>
        <view class="profile-hero__profile-edit">
          <AppIcon name="ink-pen" class="profile-hero__profile-edit-icon" />
        </view>
      </view>
      <text class="profile-hero__signature">{{ signature }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import { resolveProfileInitial } from "@/features/profile/profileData";

const props = defineProps<{
  displayName: string;
  signature: string;
  avatarUri: string | null;
  coverUri: string | null;
}>();

defineEmits<{
  (event: "edit-avatar"): void;
  (event: "edit-profile"): void;
}>();

const avatarInitial = computed(() => resolveProfileInitial(props.displayName));
const resolvedCoverUri = computed(() => props.coverUri ?? "/profile-corner-cover.svg");
</script>

<style scoped>
.profile-hero {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  background: var(--noche-bg);
}

.profile-hero__visual {
  position: relative;
  min-height: clamp(220px, 34vh, 320px);
  overflow: visible;
  border-radius: 0 0 30rpx 30rpx;
}

.profile-hero__cover-image,
.profile-hero__mist {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.profile-hero__cover-image {
  background: var(--noche-card-muted);
}

.profile-hero__mist {
  background:
    linear-gradient(180deg, rgba(var(--noche-shadow-rgb), 0.04), rgba(var(--noche-shadow-rgb), 0.08) 34%, rgba(var(--noche-shadow-rgb), 0.22) 72%, rgba(var(--noche-shadow-rgb), 0.3));
  backdrop-filter: blur(10rpx) saturate(0.94);
}

.profile-hero__avatar-shell {
  position: absolute;
  left: var(--noche-page-padding-x);
  bottom: -38rpx;
  z-index: 3;
  width: 124rpx;
  height: 124rpx;
  border-radius: 999rpx;
  padding: 6rpx;
  background: var(--noche-surface-strong);
  box-shadow: 0 18rpx 34rpx rgba(var(--noche-paper-shadow-rgb), 0.18);
}

.profile-hero__avatar-image,
.profile-hero__avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 999rpx;
}

.profile-hero__avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.28), transparent 20%),
    linear-gradient(180deg, color-mix(in srgb, var(--noche-accent) 88%, white), color-mix(in srgb, var(--noche-accent) 74%, black));
}

.profile-hero__avatar-initial {
  font-size: 52rpx;
  line-height: 1;
  color: var(--noche-accent-contrast);
  letter-spacing: 0.08em;
}

.profile-hero__avatar-edit {
  position: absolute;
  right: 2rpx;
  bottom: 2rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: var(--noche-surface-strong);
  box-shadow: 0 8rpx 18rpx rgba(var(--noche-paper-shadow-rgb), 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-hero__avatar-edit-icon {
  width: 20rpx;
  height: 20rpx;
  color: var(--noche-ink-faint);
}

.profile-hero__identity {
  padding: 28rpx var(--noche-page-padding-x) 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}

.profile-hero__name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.profile-hero__name {
  font-size: 42rpx;
  line-height: 1.2;
  font-weight: 400;
  color: var(--noche-text);
  letter-spacing: 0.03em;
}

.profile-hero__profile-edit {
  width: 34rpx;
  height: 34rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--noche-chip);
}

.profile-hero__profile-edit-icon {
  width: 18rpx;
  height: 18rpx;
  color: var(--noche-ink-faint);
}

.profile-hero__signature {
  max-width: 88%;
  font-size: 22rpx;
  line-height: 1.72;
  color: var(--noche-muted);
  letter-spacing: 0.04em;
}
</style>
