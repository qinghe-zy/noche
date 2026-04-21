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
  --noche-dialog-surface: rgba(252, 248, 241, 0.98);
  --noche-dialog-surface-strong: #ffffff;
  --noche-dialog-border: rgba(221, 212, 200, 0.72);
  --noche-dialog-border-soft: rgba(221, 212, 200, 0.44);
  --noche-dialog-title: #31332e;
  --noche-dialog-copy: rgba(99, 95, 85, 0.8);
  --noche-dialog-label: #8c6e2f;
  --noche-dialog-paper: #fffdf8;
  --noche-dialog-paper-ink: #31332e;
  --noche-dialog-danger: #8a3d3a;
  --noche-dialog-shadow: 0 18px 40px rgba(44, 46, 42, 0.12);
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
  --noche-dialog-surface: #1c1915;
  --noche-dialog-surface-strong: #141210;
  --noche-dialog-border: #2a2520;
  --noche-dialog-border-soft: #1e1b17;
  --noche-dialog-title: #f0e8d5;
  --noche-dialog-copy: #6b5e48;
  --noche-dialog-label: #8a6828;
  --noche-dialog-paper: #f0e8d5;
  --noche-dialog-paper-ink: #1e1a14;
  --noche-dialog-danger: #8b2020;
  --noche-dialog-shadow:
    0 0 0 1px rgba(201, 150, 60, 0.06),
    0 32px 60px rgba(0, 0, 0, 0.46);
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
