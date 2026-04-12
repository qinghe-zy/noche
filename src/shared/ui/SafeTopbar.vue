<template>
  <view
    class="safe-topbar"
    :class="{
      'safe-topbar--bordered': bordered,
      'safe-topbar--translucent': translucent,
      'safe-topbar--title-start': titleAlign === 'start',
    }"
  >
    <view class="safe-topbar__inner" :style="innerStyle">
      <view class="safe-topbar__side safe-topbar__side--left">
        <slot name="left">
          <TopbarIconButton
            v-if="showLeft"
            :icon-name="leftIcon"
            @tap="$emit('left-tap')"
          />
          <view v-else class="safe-topbar__control-spacer"></view>
        </slot>
      </view>

      <view class="safe-topbar__center">
        <slot name="title">
          <text v-if="title" class="safe-topbar__title">{{ title }}</text>
          <text v-if="subtitle" class="safe-topbar__subtitle">{{ subtitle }}</text>
        </slot>
      </view>

      <view class="safe-topbar__side safe-topbar__side--right">
        <slot name="right">
          <view
            v-if="rightLabel"
            class="safe-topbar__text-action"
            @tap="$emit('right-tap')"
          >
            {{ rightLabel }}
          </view>
          <view v-else-if="reserveRight" class="safe-topbar__control-spacer"></view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type TopbarIconName =
  | "back"
  | "back-ios"
  | "mail"
  | "check"
  | "calendar"
  | "chevron-left"
  | "chevron-right";

const props = withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  showLeft?: boolean;
  leftIcon?: TopbarIconName;
  rightLabel?: string;
  reserveRight?: boolean;
  bordered?: boolean;
  translucent?: boolean;
  maxWidth?: string;
  titleAlign?: "center" | "start";
}>(), {
  title: "",
  subtitle: "",
  showLeft: false,
  leftIcon: "back",
  rightLabel: "",
  reserveRight: true,
  bordered: false,
  translucent: false,
  maxWidth: "720px",
  titleAlign: "center",
});

defineEmits<{
  (event: "left-tap"): void;
  (event: "right-tap"): void;
}>();

const innerStyle = computed(() => ({
  maxWidth: props.maxWidth,
}));
</script>

<style scoped>
.safe-topbar {
  width: 100%;
  flex-shrink: 0;
  background: var(--noche-surface);
}

.safe-topbar--bordered {
  border-bottom: 1px solid color-mix(in srgb, var(--noche-border) 72%, transparent);
}

.safe-topbar--translucent {
  background: color-mix(in srgb, var(--noche-surface) 94%, transparent);
  backdrop-filter: blur(12px);
}

.safe-topbar__inner {
  width: 100%;
  min-height: var(--noche-topbar-block-height);
  margin: 0 auto;
  padding: var(--noche-topbar-padding-top) var(--noche-topbar-padding-x) var(--noche-topbar-padding-bottom);
  display: grid;
  grid-template-columns: minmax(88rpx, auto) 1fr minmax(88rpx, auto);
  align-items: center;
  gap: 16rpx;
}

.safe-topbar__side {
  min-width: 88rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
}

.safe-topbar__side--left {
  justify-content: flex-start;
}

.safe-topbar__side--right {
  justify-content: flex-end;
}

.safe-topbar__center {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.safe-topbar--title-start .safe-topbar__center {
  align-items: flex-start;
}

.safe-topbar__title,
.safe-topbar__subtitle {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.safe-topbar__title {
  font-size: 30rpx;
  line-height: 1.4;
  color: var(--noche-text);
  letter-spacing: 0.18em;
  padding-left: 0.18em;
}

.safe-topbar__subtitle,
.safe-topbar__text-action {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 20rpx;
  line-height: 1.35;
  color: var(--noche-muted);
  letter-spacing: 0.16em;
}

.safe-topbar__subtitle,
.safe-topbar__text-action {
  padding-left: 0.16em;
}

.safe-topbar__text-action {
  min-width: 88rpx;
  min-height: 88rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.safe-topbar__control-spacer {
  width: 88rpx;
  min-width: 88rpx;
  height: 88rpx;
}
</style>
