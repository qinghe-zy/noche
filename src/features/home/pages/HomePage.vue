<template>
  <view class="home-page" :class="[themeClass, typographyClass]">
    <view class="home-page__topnav">
      <view class="home-page__topnav-inner" :style="topnavInnerStyle">
        <view class="home-page__topnav-spacer"></view>
        <view class="home-page__topnav-profile-entry" @tap="handleNavigate('profile')">
          <text class="home-page__topnav-profile-text" :class="{ 'home-page__topnav-profile-text--latin': settingsStore.locale === 'en-US' }">
            {{ copy.home.profileCenter }}
          </text>
        </view>
      </view>
    </view>

    <view class="home-page__main" :style="mainStyle">
      <view class="home-page__hero">
        <text class="home-page__hero-title home-page__letter-spacing-widest">{{ homeHeroTitle }}</text>
        <text v-if="copy.home.heroSubtitle" class="home-page__hero-subtitle">
          {{ copy.home.heroSubtitle }}
        </text>
      </view>

      <view class="home-page__focus">
        <view
          class="home-page__paper-premium"
          @click="handleNavigate('editor', { type: 'diary', recordDate: todayDateKey })"
          @tap="handleNavigate('editor', { type: 'diary', recordDate: todayDateKey })"
        >
          <view class="home-page__paper-texture"></view>

          <view class="home-page__paper-inner">
            <view class="home-page__paper-line"></view>

            <view class="home-page__paper-content">
              <view class="home-page__paper-icon-wrap">
                <AppIcon name="stories" class="home-page__paper-icon" />
              </view>

              <view class="home-page__paper-copy">
                <text class="home-page__paper-heading home-page__letter-spacing-medium">{{ settingsStore.locale === "en-US" ? dailyPrompt.primaryEn : dailyPrompt.primaryZh }}</text>
                <text class="home-page__paper-subtitle">{{ settingsStore.locale === "en-US" ? dailyPrompt.subtitleEn : dailyPrompt.subtitleZh }}</text>
              </view>
            </view>

            <view class="home-page__paper-seal">
              <view class="home-page__paper-seal-dot"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="home-page__secondary-nav">
        <view class="home-page__nav-entry" @click="handleOpenJotting" @tap="handleOpenJotting">
          <view class="home-page__nav-entry-icon">
            <AppIcon name="edit-note" class="home-page__nav-entry-icon-svg" />
          </view>
          <text class="home-page__nav-entry-label" :class="{ 'home-page__nav-entry-label--latin': settingsStore.locale === 'en-US' }">{{ copy.home.jotting }}</text>
        </view>

        <view
          class="home-page__nav-entry"
          @click="handleNavigate('editor', { type: 'future' })"
          @tap="handleNavigate('editor', { type: 'future' })"
        >
          <view class="home-page__nav-entry-icon">
            <AppIcon name="mail" class="home-page__nav-entry-icon-svg" />
          </view>
          <text class="home-page__nav-entry-label" :class="{ 'home-page__nav-entry-label--latin': settingsStore.locale === 'en-US' }">{{ copy.home.future }}</text>
        </view>

        <view class="home-page__nav-entry" @click="handleNavigate('mailbox')" @tap="handleNavigate('mailbox')">
          <view class="home-page__nav-entry-icon">
            <AppIcon name="mailbox-post" class="home-page__nav-entry-icon-svg" />
          </view>
          <text class="home-page__nav-entry-label" :class="{ 'home-page__nav-entry-label--latin': settingsStore.locale === 'en-US' }">{{ copy.home.mailbox }}</text>
        </view>
      </view>
    </view>

    <view class="home-page__footer" :style="{ paddingBottom: `${homeBottomPadding}px` }">
      <text class="home-page__footer-text">{{ footerMark }}</text>
    </view>

    <view
      v-if="isJottingModalOpen"
      class="home-page__jotting-modal-mask"
      @click="handleCloseJottingModal"
    >
      <view class="home-page__jotting-modal" @click.stop>
        <view class="home-page__jotting-modal-head">
          <text class="home-page__jotting-modal-title">{{ copy.home.jottingModalTitle }}</text>
          <text class="home-page__jotting-modal-copy">{{ copy.home.jottingModalCopy }}</text>
        </view>

        <view class="home-page__jotting-modal-actions">
          <view class="home-page__jotting-modal-action" @click="handleContinueJottingDraft">
            <text class="home-page__jotting-modal-action-title">{{ copy.home.continueLast }}</text>
            <text class="home-page__jotting-modal-action-copy">{{ copy.home.continueLastCopy }}</text>
          </view>

          <view class="home-page__jotting-modal-action" @click="handleCreateAnotherJottingDraft">
            <text class="home-page__jotting-modal-action-title">{{ copy.home.startAnother }}</text>
            <text class="home-page__jotting-modal-action-copy">{{ copy.home.startAnotherCopy }}</text>
          </view>

          <view class="home-page__jotting-modal-action home-page__jotting-modal-action--muted" @click="handleCloseJottingModal">
            <text class="home-page__jotting-modal-action-title">{{ copy.home.cancel }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import dayjs from "dayjs";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ROUTES } from "@/shared/constants/routes";
import { useDraftStore } from "@/app/store/useDraftStore";
import type { Draft } from "@/domain/draft/types";
import { resolveDraftSaveAction } from "@/domain/services/entryService";
import { formatDate } from "@/shared/utils/date";
import { createDateChangeWatcher } from "@/shared/utils/dateChange";
import { resolveHomeDailyPrompt } from "@/features/home/homePrompt";
import { resolveHomeHeroTitle } from "@/features/home/homeHeroTitle";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { useThemeClass, useTypographyClass } from "@/shared/theme";
import AppIcon from "@/shared/ui/AppIcon.vue";
import { t } from "@/shared/i18n";

const draftStore = useDraftStore();
const settingsStore = useSettingsStore();
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const { homeTop, homeBottomPadding, statusBarHeight, rpxToPx } = useEditorKeyboardViewport();
const isJottingModalOpen = ref(false);
const pendingJottingDraft = ref<Draft | null>(null);
const copy = computed(() => t(settingsStore.locale));
const todayDateKey = ref(formatDate(new Date(), "YYYY-MM-DD"));
const dailyPrompt = computed(() => resolveHomeDailyPrompt(todayDateKey.value));
const homeHeroTitle = computed(() => resolveHomeHeroTitle({
  dateKey: todayDateKey.value,
  locale: settingsStore.locale,
  fallbackTitle: copy.value.home.title,
  titleMode: settingsStore.homeTitleMode,
  customTitle: settingsStore.homeCustomTitle,
}));
const topnavInnerStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
  paddingLeft: `${rpxToPx(32)}px`,
  paddingRight: `${rpxToPx(32)}px`,
}));
const mainStyle = computed(() => ({
  paddingTop: `${homeTop.value + rpxToPx(36)}px`,
  paddingBottom: `${homeBottomPadding.value}px`,
}));

const footerMark = computed(() => `${dayjs(todayDateKey.value).format(settingsStore.locale === "en-US" ? "MMM YYYY" : "YYYY年MM月")} · ${copy.value.home.footerSuffix}`);
const dateChangeWatcher = createDateChangeWatcher({
  getDateKey: () => formatDate(new Date(), "YYYY-MM-DD"),
  onDateChange: (nextDateKey) => {
    todayDateKey.value = nextDateKey;
  },
});

const handleNavigate = (routeKey: keyof typeof ROUTES, query?: Record<string, string>) => {
  let url = `/${ROUTES[routeKey]}`;
  if (query) {
    const queryString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    url += `?${queryString}`;
  }

  uni.navigateTo({
    url,
  });
};

const handleOpenJotting = async () => {
  const existingDraft = await draftStore.peekDraft({
    type: "jotting",
  });

  if (!existingDraft || resolveDraftSaveAction(existingDraft) !== "save-entry") {
    handleNavigate("editor", { type: "jotting" });
    return;
  }

  pendingJottingDraft.value = existingDraft;
  isJottingModalOpen.value = true;
};

function handleCloseJottingModal() {
  isJottingModalOpen.value = false;
  pendingJottingDraft.value = null;
}

function handleContinueJottingDraft() {
  handleCloseJottingModal();
  handleNavigate("editor", { type: "jotting" });
}

async function handleCreateAnotherJottingDraft() {
  if (pendingJottingDraft.value) {
    await draftStore.removeDraft(pendingJottingDraft.value.slotKey);
    uni.showToast({
      title: copy.value.home.discardedToast,
      icon: "none",
    });
  }

  handleCloseJottingModal();
  handleNavigate("editor", { type: "jotting" });
}

onMounted(() => {
  dateChangeWatcher.start();
});

onUnmounted(() => {
  dateChangeWatcher.stop();
});

onShow(() => {
  todayDateKey.value = formatDate(new Date(), "YYYY-MM-DD");
  dateChangeWatcher.sync();
});
</script>

<style scoped>
.home-page,
.home-page * {
  box-sizing: border-box;
}

.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  overflow-x: hidden;
  background-color: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  position: relative;
}

.home-page__topnav {
  width: 100%;
  z-index: 2;
  position: absolute;
  inset: 0 0 auto 0;
}

.home-page__topnav-inner {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.home-page__topnav-spacer {
  flex: 1;
}

.home-page__topnav-profile-entry {
  min-height: 72rpx;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--noche-muted);
  padding: 0;
  box-shadow: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 160ms ease, opacity 160ms ease;
}

.home-page__topnav-profile-text {
  font-size: 24rpx;
  line-height: 1.4;
  color: currentColor;
  letter-spacing: 0.18em;
  padding-left: 0.18em;
}

.home-page__topnav-profile-text--latin {
  letter-spacing: 0.06em;
  padding-left: 0.06em;
}

.home-page__topnav-profile-entry:active,
.home-page__topnav-profile-entry:hover {
  color: var(--noche-text);
}

.home-page__main {
  flex: 1;
  width: 100%;
  max-width: 768px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  z-index: 1;
}

.home-page__hero {
  margin-top: 12px;
  margin-bottom: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.home-page__hero-title {
  font-size: 38px;
  line-height: 1.15;
  font-weight: 200;
  color: var(--noche-text);
}

.home-page__hero-subtitle {
  max-width: min(100%, 420px);
  font-size: 12px;
  line-height: 1.7;
  color: var(--noche-muted);
  letter-spacing: 0.12em;
}

.home-page__letter-spacing-widest {
  letter-spacing: 0.8em;
  padding-left: 0.8em;
}

.home-page__letter-spacing-medium {
  letter-spacing: 0.35em;
  padding-left: 0.35em;
}

.home-page__focus {
  width: 100%;
  display: flex;
  justify-content: center;
  flex: 1;
  min-height: 0;
  align-items: center;
  margin-bottom: 36px;
}

.home-page__paper-premium {
  position: relative;
  width: min(100%, 340px);
  aspect-ratio: 1 / 1.4;
  padding: 48px;
  background-color: var(--noche-panel);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 10px 30px -5px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.02);
}

.home-page__paper-premium::after {
  content: "";
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(0, 0, 0, 0.03);
  pointer-events: none;
}

.home-page__paper-texture {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      180deg,
      rgba(160, 150, 136, 0.03) 0,
      rgba(160, 150, 136, 0.03) 2px,
      transparent 2px,
      transparent 18px
    );
  opacity: 0.8;
  pointer-events: none;
}

.home-page__paper-inner {
  width: 100%;
  height: 100%;
  border: 0.5px solid var(--noche-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.home-page__paper-line {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 0.5px;
  background: var(--noche-border);
}

.home-page__paper-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  z-index: 1;
}

.home-page__paper-icon-wrap {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-page__paper-icon {
  width: 40px;
  height: 40px;
  color: var(--noche-muted);
}

.home-page__paper-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.home-page__paper-heading {
  font-size: 30px;
  line-height: 1.3;
  font-weight: 300;
  color: var(--noche-text);
  text-align: center;
}

.home-page__paper-subtitle {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--noche-muted);
  padding-left: 0.4em;
}

.home-page__paper-seal {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.3;
}

.home-page__paper-seal-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  border: 1px solid var(--noche-border);
}

.home-page__secondary-nav {
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 28px;
}

.home-page__nav-entry {
  flex: 1;
  max-width: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
}

.home-page__nav-entry-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--noche-border);
  color: var(--noche-muted);
}

.home-page__nav-entry-icon-svg {
  width: 20px;
  height: 20px;
}

.home-page__nav-entry-label {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--noche-muted);
  padding-left: 0.3em;
}

.home-page__nav-entry-label--latin {
  letter-spacing: 0.08em;
  padding-left: 0.08em;
  line-height: 1.45;
  text-align: center;
}

.home-page__footer {
  margin-top: auto;
  padding-top: 12px;
  z-index: 1;
}

.home-page__footer-text {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 10px;
  letter-spacing: 0.6em;
  text-transform: uppercase;
  color: var(--noche-muted);
  padding-left: 0.6em;
}

.home-page__jotting-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px 16px 28px;
  background: var(--noche-overlay);
  backdrop-filter: blur(8px);
}

.home-page__jotting-modal {
  width: min(100%, 420px);
  background: rgba(252, 248, 241, 0.98);
  border: 1px solid var(--noche-border);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(44, 46, 42, 0.14);
  overflow: hidden;
}

.home-page__jotting-modal-head {
  padding: 26px 24px 18px;
  text-align: center;
  border-bottom: 1px solid var(--noche-border);
}

.home-page__jotting-modal-title {
  display: block;
  font-size: 24px;
  line-height: 1.35;
  color: var(--noche-text);
}

.home-page__jotting-modal-copy {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--noche-muted);
}

.home-page__jotting-modal-actions {
  display: flex;
  flex-direction: column;
}

.home-page__jotting-modal-action {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
  background: transparent;
}

.home-page__jotting-modal-action + .home-page__jotting-modal-action {
  border-top: 1px solid var(--noche-border);
}

.home-page__jotting-modal-action-title {
  font-size: 18px;
  line-height: 1.4;
  color: var(--noche-text);
}

.home-page__jotting-modal-action-copy {
  font-size: 12px;
  line-height: 1.7;
  color: var(--noche-muted);
}

.home-page__jotting-modal-action--muted .home-page__jotting-modal-action-title {
  color: var(--noche-muted);
}

.type-scale-small .home-page__hero-title { font-size: 36px; }
.type-scale-large .home-page__hero-title { font-size: 41px; }
.type-scale-small .home-page__hero-subtitle { font-size: 11px; }
.type-scale-large .home-page__hero-subtitle { font-size: 13px; }
.type-scale-small .home-page__paper-heading { font-size: 28px; }
.type-scale-large .home-page__paper-heading { font-size: 32px; }
.type-scale-small .home-page__paper-subtitle,
.type-scale-small .home-page__nav-entry-label,
.type-scale-small .home-page__footer-text { font-size: 9px; }
.type-scale-large .home-page__paper-subtitle,
.type-scale-large .home-page__nav-entry-label,
.type-scale-large .home-page__footer-text { font-size: 11px; }
.type-scale-small .home-page__jotting-modal-title { font-size: 23px; }
.type-scale-large .home-page__jotting-modal-title { font-size: 26px; }
.type-scale-small .home-page__jotting-modal-copy { font-size: 12px; }
.type-scale-large .home-page__jotting-modal-copy { font-size: 14px; }
.type-scale-small .home-page__jotting-modal-action-title { font-size: 17px; }
.type-scale-large .home-page__jotting-modal-action-title { font-size: 19px; }
.type-scale-small .home-page__jotting-modal-action-copy { font-size: 11px; }
.type-scale-large .home-page__jotting-modal-action-copy { font-size: 13px; }
</style>
