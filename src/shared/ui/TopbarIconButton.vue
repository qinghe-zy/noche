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
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--topbar-icon-color, var(--text-secondary, rgba(138, 129, 120, 0.82)));
  border-radius: var(--radius-pill, 999rpx);
  transition: color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.topbar-icon-button:active {
  background: var(--button-ghost-bg, var(--surface-primary, var(--noche-surface)));
  border: 1px solid var(--button-ghost-border, transparent);
  box-shadow: var(--button-secondary-shadow, var(--shadow-ring, none));
}

.topbar-icon-button__icon {
  width: 44rpx;
  height: 44rpx;
  color: currentColor;
}
</style>
