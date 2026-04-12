<template>
  <view class="app-shell"></view>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { applyThemeMode } from "@/shared/theme";

const settingsStore = useSettingsStore();

watch(
  () => settingsStore.theme,
  (theme) => {
    applyThemeMode(theme);
  },
  {
    immediate: true,
  },
);
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
}
</style>
