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
