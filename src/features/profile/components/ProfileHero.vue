<template>
  <view class="profile-hero">
    <view class="profile-hero__visual">
      <image
        class="profile-hero__cover-image"
        :src="resolvedCoverUri"
        mode="aspectFill"
      />
      <view class="profile-hero__mist"></view>

      <view class="profile-hero__nav">
        <TopbarIconButton class="profile-hero__back" icon-name="back-ios" @tap="$emit('go-back')" />
        <text class="profile-hero__title">{{ title }}</text>
        <view class="profile-hero__nav-spacer"></view>
      </view>

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
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import { resolveProfileInitial } from "@/features/profile/profileData";

const props = withDefaults(defineProps<{
  title?: string;
  displayName: string;
  signature: string;
  avatarUri: string | null;
  coverUri: string | null;
}>(), {
  title: "我的角落",
});

defineEmits<{
  (event: "go-back"): void;
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
  gap: 22rpx;
  background: #fbf9f5;
}

.profile-hero__visual {
  position: relative;
  min-height: 488rpx;
  overflow: visible;
}

.profile-hero__cover-image,
.profile-hero__mist {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.profile-hero__cover-image {
  background: rgba(233, 226, 213, 0.88);
}

.profile-hero__mist {
  background:
    linear-gradient(180deg, rgba(251, 249, 245, 0.14), rgba(251, 249, 245, 0.18) 34%, rgba(251, 249, 245, 0.42) 68%, rgba(251, 249, 245, 0.72));
  backdrop-filter: blur(10rpx) saturate(0.94);
}

.profile-hero__nav {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 24rpx 0;
}

.profile-hero__back {
  color: rgba(83, 76, 67, 0.76);
}

.profile-hero__title {
  font-size: 28rpx;
  line-height: 1.4;
  color: rgba(49, 51, 46, 0.88);
  letter-spacing: 0.22em;
  padding-left: 0.22em;
}

.profile-hero__nav-spacer {
  width: 72rpx;
  height: 72rpx;
}

.profile-hero__avatar-shell {
  position: absolute;
  left: 24rpx;
  bottom: -56rpx;
  z-index: 3;
  width: 148rpx;
  height: 148rpx;
  border-radius: 999rpx;
  padding: 6rpx;
  background: rgba(252, 250, 246, 0.94);
  box-shadow: 0 18rpx 34rpx rgba(49, 51, 46, 0.08);
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
    linear-gradient(180deg, #6d675f, #4d4943);
}

.profile-hero__avatar-initial {
  font-size: 56rpx;
  line-height: 1;
  color: #fbf9f5;
  letter-spacing: 0.08em;
}

.profile-hero__avatar-edit {
  position: absolute;
  right: 2rpx;
  bottom: 2rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: rgba(251, 249, 245, 0.96);
  box-shadow: 0 8rpx 18rpx rgba(49, 51, 46, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-hero__avatar-edit-icon {
  width: 20rpx;
  height: 20rpx;
  color: rgba(99, 95, 85, 0.64);
}

.profile-hero__identity {
  padding: 34rpx 24rpx 0;
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
  font-size: 44rpx;
  line-height: 1.22;
  font-weight: 400;
  color: #31332e;
  letter-spacing: 0.04em;
}

.profile-hero__profile-edit {
  width: 34rpx;
  height: 34rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 233, 224, 0.58);
}

.profile-hero__profile-edit-icon {
  width: 18rpx;
  height: 18rpx;
  color: rgba(99, 95, 85, 0.54);
}

.profile-hero__signature {
  max-width: 86%;
  font-size: 22rpx;
  line-height: 1.72;
  color: rgba(93, 96, 90, 0.74);
  letter-spacing: 0.06em;
}
</style>
