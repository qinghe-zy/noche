<template>
  <view
    class="app-shell"
    :class="[resolvedThemeClass, resolvedTypographyClass]"
    :data-theme-family="settingsStore.themeFamily"
    :data-theme-key="resolvedThemeKey"
    :style="resolvedThemeTokens"
  ></view>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { computed } from "vue";
import { getThemeTokens, useResolvedThemeKey, useThemeClass, useTypographyClass } from "@/shared/theme";

const settingsStore = useSettingsStore();
const resolvedThemeClass = useThemeClass();
const resolvedThemeKey = useResolvedThemeKey();
const resolvedTypographyClass = useTypographyClass();
const resolvedThemeTokens = computed(() => getThemeTokens(resolvedThemeKey.value));
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

.theme-key-default-light,
.theme-key-default-dark,
.theme-key-claude-light,
.theme-key-claude-dark {
  background: var(--app-bg);
  color: var(--text-primary);
  --noche-overlay: var(--overlay-mask, var(--noche-overlay));
  --noche-bg: var(--app-bg);
  --noche-surface: var(--surface-primary);
  --noche-panel: var(--surface-secondary);
  --noche-text: var(--text-primary);
  --noche-muted: var(--text-secondary);
  --noche-border: var(--border-subtle);
}
</style>
