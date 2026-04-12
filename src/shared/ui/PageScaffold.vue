<template>
  <view class="page-scaffold noche-mobile-page">
    <SafeTopbar
      v-if="showTopbar"
      :title="title"
      :subtitle="subtitle"
      :show-left="showLeft"
      :left-icon="leftIcon"
      :right-label="rightLabel"
      :reserve-right="reserveRight"
      :bordered="topbarBordered"
      :translucent="topbarTranslucent"
      :max-width="maxWidth"
      :title-align="titleAlign"
      @left-tap="$emit('left-tap')"
      @right-tap="$emit('right-tap')"
    >
      <template v-if="$slots.left" #left>
        <slot name="left" />
      </template>
      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>
      <template v-if="$slots.right" #right>
        <slot name="right" />
      </template>
    </SafeTopbar>

    <scroll-view
      v-if="scrollable"
      scroll-y
      class="page-scaffold__scroll noche-mobile-scroll"
    >
      <view class="page-scaffold__body page-scaffold__body--scroll noche-mobile-scroll-fill" :style="bodyStyle">
        <slot />
      </view>
    </scroll-view>

    <view v-else class="page-scaffold__body page-scaffold__body--static noche-mobile-main" :style="bodyStyle">
      <slot />
    </view>

    <view class="page-scaffold__bottom-safe"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SafeTopbar from "@/shared/ui/SafeTopbar.vue";

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
  showTopbar?: boolean;
  scrollable?: boolean;
  showLeft?: boolean;
  leftIcon?: TopbarIconName;
  rightLabel?: string;
  reserveRight?: boolean;
  topbarBordered?: boolean;
  topbarTranslucent?: boolean;
  maxWidth?: string;
  titleAlign?: "center" | "start";
}>(), {
  title: "",
  subtitle: "",
  showTopbar: true,
  scrollable: false,
  showLeft: false,
  leftIcon: "back",
  rightLabel: "",
  reserveRight: true,
  topbarBordered: false,
  topbarTranslucent: false,
  maxWidth: "720px",
  titleAlign: "center",
});

defineEmits<{
  (event: "left-tap"): void;
  (event: "right-tap"): void;
}>();

const bodyStyle = computed(() => ({
  "--page-scaffold-max-width": props.maxWidth,
}));
</script>

<style scoped>
.page-scaffold {
  width: 100%;
  background: var(--noche-bg);
  position: relative;
}

.page-scaffold__scroll,
.page-scaffold__body {
  width: 100%;
}

.page-scaffold__body {
  max-width: var(--page-scaffold-max-width);
  margin: 0 auto;
}

.page-scaffold__body--scroll {
  min-height: var(--noche-content-min-height);
}

.page-scaffold__body--static {
  min-height: var(--noche-content-min-height);
}

.page-scaffold__bottom-safe {
  height: max(var(--noche-safe-bottom), env(safe-area-inset-bottom, 0px));
  min-height: max(var(--noche-safe-bottom), env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
}
</style>
