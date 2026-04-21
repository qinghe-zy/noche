<template>
  <view class="dark-shell theme-dark">
    <DarkTodaySection
      v-if="activeTab === 'today'"
      :welcome-content="welcomeContent"
      @open-archive="handleOpenArchive"
    />
    <DarkWritingSection v-else-if="activeTab === 'jotting'" />
    <DarkFutureSection v-else-if="activeTab === 'future'" />

    <view class="dark-shell__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="dark-shell__tab"
        :class="{ 'dark-shell__tab--active': activeTab === tab.id }"
        @tap="handleTabTap(tab.id)"
      >
        <view v-if="activeTab === tab.id" class="dark-shell__tab-active-line"></view>
        <view class="dark-shell__tab-icon">
          <image
            class="dark-shell__tab-icon-image"
            :src="tabIconSources[tab.id]"
            mode="aspectFit"
            aria-hidden="true"
          />
        </view>
        <text class="dark-shell__tab-label">{{ locale === 'en-US' ? tab.labelEn : tab.labelZh }}</text>
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
import DarkTodaySection from "@/features/dark-shell/components/DarkTodaySection.vue";
import DarkWritingSection from "@/features/dark-shell/components/DarkWritingSection.vue";
import { DARK_SHELL_TABS } from "@/features/dark-shell/darkShellTabs";

const settingsStore = useSettingsStore();
const locale = computed(() => settingsStore.locale);
const tabs = DARK_SHELL_TABS;
const activeTab = ref<DarkShellTabId>("today");

function escapeSvg(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%22/g, "'")
    .replace(/%2C/g, ",")
    .replace(/%3B/g, ";")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");
}

function buildGlyphDataUri(innerMarkup: string): string {
  return `data:image/svg+xml;utf8,${escapeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">${innerMarkup}</svg>`,
  )}`;
}

const tabIconSources: Record<DarkShellTabId, string> = {
  today: buildGlyphDataUri(`
    <path d='M7 4.5V7.2' stroke='#d3c4b1' stroke-width='1.7' stroke-linecap='round' />
    <path d='M17 4.5V7.2' stroke='#d3c4b1' stroke-width='1.7' stroke-linecap='round' />
    <path d='M4.5 8.2H19.5' stroke='#d3c4b1' stroke-width='1.7' stroke-linecap='round' />
    <rect x='4.5' y='6.5' width='15' height='13' rx='0.8' stroke='#d3c4b1' stroke-width='1.7' />
    <rect x='8.2' y='11.2' width='3.8' height='3.8' fill='#d3c4b1' />
  `),
  jotting: buildGlyphDataUri(`
    <path d='M5.5 6.5C7.9 6.5 9.7 7.1 12 8.5C14.3 7.1 16.1 6.5 18.5 6.5V18.5C16.4 18.5 14.5 19 12 20.4C9.5 19 7.6 18.5 5.5 18.5V6.5Z' stroke='#d3c4b1' stroke-width='1.7' stroke-linejoin='round' />
    <path d='M12 8.5V20.4' stroke='#d3c4b1' stroke-width='1.7' stroke-linecap='round' />
    <path d='M8.2 11.1H10.6' stroke='#d3c4b1' stroke-width='1.5' stroke-linecap='round' />
    <path d='M13.4 11.1H15.8' stroke='#d3c4b1' stroke-width='1.5' stroke-linecap='round' />
    <path d='M8.2 14.1H10.6' stroke='#d3c4b1' stroke-width='1.5' stroke-linecap='round' />
    <path d='M13.4 14.1H15.8' stroke='#d3c4b1' stroke-width='1.5' stroke-linecap='round' />
  `),
  future: buildGlyphDataUri(`
    <path d='M12 3.8L14.2 9.8L20.2 12L14.2 14.2L12 20.2L9.8 14.2L3.8 12L9.8 9.8L12 3.8Z' fill='#d3c4b1' />
  `),
  profile: buildGlyphDataUri(`
    <circle cx='12' cy='8.3' r='3.1' stroke='#d3c4b1' stroke-width='1.7' />
    <path d='M6.5 18.3C7.4 15.8 9.4 14.5 12 14.5C14.6 14.5 16.6 15.8 17.5 18.3' stroke='#d3c4b1' stroke-width='1.7' stroke-linecap='round' />
  `),
};

defineProps<{
  welcomeContent?: string;
}>();

function handleOpenArchive(mode: "main" | "write") {
  const query = mode === "write" ? "?mode=write" : "";
  uni.navigateTo({
    url: `/${ROUTES.archive}${query}`,
  });
}

function handleTabTap(tabId: DarkShellTabId) {
  if (tabId === "profile") {
    uni.navigateTo({
      url: `/${ROUTES.profile}`,
    });
    return;
  }

  activeTab.value = tabId;
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
  padding: 0 0 calc(env(safe-area-inset-bottom, 0px) + 10px);
  border-top: 1px solid rgba(52, 48, 43, 0.96);
  background: rgba(29, 27, 25, 0.98);
  backdrop-filter: blur(14px);
}

.dark-shell__tab {
  position: relative;
  border: none;
  background: transparent;
  color: #c8bca9;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 0 10px;
}

.dark-shell__tab--active {
  color: #f5bd5f;
}

.dark-shell__tab-icon {
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-shell__tab-icon-image {
  width: 24px;
  height: 24px;
  display: block;
}

.dark-shell__tab-active-line {
  position: absolute;
  top: 8px;
  width: 28px;
  height: 2px;
  background: #f5bd5f;
}

.dark-shell__tab-label {
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.22em;
  padding-left: 0.22em;
}
</style>
