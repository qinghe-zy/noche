<template>
  <view class="app-shell"></view>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { applyThemeMode } from "@/shared/theme";
import { refreshMobileLayout } from "@/shared/layout/useMobileLayout";

const settingsStore = useSettingsStore();
let stopThemeChangeListener: (() => void) | null = null;
let stopWindowResizeListener: (() => void) | null = null;

watch(
  () => settingsStore.theme,
  (theme) => {
    applyThemeMode(theme);
  },
  {
    immediate: true,
  },
);

function refreshMobileLayoutVars(): void {
  refreshMobileLayout();
}

onMounted(() => {
  refreshMobileLayoutVars();
  nextTick(() => {
    refreshMobileLayoutVars();
  });
  setTimeout(() => {
    refreshMobileLayoutVars();
  }, 48);

  if (typeof uni !== "undefined" && typeof uni.onThemeChange === "function") {
    const listener = () => {
      if (settingsStore.theme === "system") {
        applyThemeMode("system");
      }
    };

    uni.onThemeChange(listener);
    stopThemeChangeListener = () => {
      if (typeof uni.offThemeChange === "function") {
        uni.offThemeChange(listener);
      }
    };
  }

  if (typeof uni !== "undefined" && typeof uni.onWindowResize === "function") {
    const listener = () => {
      refreshMobileLayoutVars();
    };

    uni.onWindowResize(listener);
    stopWindowResizeListener = () => {
      if (typeof uni.offWindowResize === "function") {
        uni.offWindowResize(listener);
      }
    };
  }
});

onShow(() => {
  refreshMobileLayoutVars();
  nextTick(() => {
    refreshMobileLayoutVars();
  });
});

onUnmounted(() => {
  stopThemeChangeListener?.();
  stopThemeChangeListener = null;
  stopWindowResizeListener?.();
  stopWindowResizeListener = null;
});
</script>

<style>
:root,
page,
body,
.uni-app,
.uni-page-body {
  --noche-bg: #fbf9f5;
  --noche-surface: rgba(252, 248, 241, 0.98);
  --noche-panel: #ffffff;
  --noche-text: #31332e;
  --noche-muted: rgba(99, 95, 85, 0.8);
  --noche-border: rgba(221, 212, 200, 0.72);
  --noche-overlay: rgba(44, 46, 42, 0.24);
  --noche-overlay-strong: rgba(34, 32, 28, 0.42);
  --noche-shadow-rgb: 44, 46, 42;
  --noche-paper-shadow-rgb: 49, 51, 46;
  --noche-danger: #8a3d3a;
  --noche-danger-soft: rgba(159, 64, 61, 0.07);
  --noche-accent: #5f5e5e;
  --noche-accent-strong: #6a635a;
  --noche-accent-contrast: #fbf9f5;
  --noche-ink-strong: #31332e;
  --noche-ink-soft: rgba(99, 95, 85, 0.82);
  --noche-ink-faint: rgba(99, 95, 85, 0.72);
  --noche-ink-subtle: rgba(121, 124, 117, 0.76);
  --noche-ink-ghost: rgba(177, 179, 171, 0.56);
  --noche-surface-soft: rgba(255, 255, 255, 0.88);
  --noche-surface-faint: rgba(255, 255, 255, 0.68);
  --noche-surface-strong: rgba(255, 255, 255, 0.96);
  --noche-surface-elevated: rgba(250, 247, 242, 0.98);
  --noche-paper-1: rgba(255, 252, 247, 0.98);
  --noche-paper-2: rgba(248, 243, 235, 0.98);
  --noche-paper-line: rgba(177, 179, 171, 0.18);
  --noche-chip: rgba(238, 232, 223, 0.92);
  --noche-card-muted: rgba(235, 231, 224, 0.88);
  --noche-card-soft: rgba(245, 244, 238, 0.82);
  --noche-card-mark: rgba(234, 229, 218, 0.82);
  background: var(--noche-bg);
  color: var(--noche-text);
}

:root[data-theme="dark"],
body[data-theme="dark"],
.uni-page-body[data-theme="dark"],
.uni-page-wrapper[data-theme="dark"],
page[data-theme="dark"] {
  --noche-bg: #171716;
  --noche-surface: rgba(30, 30, 29, 0.98);
  --noche-panel: #222220;
  --noche-text: #f1ede6;
  --noche-muted: rgba(224, 218, 208, 0.72);
  --noche-border: rgba(117, 110, 101, 0.48);
  --noche-overlay: rgba(6, 6, 6, 0.5);
  --noche-overlay-strong: rgba(0, 0, 0, 0.6);
  --noche-shadow-rgb: 0, 0, 0;
  --noche-paper-shadow-rgb: 0, 0, 0;
  --noche-danger: #ff9c95;
  --noche-danger-soft: rgba(255, 120, 110, 0.12);
  --noche-accent: #cfc6b7;
  --noche-accent-strong: #d8cebf;
  --noche-accent-contrast: #171716;
  --noche-ink-strong: #f1ede6;
  --noche-ink-soft: rgba(224, 218, 208, 0.82);
  --noche-ink-faint: rgba(210, 202, 190, 0.72);
  --noche-ink-subtle: rgba(191, 184, 173, 0.76);
  --noche-ink-ghost: rgba(146, 137, 125, 0.58);
  --noche-surface-soft: rgba(39, 39, 37, 0.96);
  --noche-surface-faint: rgba(34, 34, 32, 0.92);
  --noche-surface-strong: rgba(46, 46, 43, 0.98);
  --noche-surface-elevated: rgba(27, 27, 26, 0.98);
  --noche-paper-1: rgba(34, 33, 31, 0.98);
  --noche-paper-2: rgba(28, 27, 25, 0.98);
  --noche-paper-line: rgba(120, 112, 101, 0.26);
  --noche-chip: rgba(58, 56, 52, 0.92);
  --noche-card-muted: rgba(48, 46, 43, 0.92);
  --noche-card-soft: rgba(42, 41, 38, 0.92);
  --noche-card-mark: rgba(63, 60, 55, 0.92);
}
</style>
