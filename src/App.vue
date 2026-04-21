<template>
  <view class="app-shell" :class="[resolvedThemeClass, resolvedTypographyClass]"></view>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useThemeClass, useTypographyClass } from "@/shared/theme";

useSettingsStore();
const resolvedThemeClass = useThemeClass();
const resolvedTypographyClass = useTypographyClass();
</script>

<style>
.theme-light,
:root {
  --noche-bg: #fbf9f5;
  --noche-surface: rgba(252, 248, 241, 0.98);
  --noche-panel: #ffffff;
  --noche-text: #31332e;
  --noche-muted: rgba(99, 95, 85, 0.8);
  --noche-border: rgba(221, 212, 200, 0.72);
  --noche-overlay: rgba(44, 46, 42, 0.24);
  --noche-shell-bg: #fbf9f5;
  --noche-shell-surface: rgba(255, 255, 255, 0.88);
  --noche-shell-panel: rgba(255, 255, 255, 0.68);
  --noche-shell-line: rgba(177, 179, 171, 0.16);
  --noche-shell-line-strong: rgba(177, 179, 171, 0.28);
  --noche-shell-text: #31332e;
  --noche-shell-muted: rgba(99, 95, 85, 0.76);
  --noche-shell-soft: rgba(138, 129, 120, 0.72);
  --noche-shell-accent: #b8883a;
  --noche-shell-accent-strong: #a83228;
  --noche-shell-shadow: rgba(49, 51, 46, 0.12);
  --noche-shell-glow: rgba(255, 255, 255, 0.82);
  --noche-type-scale: 1;
  background: var(--noche-bg);
  color: var(--noche-text);
}

.theme-dark {
  --noche-bg: #171716;
  --noche-surface: rgba(30, 30, 29, 0.98);
  --noche-panel: #222220;
  --noche-text: #f1ede6;
  --noche-muted: rgba(224, 218, 208, 0.72);
  --noche-border: rgba(117, 110, 101, 0.48);
  --noche-overlay: rgba(6, 6, 6, 0.5);
  --noche-shell-bg: #0c0a08;
  --noche-shell-surface: rgba(19, 16, 9, 0.96);
  --noche-shell-panel: rgba(24, 20, 13, 0.88);
  --noche-shell-line: rgba(43, 36, 25, 0.82);
  --noche-shell-line-strong: rgba(56, 46, 31, 0.9);
  --noche-shell-text: #eae2ce;
  --noche-shell-muted: rgba(203, 189, 159, 0.74);
  --noche-shell-soft: rgba(141, 128, 107, 0.84);
  --noche-shell-accent: #b8883a;
  --noche-shell-accent-strong: #a83228;
  --noche-shell-shadow: rgba(0, 0, 0, 0.32);
  --noche-shell-glow: rgba(234, 226, 206, 0.08);
}

.type-scale-small {
  --noche-type-scale: 0.94;
}

.type-scale-medium {
  --noche-type-scale: 1;
}

.type-scale-large {
  --noche-type-scale: 1.08;
}
</style>
