<template>
  <view class="profile-hero">
    <view class="profile-hero__cover">
      <image
        v-if="coverUri"
        class="profile-hero__cover-image"
        :src="coverUri"
        mode="aspectFill"
      />
      <view v-else class="profile-hero__cover-fallback"></view>
      <view class="profile-hero__mist"></view>
    </view>

    <view class="profile-hero__identity">
      <view class="profile-hero__avatar-shell">
        <image
          v-if="avatarUri"
          class="profile-hero__avatar-image"
          :src="avatarUri"
          mode="aspectFill"
        />
        <view v-else class="profile-hero__avatar-fallback">
          <text class="profile-hero__avatar-initial">{{ avatarInitial }}</text>
        </view>
      </view>

      <text class="profile-hero__name">{{ displayName }}</text>
      <text class="profile-hero__signature">{{ signature }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { resolveProfileInitial } from "@/features/profile/profileData";

const props = defineProps<{
  displayName: string;
  signature: string;
  avatarUri: string | null;
  coverUri: string | null;
}>();

const avatarInitial = computed(() => resolveProfileInitial(props.displayName));
</script>

<style scoped>
.profile-hero {
  position: relative;
  border-radius: 36rpx;
  overflow: hidden;
  background: #f2ede5;
}

.profile-hero__cover {
  position: relative;
  min-height: 448rpx;
}

.profile-hero__cover-image,
.profile-hero__cover-fallback,
.profile-hero__mist {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.profile-hero__cover-fallback {
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.72), transparent 28%),
    radial-gradient(circle at 78% 18%, rgba(222, 213, 198, 0.62), transparent 24%),
    linear-gradient(180deg, rgba(196, 183, 168, 0.72), rgba(244, 239, 232, 0.94));
}

.profile-hero__mist {
  background:
    linear-gradient(180deg, rgba(248, 244, 237, 0.18), rgba(248, 244, 237, 0.58) 45%, rgba(248, 244, 237, 0.92));
  backdrop-filter: blur(22rpx) saturate(0.92);
}

.profile-hero__identity {
  position: relative;
  z-index: 1;
  min-height: 448rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 14rpx;
  padding: 52rpx 36rpx 46rpx;
  text-align: center;
}

.profile-hero__avatar-shell {
  width: 140rpx;
  height: 140rpx;
  border-radius: 999rpx;
  padding: 6rpx;
  background: rgba(251, 249, 245, 0.82);
  box-shadow: 0 18rpx 38rpx rgba(49, 51, 46, 0.08);
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
  font-size: 54rpx;
  line-height: 1;
  color: #fbf9f5;
  letter-spacing: 0.08em;
}

.profile-hero__name {
  font-size: 44rpx;
  line-height: 1.25;
  font-weight: 300;
  color: #31332e;
  letter-spacing: 0.16em;
  padding-left: 0.16em;
}

.profile-hero__signature {
  max-width: 80%;
  font-size: 23rpx;
  line-height: 1.9;
  color: rgba(93, 96, 90, 0.84);
  letter-spacing: 0.12em;
}
</style>
