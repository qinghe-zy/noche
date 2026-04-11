<template>
  <view class="topbar-icon-button" @tap="$emit('tap')">
    <slot>
      <AppIcon :name="iconName" class="topbar-icon-button__icon" />
    </slot>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/shared/ui/AppIcon.vue";

withDefaults(defineProps<{
  iconName?: "back" | "back-ios" | "mail" | "check" | "calendar" | "chevron-left" | "chevron-right";
}>(), {
  iconName: "back",
});

defineEmits<{
  (event: "tap"): void;
}>();
</script>

<style scoped>
.topbar-icon-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(138, 129, 120, 0.82);
}

.topbar-icon-button__icon {
  width: 40rpx;
  height: 40rpx;
  color: currentColor;
}
</style>
