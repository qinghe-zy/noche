<template>
  <view class="home-page" :class="[themeClass, typographyClass]">
    <view class="home-page__topnav">
      <view class="home-page__topnav-inner" :style="topnavInnerStyle">
        <view
          class="home-page__topnav-showcase-entry"
          :class="{ 'home-page__topnav-showcase-entry--pulse': isShowcasePulsing }"
          @tap="handleNavigate('homeCardShowcase')"
          @click="handleNavigate('homeCardShowcase')"
        >
          <view class="home-page__showcase-stack">
            <view class="home-page__showcase-stack-card home-page__showcase-stack-card--back"></view>
            <view class="home-page__showcase-stack-card home-page__showcase-stack-card--mid"></view>
            <view class="home-page__showcase-stack-card home-page__showcase-stack-card--front"></view>
          </view>
        </view>
        <view class="home-page__topnav-spacer"></view>
        <view class="home-page__topnav-profile-entry" @tap="handleNavigate('profile')" @click="handleNavigate('profile')">
          <text class="home-page__topnav-profile-text" :class="{ 'home-page__topnav-profile-text--latin': settingsStore.locale === 'en-US' }">
            {{ copy.home.profileCenter }}
          </text>
        </view>
      </view>
    </view>

    <view class="home-page__main" :style="mainStyle">
      <view class="home-page__hero">
        <text class="home-page__hero-title home-page__letter-spacing-widest">{{ homeHeroTitle }}</text>
        <text v-if="activeWelcomeCard.content" class="home-page__hero-subtitle">
          {{ activeWelcomeCard.content }}
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
      v-if="shouldRenderWelcomeCard"
      class="home-page__welcome-card-mask"
      :class="`home-page__welcome-card-mask--${welcomeCardStage}`"
    >
      <view class="home-page__welcome-card-mask-close" @tap="handleDismissWelcomeCard" @click="handleDismissWelcomeCard"></view>

      <view
        class="home-page__welcome-card"
        :class="`home-page__welcome-card--${welcomeCardStage}`"
        @tap="handleWelcomeCardTap"
        @click="handleWelcomeCardTap"
      >
        <view class="home-page__welcome-card-stack">
          <view class="home-page__welcome-card-face">
            <view class="home-page__welcome-card-face-inner">
              <view
                class="home-page__welcome-card-header"
                :class="isWelcomeCardReadingPhase ? 'home-page__welcome-card-header--reading' : 'home-page__welcome-card-header--title'"
              >
                <view class="home-page__welcome-card-glyph-chip">
                  <text class="home-page__welcome-card-glyph">{{ welcomeCardGlyph }}</text>
                </view>
              </view>

              <view
                class="home-page__welcome-card-body"
                :class="isWelcomeCardReadingPhase ? 'home-page__welcome-card-body--reading' : 'home-page__welcome-card-body--title'"
              >
                <text
                  class="home-page__welcome-card-eyebrow"
                  :class="isWelcomeCardReadingPhase ? 'home-page__welcome-card-eyebrow--reading' : 'home-page__welcome-card-eyebrow--title'"
                >{{ welcomeCardEyebrow }}</text>
                <text v-if="!isWelcomeCardReadingPhase" class="home-page__welcome-card-title home-page__welcome-card-title--cover">{{ welcomeCardTitle }}</text>
                <text v-else class="home-page__welcome-card-content home-page__welcome-card-content--reading">{{ activeWelcomeCard.content }}</text>
              </view>

              <view class="home-page__welcome-card-footer">
                <view class="home-page__welcome-card-divider"></view>

                <view v-if="welcomeCardStage === 'expanded'" class="home-page__welcome-card-actions">
                  <view class="home-page__welcome-card-pill home-page__welcome-card-pill--secondary" @tap.stop="handleDismissWelcomeCard" @click.stop="handleDismissWelcomeCard">
                    <text class="home-page__welcome-card-pill-label home-page__welcome-card-pill-label--secondary">{{ welcomeCardDismissLabel }}</text>
                  </view>
                  <view class="home-page__welcome-card-pill" @tap.stop="handleCollectWelcomeCard" @click.stop="handleCollectWelcomeCard">
                    <text class="home-page__welcome-card-pill-label">{{ welcomeCardCollectLabel }}</text>
                  </view>
                </view>

                <view v-else class="home-page__welcome-card-pill home-page__welcome-card-pill--primary-action">
                  <text class="home-page__welcome-card-pill-label">{{ welcomeCardActionLabel }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="isJottingModalOpen" class="home-page__jotting-modal-mask" @click="handleCloseJottingModal">
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
import {
  isHomeWelcomeCardCollected,
  markHomeWelcomeCardSeen,
  markHomeWelcomeCardCollected,
  markHomeWelcomeCardResolved,
  type HomeWelcomeCard,
  readHomeWelcomeCardSeenDate,
  resolveHomeWelcomeCard,
  resolveHomeWelcomeCardEyebrow,
  resolveHomeWelcomeCardGlyph,
  resolveHomeWelcomeCardTitle,
  shouldAutoShowHomeWelcomeCard,
} from "@/features/home/homeWelcomeCard";
import { resolveHomeHeroTitle } from "@/features/home/homeHeroTitle";
import {
  prefetchRemoteHomeWelcomeCard,
  type RemoteHomeWelcomeCardRecord,
} from "@/features/home/homeWelcomeCardRemote";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { useThemeClass, useTypographyClass } from "@/shared/theme";
import AppIcon from "@/shared/ui/AppIcon.vue";
import { t } from "@/shared/i18n";

type HomeWelcomeCardStage = "hidden" | "entering" | "stack" | "expanded" | "collecting" | "dismissing";
type ActiveHomeWelcomeCard = Pick<HomeWelcomeCard, "id" | "content" | "type"> & { source: "local" | "remote" };

const draftStore = useDraftStore();
const settingsStore = useSettingsStore();
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const { homeTop, homeBottomPadding, statusBarHeight, rpxToPx } = useEditorKeyboardViewport();
const isJottingModalOpen = ref(false);
const pendingJottingDraft = ref<Draft | null>(null);
const welcomeCardStage = ref<HomeWelcomeCardStage>("hidden");
const isShowcasePulsing = ref(false);
const copy = computed(() => t(settingsStore.locale));
const todayDateKey = ref(formatDate(new Date(), "YYYY-MM-DD"));
const dailyPrompt = computed(() => resolveHomeDailyPrompt(todayDateKey.value));
const activeWelcomeCard = ref<ActiveHomeWelcomeCard>(resolveLocalActiveWelcomeCard(todayDateKey.value));
const homeHeroTitle = computed(() => resolveHomeHeroTitle({
  dateKey: todayDateKey.value,
  locale: settingsStore.locale,
  fallbackTitle: copy.value.home.title,
  titleMode: settingsStore.homeTitleMode,
  customTitle: settingsStore.homeCustomTitle,
}));
const shouldRenderWelcomeCard = computed(() => welcomeCardStage.value !== "hidden");
const welcomeCardGlyph = computed(() => resolveHomeWelcomeCardGlyph(activeWelcomeCard.value.type));
const welcomeCardEyebrow = computed(() => resolveHomeWelcomeCardEyebrow(activeWelcomeCard.value.type, settingsStore.locale));
const welcomeCardTitle = computed(() => resolveHomeWelcomeCardTitle(activeWelcomeCard.value.type, settingsStore.locale));
const isWelcomeCardReadingPhase = computed(() => ["expanded", "collecting", "dismissing"].includes(welcomeCardStage.value));
const welcomeCardActionLabel = computed(() => settingsStore.locale === "en-US" ? "Read note" : "查看正文");
const welcomeCardCollectLabel = computed(() => settingsStore.locale === "en-US" ? "Keep this card" : "收下卡片");
const welcomeCardDismissLabel = computed(() => settingsStore.locale === "en-US" ? "Return" : "回到主页");
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
let welcomeCardTimers: Array<ReturnType<typeof setTimeout>> = [];

const dateChangeWatcher = createDateChangeWatcher({
  getDateKey: () => formatDate(new Date(), "YYYY-MM-DD"),
  onDateChange: (nextDateKey) => {
    todayDateKey.value = nextDateKey;
    resetWelcomeCard();
    syncActiveWelcomeCardWithLocal(nextDateKey);
    syncWelcomeCardAutoPresentation(nextDateKey);
    void prefetchTodayRemoteWelcomeCard(nextDateKey);
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

function scheduleWelcomeCardStage(callback: () => void, delayMs: number): void {
  const timer = setTimeout(() => {
    welcomeCardTimers = welcomeCardTimers.filter((item) => item !== timer);
    callback();
  }, delayMs);

  welcomeCardTimers.push(timer);
}

function clearWelcomeCardTimer(): void {
  if (!welcomeCardTimers.length) {
    return;
  }

  welcomeCardTimers.forEach((timer) => clearTimeout(timer));
  welcomeCardTimers = [];
}

function resetWelcomeCard(): void {
  clearWelcomeCardTimer();
  welcomeCardStage.value = "hidden";
  isShowcasePulsing.value = false;
}

function resolveLocalActiveWelcomeCard(dateKey: string): ActiveHomeWelcomeCard {
  const card = resolveHomeWelcomeCard(dateKey);

  return {
    id: card.id,
    content: card.content,
    type: card.type,
    source: "local",
  };
}

function resolveRemoteActiveWelcomeCard(card: RemoteHomeWelcomeCardRecord): ActiveHomeWelcomeCard {
  return {
    id: card.id,
    content: card.content,
    type: card.type,
    source: "remote",
  };
}

function syncActiveWelcomeCardWithLocal(dateKey = todayDateKey.value): void {
  activeWelcomeCard.value = resolveLocalActiveWelcomeCard(dateKey);
}

function syncWelcomeCardPresentation(dateKey = todayDateKey.value): void {
  clearWelcomeCardTimer();

  if (isHomeWelcomeCardCollected(dateKey, activeWelcomeCard.value.id)) {
    welcomeCardStage.value = "hidden";
    return;
  }

  markHomeWelcomeCardResolved(dateKey, activeWelcomeCard.value.id);

  welcomeCardStage.value = "entering";
  scheduleWelcomeCardStage(() => {
    welcomeCardStage.value = "stack";
  }, 260);
}

function syncWelcomeCardAutoPresentation(dateKey = todayDateKey.value): void {
  const lastSeenDate = readHomeWelcomeCardSeenDate();

  if (!shouldAutoShowHomeWelcomeCard(dateKey, lastSeenDate)) {
    clearWelcomeCardTimer();
    welcomeCardStage.value = "hidden";
    return;
  }

  markHomeWelcomeCardSeen(dateKey);
  syncWelcomeCardPresentation(dateKey);
}

async function prefetchTodayRemoteWelcomeCard(dateKey = todayDateKey.value): Promise<void> {
  const locale = settingsStore.locale;
  const remoteCard = await prefetchRemoteHomeWelcomeCard(dateKey, locale);

  if (!remoteCard || todayDateKey.value !== dateKey || settingsStore.locale !== locale) {
    return;
  }

  if (isHomeWelcomeCardCollected(dateKey, remoteCard.id)) {
    activeWelcomeCard.value = resolveRemoteActiveWelcomeCard(remoteCard);
    welcomeCardStage.value = "hidden";
    return;
  }

  if (["expanded", "collecting", "dismissing"].includes(welcomeCardStage.value)) {
    return;
  }

  activeWelcomeCard.value = resolveRemoteActiveWelcomeCard(remoteCard);
}

function handleDismissWelcomeCard(): void {
  if (welcomeCardStage.value === "hidden" || welcomeCardStage.value === "dismissing") {
    return;
  }

  clearWelcomeCardTimer();
  welcomeCardStage.value = "dismissing";
  scheduleWelcomeCardStage(() => {
    welcomeCardStage.value = "hidden";
  }, 340);
}

function handleWelcomeCardTap(): void {
  if (welcomeCardStage.value !== "stack") {
    return;
  }

  clearWelcomeCardTimer();
  welcomeCardStage.value = "expanded";
}

function handleCollectWelcomeCard(): void {
  if (welcomeCardStage.value !== "expanded") {
    return;
  }

  clearWelcomeCardTimer();
  welcomeCardStage.value = "collecting";
  isShowcasePulsing.value = true;
  scheduleWelcomeCardStage(() => {
    markHomeWelcomeCardCollected(todayDateKey.value, activeWelcomeCard.value.id);
    welcomeCardStage.value = "hidden";
    isShowcasePulsing.value = false;
    uni.showToast({
      title: settingsStore.locale === "en-US" ? "Card saved" : "已经收下卡片",
      icon: "none",
    });
  }, 420);
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
  syncActiveWelcomeCardWithLocal();
  syncWelcomeCardAutoPresentation();
  void prefetchTodayRemoteWelcomeCard();
});

onUnmounted(() => {
  dateChangeWatcher.stop();
  clearWelcomeCardTimer();
});

onShow(() => {
  todayDateKey.value = formatDate(new Date(), "YYYY-MM-DD");
  dateChangeWatcher.sync();
  syncActiveWelcomeCardWithLocal();
  syncWelcomeCardAutoPresentation();
  void prefetchTodayRemoteWelcomeCard();
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
  background:
    radial-gradient(circle at top left, var(--page-atmosphere-primary, transparent), transparent 30%),
    radial-gradient(circle at top right, var(--page-atmosphere-secondary, transparent), transparent 24%),
    var(--app-bg, var(--noche-bg));
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-body, inherit);
  position: relative;
  --home-accent-brand: var(--accent-brand);
  --home-surface-primary: var(--surface-primary);
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

.home-page__topnav-showcase-entry {
  min-height: 72rpx;
  display: inline-flex;
  align-items: center;
  color: var(--button-topbar-text, var(--text-secondary, var(--noche-muted)));
  transition: transform 220ms ease, color 180ms ease;
}

.home-page__topnav-showcase-entry--pulse {
  transform: scale(1.08);
  color: var(--accent-brand, var(--text-primary, var(--noche-text)));
}

.home-page__showcase-stack {
  position: relative;
  width: 52rpx;
  height: 44rpx;
}

.home-page__showcase-stack-card {
  position: absolute;
  inset: auto 0 0 auto;
  width: 38rpx;
  height: 28rpx;
  border-radius: 10rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(244, 236, 226, 0.94));
  border: 1px solid rgba(195, 183, 169, 0.56);
  box-shadow: var(--shadow-whisper, 0 6px 16px rgba(75, 67, 58, 0.08));
}

.home-page__showcase-stack-card--back {
  left: 0;
  top: 8rpx;
  transform: rotate(-8deg);
  opacity: 0.74;
}

.home-page__showcase-stack-card--mid {
  left: 8rpx;
  top: 4rpx;
  transform: rotate(-2deg);
  opacity: 0.88;
}

.home-page__showcase-stack-card--front {
  left: 16rpx;
  top: 0;
}

.home-page__topnav-profile-entry {
  min-height: 72rpx;
  border: 1px solid var(--button-topbar-border, transparent);
  background: var(--button-topbar-bg, var(--button-ghost-bg, transparent));
  border-radius: var(--button-pill-radius, 999px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--button-topbar-text, var(--text-secondary, var(--noche-muted)));
  padding: 0;
  box-shadow: var(--button-topbar-shadow, none);
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
  color: var(--button-topbar-active-text, var(--button-primary-bg, var(--accent-brand, var(--text-primary, var(--noche-text)))));
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
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-heading);
}

.home-page__hero-subtitle {
  max-width: min(100%, 420px);
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-secondary, var(--noche-muted));
  letter-spacing: 0.12em;
  font-family: var(--font-body);
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
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--surface-primary, #fbf4e8) 96%, white 4%),
      color-mix(in srgb, var(--surface-primary, #fbf4e8) 88%, var(--surface-secondary, #e3d5be) 12%)
    );
  border: 1px solid var(--border-prominent, var(--border-subtle, var(--noche-border)));
  box-shadow: var(--shadow-whisper, 0 18px 38px rgba(101, 81, 58, 0.09));
}

.home-page__paper-premium::after {
  content: "";
  position: absolute;
  inset: 8px;
  border: 1px solid color-mix(in srgb, var(--border-subtle, #d7c8b1) 82%, transparent);
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
  border: 0.5px solid var(--border-subtle, var(--noche-border));
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
  color: var(--home-accent-brand, var(--noche-muted));
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
  color: var(--text-primary, var(--noche-text));
  text-align: center;
  font-family: var(--font-heading);
}

.home-page__paper-subtitle {
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--text-secondary, var(--noche-muted));
  padding-left: 0.4em;
  font-family: var(--font-body, inherit);
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
  border-radius: var(--button-radius, 18px);
  background: var(--button-ghost-bg, transparent);
  border: 1px solid var(--button-ghost-border, transparent);
}

.home-page__nav-entry-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--button-secondary-border, var(--noche-border));
  color: var(--button-secondary-text, var(--noche-muted));
  background: var(--button-secondary-bg, transparent);
  border-radius: var(--button-radius, 18px);
  box-shadow: var(--button-secondary-shadow, none);
}

.home-page__nav-entry-icon-svg {
  width: 20px;
  height: 20px;
}

.home-page__nav-entry-label {
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--text-secondary, var(--noche-muted));
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
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.6em;
  text-transform: uppercase;
  color: var(--text-secondary, var(--noche-muted));
  padding-left: 0.6em;
}

.home-page__welcome-card-mask {
  position: fixed;
  inset: 0;
  z-index: 24;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(245, 241, 234, 0.84);
  backdrop-filter: blur(18px);
  opacity: 0;
  transition: opacity 220ms ease;
}

.home-page__welcome-card-mask-close {
  position: absolute;
  inset: 0;
}

.home-page__welcome-card-mask--entering,
.home-page__welcome-card-mask--stack,
.home-page__welcome-card-mask--expanded,
.home-page__welcome-card-mask--collecting,
.home-page__welcome-card-mask--dismissing {
  opacity: 1;
}

.home-page__welcome-card {
  width: min(100%, 408px);
  height: 500px;
  position: relative;
  opacity: 0;
  transform: translateY(18px) scale(0.985);
  transition:
    opacity 280ms ease,
    transform 320ms ease;
}

.home-page__welcome-card--entering,
.home-page__welcome-card--stack,
.home-page__welcome-card--expanded,
.home-page__welcome-card--collecting {
  opacity: 1;
  transform: translateY(0);
}

.home-page__welcome-card--expanded {
  transform: translateY(0) scale(1.03);
}

.home-page__welcome-card--collecting {
  opacity: 0.16;
  transform: translate(-44vw, -34vh) scale(0.18);
}

.home-page__welcome-card--dismissing {
  opacity: 0;
  transform: translateY(160px) scale(0.98);
}

.home-page__welcome-card-stack {
  position: absolute;
  inset: 0;
}

.home-page__welcome-card-face {
  position: absolute;
  left: 50%;
  width: 332px;
  border-radius: 38px;
  transition:
    transform 320ms ease,
    opacity 360ms ease,
    box-shadow 360ms ease;
}

.home-page__welcome-card-face {
  top: 48px;
  height: 404px;
  transform: translateX(-50%) scale(0.98);
  z-index: 1;
  opacity: 1;
}

.home-page__welcome-card-face-inner {
  height: 404px;
  padding: 36px 34px 30px;
  border-radius: 38px;
  background: var(--surface-secondary, var(--noche-surface));
  border: 1px solid var(--border-prominent, var(--border-subtle, var(--noche-border)));
  box-shadow: var(--shadow-whisper, 0 24px 56px rgba(101, 81, 58, 0.12));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.home-page__welcome-card-face-inner::before {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 30px;
  border: 1px solid color-mix(in srgb, var(--border-subtle, #d7c8b1) 56%, white);
  pointer-events: none;
}

.home-page__welcome-card-face-inner::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0)),
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.26), transparent 34%),
    radial-gradient(circle at bottom right, rgba(205, 194, 179, 0.12), transparent 30%);
  pointer-events: none;
}

.home-page__welcome-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
  z-index: 1;
  padding-bottom: 8px;
}

.home-page__welcome-card-header--title {
  justify-content: center;
  padding-bottom: 24px;
}

.home-page__welcome-card-header--reading {
  justify-content: flex-start;
  padding-bottom: 10px;
}

.home-page__welcome-card--stack .home-page__welcome-card-face,
.home-page__welcome-card--entering .home-page__welcome-card-face {
  transform: translateX(-50%) scale(0.98);
}

.home-page__welcome-card--expanded .home-page__welcome-card-face {
  transform: translateX(-50%) scale(1.03);
}

.home-page__welcome-card--expanded .home-page__welcome-card-face-inner {
  box-shadow: var(--shadow-whisper, 0 28px 64px rgba(44, 47, 48, 0.09));
}

.home-page__welcome-card--collecting .home-page__welcome-card-face {
  transform: translateX(-50%) scale(0.92);
}

.home-page__welcome-card--dismissing .home-page__welcome-card-face {
  transform: translateX(-50%) translateY(120px) scale(0.98);
}

.home-page__welcome-card-glyph {
  font-size: 28px;
  line-height: 1;
  color: var(--noche-text);
}

.home-page__welcome-card-glyph-chip {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-secondary, var(--noche-panel));
  border: 1px solid var(--border-subtle, var(--noche-border));
  box-shadow: var(--shadow-whisper, 0 6px 14px rgba(44, 47, 48, 0.05));
}

.home-page__welcome-card-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  z-index: 1;
  padding-top: 10px;
  min-height: 0;
  flex: 1 1 auto;
}

.home-page__welcome-card-body--title {
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 26px;
}

.home-page__welcome-card-body--reading {
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 18px;
}

.home-page__welcome-card-eyebrow {
  font-family: var(--font-body, inherit);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary, var(--noche-muted));
  letter-spacing: 0.26em;
  text-transform: uppercase;
  padding-left: 0.26em;
}

.home-page__welcome-card-eyebrow--title {
  align-self: center;
  letter-spacing: 0.34em;
  padding-left: 0.34em;
}

.home-page__welcome-card-eyebrow--reading {
  align-self: flex-start;
}

.home-page__welcome-card-title {
  font-family: var(--font-heading, inherit);
  font-size: 48px;
  line-height: 0.96;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary, var(--noche-text));
  white-space: pre-line;
  max-width: 220px;
  align-self: flex-start;
}

.home-page__welcome-card-title--cover {
  text-align: center;
  align-self: center;
}

.home-page__welcome-card-content {
  font-family: var(--font-body, inherit);
  font-size: 19px;
  line-height: 1.6;
  color: var(--text-secondary, var(--noche-text));
  letter-spacing: 0.02em;
  max-width: 220px;
  align-self: flex-start;
}

.home-page__welcome-card-content--reading {
  text-align: left;
}

.home-page__welcome-card-footer {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.home-page__welcome-card-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(200, 191, 180, 0.1), rgba(200, 191, 180, 0.56), rgba(200, 191, 180, 0.1));
}

.home-page__welcome-card-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 10px 10px 8px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0)),
    rgba(233, 225, 214, 0.42);
  border: 1px solid rgba(214, 204, 191, 0.32);
}

.home-page__welcome-card-pill {
  flex: 1 1 0;
  min-width: 0;
  height: 62px;
  padding: 0 18px;
  border-radius: 24px;
  background: var(--button-pill-bg, var(--button-primary-bg, var(--noche-panel)));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--button-pill-shadow, var(--button-primary-shadow, 0 8px 18px rgba(44, 47, 48, 0.04)));
  border: 1px solid var(--button-pill-border, var(--button-primary-border, var(--noche-border)));
  align-self: stretch;
  position: relative;
  overflow: hidden;
  transform: scale(0.98);
  transition: transform 220ms ease;
}

.home-page__welcome-card-pill::before {
  content: "";
  position: absolute;
  top: 12px;
  left: 50%;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  transform: translateX(-50%);
  background: rgba(226, 218, 206, 0.82);
  box-shadow:
    inset 0 1px 2px rgba(126, 112, 96, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.5);
  opacity: 0.92;
}

.home-page__welcome-card-pill::after {
  content: "";
  position: absolute;
  inset: 6px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  pointer-events: none;
}

.home-page__welcome-card-pill--primary-action {
  width: min(100%, 244px);
  flex: 0 1 auto;
  align-self: center;
}

.home-page__welcome-card-pill--secondary {
  background: var(--button-chip-bg, var(--button-secondary-bg, var(--noche-surface)));
  box-shadow: var(--button-chip-shadow, var(--button-secondary-shadow, none));
  border-color: var(--button-chip-border, var(--button-secondary-border, var(--noche-border)));
}

.home-page__welcome-card-pill-label {
  font-family: var(--font-body, inherit);
  font-size: 15px;
  line-height: 1;
  color: var(--button-pill-text, var(--button-primary-text, var(--noche-text)));
  font-weight: 500;
  letter-spacing: 0.01em;
}

.home-page__welcome-card-pill-label--secondary {
  color: var(--button-chip-text, var(--button-secondary-text, var(--noche-muted)));
}
.home-page__welcome-card--expanded .home-page__welcome-card-pill {
  transform: scale(1);
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
  background: var(--surface-primary, rgba(252, 248, 241, 0.98));
  border: 1px solid var(--border-subtle, var(--noche-border));
  border-radius: 22px;
  box-shadow:
    0 18px 40px rgba(101, 81, 58, 0.16),
    var(--shadow-ring, 0 0 0 1px rgba(165, 133, 102, 0.28));
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
  background: var(--button-secondary-bg, transparent);
  border: 1px solid var(--button-secondary-border, transparent);
  margin: 10px 16px 0;
  border-radius: var(--button-radius, 18px);
  box-shadow: var(--button-secondary-shadow, none);
}

.home-page__jotting-modal-action + .home-page__jotting-modal-action {
  border-top: none;
}

.home-page__jotting-modal-action-title {
  font-size: 18px;
  line-height: 1.4;
  color: var(--button-secondary-text, var(--noche-text));
}

.home-page__jotting-modal-action-copy {
  font-size: 12px;
  line-height: 1.7;
  color: var(--noche-muted);
}

.home-page__jotting-modal-action--muted .home-page__jotting-modal-action-title {
  color: var(--button-ghost-text, var(--noche-muted));
}

.theme-family-claude.home-page {
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent-brand, #c96442) 16%, transparent), transparent 34%),
    radial-gradient(circle at top right, color-mix(in srgb, var(--surface-secondary, #e3d5be) 88%, transparent), transparent 38%),
    linear-gradient(180deg, color-mix(in srgb, var(--app-bg, #efe7d8) 90%, white 10%), var(--app-bg, #efe7d8));
}

.theme-family-claude .home-page__topnav-showcase-entry,
.theme-family-claude .home-page__topnav-profile-entry {
  background: color-mix(in srgb, var(--surface-primary, #fbf4e8) 88%, white 12%);
  border-color: color-mix(in srgb, var(--border-subtle, #d7c8b1) 86%, transparent);
  box-shadow: var(--shadow-ring, none);
}

.theme-family-claude .home-page__topnav-showcase-entry {
  background: var(--button-primary-bg, #c96442);
  border: 1px solid var(--button-primary-border, #c96442);
  border-radius: var(--button-pill-radius, 999px);
  padding: 0 18rpx;
  color: var(--button-primary-text, #fbf4e8);
  box-shadow: var(--button-primary-shadow, none);
}

.theme-family-claude .home-page__showcase-stack-card {
  background: linear-gradient(180deg, color-mix(in srgb, white 86%, var(--surface-primary, #fbf4e8)), color-mix(in srgb, var(--surface-primary, #fbf4e8) 82%, var(--surface-secondary, #e3d5be) 18%));
  border-color: var(--border-prominent, #c9b89e);
}

.theme-family-claude .home-page__paper-premium {
  box-shadow:
    0 24px 56px color-mix(in srgb, var(--text-primary, #1b1713) 12%, transparent),
    var(--shadow-ring, none);
}

.theme-family-claude .home-page__paper-inner {
  border-color: var(--border-prominent, var(--border-subtle, #d7c8b1));
}

.theme-family-claude .home-page__paper-texture {
  opacity: 1;
}

.theme-family-claude .home-page__paper-line {
  background: var(--border-prominent, var(--noche-border));
}

.theme-family-claude .home-page__paper-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--button-primary-bg, #c96442);
  border: 1px solid var(--button-primary-border, #c96442);
  box-shadow: var(--button-primary-shadow, none);
}

.theme-family-claude .home-page__paper-icon {
  color: var(--button-primary-text, #fbf4e8);
}

.theme-family-claude .home-page__paper-heading {
  font-size: 34px;
  line-height: 1.24;
}

.theme-family-claude .home-page__paper-seal-dot {
  border-color: var(--border-prominent, var(--noche-border));
}

.theme-family-claude .home-page__nav-entry {
  background: color-mix(in srgb, var(--surface-primary, #fbf4e8) 82%, transparent);
  border-color: color-mix(in srgb, var(--border-subtle, #d7c8b1) 78%, transparent);
  box-shadow: var(--shadow-ring, none);
}

.theme-family-claude .home-page__nav-entry-icon {
  background: var(--button-pill-bg, transparent);
  border-color: var(--button-pill-border, var(--noche-border));
  box-shadow: var(--button-pill-shadow, none);
  color: var(--button-pill-text, var(--text-secondary, var(--noche-muted)));
}

.theme-family-claude .home-page__nav-entry:first-child .home-page__nav-entry-icon {
  background: var(--button-primary-bg, #c96442);
  border-color: var(--button-primary-border, #c96442);
  box-shadow: var(--button-primary-shadow, none);
  color: var(--button-primary-text, #fbf4e8);
}

.theme-family-claude .home-page__nav-entry:nth-child(2) .home-page__nav-entry-icon {
  background: var(--button-fab-bg, #1b1713);
  border-color: var(--button-fab-border, #1b1713);
  box-shadow: var(--button-fab-shadow, none);
  color: var(--button-fab-text, #fbf4e8);
}

.theme-family-claude .home-page__welcome-card-face-inner {
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--surface-primary, #fbf4e8) 96%, white 4%),
      color-mix(in srgb, var(--surface-primary, #fbf4e8) 86%, var(--surface-secondary, #e3d5be) 14%)
    );
  border-color: var(--border-prominent, var(--border-subtle, #d7c8b1));
  box-shadow:
    0 24px 56px color-mix(in srgb, var(--text-primary, #1b1713) 10%, transparent),
    var(--shadow-ring, none);
}

.theme-family-claude .home-page__welcome-card-face-inner::after {
  background:
    linear-gradient(180deg, color-mix(in srgb, white 52%, transparent), transparent 62%),
    radial-gradient(circle at top left, color-mix(in srgb, white 28%, transparent), transparent 34%),
    radial-gradient(circle at bottom right, color-mix(in srgb, var(--surface-secondary, #e3d5be) 28%, transparent), transparent 30%);
}

.theme-family-claude .home-page__welcome-card-glyph-chip {
  background: var(--button-chip-bg, var(--surface-secondary, var(--noche-panel)));
  border: 1px solid var(--button-chip-border, var(--border-subtle, var(--noche-border)));
  box-shadow: var(--button-chip-shadow, var(--shadow-whisper, none));
}

.theme-family-claude .home-page__welcome-card-divider {
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--border-prominent, #c9b89e) 72%, transparent), transparent);
}

.theme-family-claude .home-page__welcome-card-actions {
  background: color-mix(in srgb, var(--surface-primary, #fbf4e8) 88%, white 12%);
  border: 1px solid color-mix(in srgb, var(--border-subtle, #d7c8b1) 82%, transparent);
}

.theme-family-claude .home-page__welcome-card-pill::before {
  background: color-mix(in srgb, var(--button-pill-text, #3d3326) 18%, white);
  box-shadow:
    inset 0 1px 2px color-mix(in srgb, var(--button-pill-text, #3d3326) 14%, transparent),
    0 1px 0 color-mix(in srgb, white 56%, transparent);
}

.theme-family-claude .home-page__welcome-card-pill::after {
  border-color: color-mix(in srgb, white 26%, transparent);
}

.theme-family-claude .home-page__jotting-modal {
  background: var(--surface-primary, #fbf4e8);
  border-color: var(--border-prominent, var(--border-subtle, #d7c8b1));
  box-shadow:
    0 18px 40px color-mix(in srgb, var(--text-primary, #1b1713) 12%, transparent),
    var(--shadow-ring, none);
}

.theme-family-claude .home-page__jotting-modal-head {
  border-bottom: 1px solid var(--border-subtle, #d7c8b1);
}

.theme-family-claude .home-page__jotting-modal-title {
  color: var(--text-primary, #1b1713);
  font-family: var(--font-heading, inherit);
}

.theme-family-claude .home-page__jotting-modal-copy {
  color: var(--text-secondary, #6b6154);
  font-family: var(--font-body, inherit);
}

.type-scale-small .home-page__hero-title { font-size: 36px; }
.type-scale-large .home-page__hero-title { font-size: 41px; }
.type-scale-small .home-page__hero-subtitle { font-size: 11px; }
.type-scale-large .home-page__hero-subtitle { font-size: 13px; }
.type-scale-small .home-page__paper-heading { font-size: 28px; }
.type-scale-large .home-page__paper-heading { font-size: 32px; }
.type-scale-small .home-page__welcome-card-glyph { font-size: 24px; }
.type-scale-large .home-page__welcome-card-glyph { font-size: 30px; }
.type-scale-small .home-page__paper-subtitle,
.type-scale-small .home-page__welcome-card-eyebrow,
.type-scale-small .home-page__nav-entry-label,
.type-scale-small .home-page__footer-text { font-size: 9px; }
.type-scale-large .home-page__paper-subtitle,
.type-scale-large .home-page__welcome-card-eyebrow,
.type-scale-large .home-page__nav-entry-label,
.type-scale-large .home-page__footer-text { font-size: 11px; }
.type-scale-small .home-page__welcome-card-title { font-size: 40px; }
.type-scale-large .home-page__welcome-card-title { font-size: 56px; }
.type-scale-small .home-page__welcome-card-content { font-size: 14px; }
.type-scale-large .home-page__welcome-card-content { font-size: 16px; }
.type-scale-small .home-page__welcome-card-pill-label { font-size: 13px; }
.type-scale-large .home-page__welcome-card-pill-label { font-size: 15px; }
.type-scale-small .home-page__jotting-modal-title { font-size: 23px; }
.type-scale-large .home-page__jotting-modal-title { font-size: 26px; }
.type-scale-small .home-page__jotting-modal-copy { font-size: 12px; }
.type-scale-large .home-page__jotting-modal-copy { font-size: 14px; }
.type-scale-small .home-page__jotting-modal-action-title { font-size: 17px; }
.type-scale-large .home-page__jotting-modal-action-title { font-size: 19px; }
.type-scale-small .home-page__jotting-modal-action-copy { font-size: 11px; }
.type-scale-large .home-page__jotting-modal-action-copy { font-size: 13px; }
</style>
