<template>
  <view class="dark-shell theme-dark">
    <view class="dark-shell__body">
      <view class="dark-shell__placeholder">
        <text class="dark-shell__title">尺 素</text>
        <text class="dark-shell__subtitle">Dark shell in progress</text>
      </view>
    </view>

    <view class="dark-shell__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="dark-shell__tab"
        :class="{ 'dark-shell__tab--active': activeTab === tab.id }"
        @tap="activeTab = tab.id"
      >
        <ChisuSymbol :symbol="tab.symbol" :tone="activeTab === tab.id ? 'active' : 'muted'" />
        <text class="dark-shell__tab-label">{{ locale === 'en-US' ? tab.labelEn : tab.labelZh }}</text>
        <view v-if="activeTab === tab.id" class="dark-shell__tab-dot"></view>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { DarkShellTabId } from "@/features/dark-shell/darkShellTabs";
import { DARK_SHELL_TABS } from "@/features/dark-shell/darkShellTabs";
import ChisuSymbol from "@/features/dark-shell/components/ChisuSymbol.vue";

const settingsStore = useSettingsStore();
const locale = computed(() => settingsStore.locale);
const tabs = DARK_SHELL_TABS;
const activeTab = ref<DarkShellTabId>("today");
</script>

<style scoped>
.dark-shell,
.dark-shell * {
  box-sizing: border-box;
}

.dark-shell {
  min-height: 100vh;
  background: #0c0a08;
  color: #eae2ce;
  display: flex;
  flex-direction: column;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.dark-shell__body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 28px 96px;
}

.dark-shell__placeholder {
  width: 100%;
  max-width: 390px;
  border: 1px solid #1e1a14;
  padding: 32px 24px;
  background: #131009;
  text-align: center;
}

.dark-shell__title {
  display: block;
  font-size: 52px;
  line-height: 1.08;
  letter-spacing: 0.26em;
  padding-left: 0.26em;
}

.dark-shell__subtitle {
  display: block;
  margin-top: 14px;
  font-size: 14px;
  line-height: 1.8;
  color: #564e42;
}

.dark-shell__tabs {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 10px 0 calc(env(safe-area-inset-bottom, 0px) + 12px);
  border-top: 1px solid #1e1a14;
  background: #0c0a08;
}

.dark-shell__tab {
  border: none;
  background: transparent;
  color: #564e42;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.dark-shell__tab--active {
  color: #eae2ce;
}

.dark-shell__tab-label {
  font-size: 12px;
  line-height: 1.4;
}

.dark-shell__tab-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #a83228;
}
</style>
