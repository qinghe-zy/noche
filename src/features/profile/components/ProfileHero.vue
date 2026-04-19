<template>
  <view class="profile-hero">
    <view class="profile-hero__visual" @tap="$emit('preview-cover')">
      <image
        v-if="coverUri"
        class="profile-hero__cover-image"
        :src="coverUri"
        mode="aspectFill"
      />
      <view v-else class="profile-hero__cover-fallback"></view>
      <view class="profile-hero__mist"></view>

      <view class="profile-hero__nav" :style="navStyle" @tap.stop>
        <TopbarIconButton class="profile-hero__back" icon-name="back-ios" @tap="$emit('go-back')" />
        <text class="profile-hero__title">{{ title }}</text>
        <view class="profile-hero__nav-spacer"></view>
      </view>

      <view class="profile-hero__avatar-shell" @tap.stop="$emit('preview-avatar')">
        <image
          v-if="avatarUri"
          class="profile-hero__avatar-image"
          :src="avatarUri"
          mode="aspectFill"
        />
        <view v-else class="profile-hero__avatar-fallback">
          <text class="profile-hero__avatar-plus">+</text>
        </view>
      </view>
    </view>

    <view class="profile-hero__identity">
      <view class="profile-hero__name-row" @tap="$emit('edit-display-name')">
        <text class="profile-hero__name" :class="{ 'profile-hero__name--empty': !displayName }">{{ resolvedDisplayName }}</text>
      </view>
      <text v-if="signature" class="profile-hero__signature">{{ signature }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

const props = withDefaults(defineProps<{
  title?: string;
  displayName: string;
  signature: string;
  avatarUri: string | null;
  coverUri: string | null;
  displayNameFallback?: string;
  navStyle?: Record<string, string>;
}>(), {
  title: "我的角落",
  displayNameFallback: "点击修改昵称",
});

defineEmits<{
  (event: "go-back"): void;
  (event: "preview-cover"): void;
  (event: "preview-avatar"): void;
  (event: "edit-display-name"): void;
}>();

const resolvedDisplayName = computed(() => props.displayName || props.displayNameFallback);
</script>

<style scoped>
.profile-hero {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  background: var(--noche-bg);
}

.profile-hero__visual {
  position: relative;
  min-height: 488rpx;
  overflow: visible;
}

.profile-hero__cover-image,
.profile-hero__cover-fallback,
.profile-hero__mist {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.profile-hero__cover-image,
.profile-hero__cover-fallback {
  background: rgba(233, 226, 213, 0.88);
}

.profile-hero__cover-fallback {
  background: linear-gradient(180deg, rgba(233, 226, 213, 0.94), rgba(244, 239, 232, 0.94));
}

.profile-hero__mist {
  background:
    linear-gradient(180deg, rgba(251, 249, 245, 0.12), rgba(251, 249, 245, 0.16) 34%, rgba(251, 249, 245, 0.34) 68%, rgba(251, 249, 245, 0.58));
  backdrop-filter: blur(6rpx) saturate(0.96);
}

.profile-hero__nav {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 24rpx 0;
}

.profile-hero__back {
  color: var(--profile-soft-text, var(--noche-muted));
}

.profile-hero__title {
  font-size: 28rpx;
  line-height: 1.4;
  color: var(--profile-soft-text, var(--noche-text));
  letter-spacing: 0.22em;
  padding-left: 0.22em;
  font-family: var(--font-heading);
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
  border: 1rpx solid var(--border-subtle, rgba(221, 212, 200, 0.72));
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
    radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.36), transparent 20%),
    linear-gradient(180deg, #f2eadf, #e6dccf);
}

.profile-hero__avatar-plus {
  font-size: 68rpx;
  line-height: 1;
  color: rgba(99, 95, 85, 0.68);
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
  color: var(--text-primary, var(--noche-text));
  letter-spacing: 0.04em;
  font-family: var(--font-heading);
}

.profile-hero__name--empty {
  color: var(--profile-soft-text, var(--noche-muted));
}

.profile-hero__signature {
  max-width: 86%;
  font-size: 22rpx;
  line-height: 1.72;
  color: var(--profile-soft-meta, var(--noche-muted));
  letter-spacing: 0.06em;
  font-family: var(--font-body);
}

.type-scale-small .profile-hero__title { font-size: 26rpx; }
.type-scale-large .profile-hero__title { font-size: 30rpx; }
.type-scale-small .profile-hero__name { font-size: 41rpx; }
.type-scale-large .profile-hero__name { font-size: 47rpx; }
.type-scale-small .profile-hero__signature { font-size: 21rpx; }
.type-scale-large .profile-hero__signature { font-size: 24rpx; }
</style>
