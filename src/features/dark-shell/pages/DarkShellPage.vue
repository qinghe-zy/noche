<template>
  <view class="dark-shell theme-dark">
    <DarkTodaySection v-if="activeTab === 'today'" @open-archive="handleOpenArchive" />
    <DarkWritingSection v-else-if="activeTab === 'jotting'" />
    <DarkFutureSection v-else-if="activeTab === 'future'" />
    <DarkMailboxSection v-else />

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
import { ROUTES } from "@/shared/constants/routes";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { DarkShellTabId } from "@/features/dark-shell/darkShellTabs";
import DarkFutureSection from "@/features/dark-shell/components/DarkFutureSection.vue";
import DarkMailboxSection from "@/features/dark-shell/components/DarkMailboxSection.vue";
import DarkTodaySection from "@/features/dark-shell/components/DarkTodaySection.vue";
import DarkWritingSection from "@/features/dark-shell/components/DarkWritingSection.vue";
import { DARK_SHELL_TABS } from "@/features/dark-shell/darkShellTabs";
import ChisuSymbol from "@/features/dark-shell/components/ChisuSymbol.vue";

const settingsStore = useSettingsStore();
const locale = computed(() => settingsStore.locale);
const tabs = DARK_SHELL_TABS;
const activeTab = ref<DarkShellTabId>("today");

function handleOpenArchive(mode: "main" | "write") {
  const query = mode === "write" ? "?mode=write" : "";
  uni.navigateTo({
    url: `/${ROUTES.archive}${query}`,
  });
}
</script>

<style scoped>
.dark-shell,
.dark-shell * {
  box-sizing: border-box;
}

.dark-shell {
  height: 100vh;
  background: #0c0a08;
  color: #eae2ce;
  display: flex;
  flex-direction: column;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
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
