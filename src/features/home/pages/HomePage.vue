<template>
  <PageScaffold
    class="home-page"
    :show-left="false"
    :reserve-right="false"
    :topbar-translucent="true"
    :max-width="homeMaxWidth"
  >
    <template #left>
      <view class="home-page__topbar-mark">
        <text class="home-page__topbar-mark-text">{{ footerMonth }}</text>
      </view>
    </template>

    <template #right>
      <view class="home-page__topnav-profile-entry" @tap="handleNavigate('profile')">
        <AppIcon name="ink-pen" class="home-page__topnav-profile-icon" />
        <text class="home-page__topnav-profile-text">{{ settingsStore.locale === "en-US" ? "Profile" : "个人中心" }}</text>
      </view>
    </template>

    <view class="home-page__main">
      <view class="home-page__hero">
        <text class="home-page__hero-kicker">{{ settingsStore.locale === "en-US" ? "Today" : "今日" }}</text>
        <text class="home-page__hero-title home-page__letter-spacing-widest">{{ copy.home.title }}</text>
      </view>

      <view class="home-page__focus">
        <view
          class="home-page__paper-premium"
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
        <view class="home-page__nav-entry" @tap="handleOpenJotting">
          <view class="home-page__nav-entry-icon">
            <AppIcon name="edit-note" class="home-page__nav-entry-icon-svg" />
          </view>
          <text class="home-page__nav-entry-label" :class="{ 'home-page__nav-entry-label--latin': settingsStore.locale === 'en-US' }">{{ copy.home.jotting }}</text>
        </view>

        <view
          class="home-page__nav-entry"
          @tap="handleNavigate('editor', { type: 'future' })"
        >
          <view class="home-page__nav-entry-icon">
            <AppIcon name="mail" class="home-page__nav-entry-icon-svg" />
          </view>
          <text class="home-page__nav-entry-label" :class="{ 'home-page__nav-entry-label--latin': settingsStore.locale === 'en-US' }">{{ copy.home.future }}</text>
        </view>

        <view class="home-page__nav-entry" @tap="handleNavigate('mailbox')">
          <view class="home-page__nav-entry-icon">
            <AppIcon name="mailbox-post" class="home-page__nav-entry-icon-svg" />
          </view>
          <text class="home-page__nav-entry-label" :class="{ 'home-page__nav-entry-label--latin': settingsStore.locale === 'en-US' }">{{ copy.home.mailbox }}</text>
        </view>
      </view>

      <view class="home-page__footer">
        <text class="home-page__footer-text">{{ footerMark }}</text>
      </view>
    </view>

    <view
      v-if="isJottingModalOpen"
      class="home-page__jotting-modal-mask"
      @tap="handleCloseJottingModal"
    >
      <view class="home-page__jotting-modal" @tap.stop>
        <view class="home-page__jotting-modal-head">
          <text class="home-page__jotting-modal-title">{{ copy.home.jottingModalTitle }}</text>
          <text class="home-page__jotting-modal-copy">{{ copy.home.jottingModalCopy }}</text>
        </view>

        <view class="home-page__jotting-modal-actions">
          <view class="home-page__jotting-modal-action" @tap="handleContinueJottingDraft">
            <text class="home-page__jotting-modal-action-title">{{ copy.home.continueLast }}</text>
            <text class="home-page__jotting-modal-action-copy">{{ copy.home.continueLastCopy }}</text>
          </view>

          <view class="home-page__jotting-modal-action" @tap="handleCreateAnotherJottingDraft">
            <text class="home-page__jotting-modal-action-title">{{ copy.home.startAnother }}</text>
            <text class="home-page__jotting-modal-action-copy">{{ copy.home.startAnotherCopy }}</text>
          </view>

          <view class="home-page__jotting-modal-action home-page__jotting-modal-action--muted" @tap="handleCloseJottingModal">
            <text class="home-page__jotting-modal-action-title">{{ copy.home.cancel }}</text>
          </view>
        </view>
      </view>
    </view>
  </PageScaffold>
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
import AppIcon from "@/shared/ui/AppIcon.vue";
import PageScaffold from "@/shared/ui/PageScaffold.vue";
import { useMobileLayout } from "@/shared/layout/useMobileLayout";
import { t } from "@/shared/i18n";

const draftStore = useDraftStore();
const settingsStore = useSettingsStore();
const { sizeClass } = useMobileLayout();
const isJottingModalOpen = ref(false);
const pendingJottingDraft = ref<Draft | null>(null);
const copy = computed(() => t(settingsStore.locale));
const todayDateKey = ref(formatDate(new Date(), "YYYY-MM-DD"));
const dailyPrompt = computed(() => resolveHomeDailyPrompt(todayDateKey.value));

const footerMark = computed(() => `${dayjs(todayDateKey.value).format(settingsStore.locale === "en-US" ? "MMM YYYY" : "YYYY年MM月")} · ${copy.value.home.footerSuffix}`);
const footerMonth = computed(() => dayjs(todayDateKey.value).format(settingsStore.locale === "en-US" ? "MMM" : "MM月"));
const homeMaxWidth = computed(() => {
  if (sizeClass.value === "L") {
    return "820px";
  }

  return sizeClass.value === "S" ? "680px" : "760px";
});
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
  background:
    radial-gradient(circle at top left, rgba(var(--noche-shadow-rgb), 0.06), transparent 28%),
    var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  position: relative;
}

.home-page__topbar-mark {
  min-width: 88rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
}

.home-page__topbar-mark-text {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  line-height: 1.35;
  color: var(--noche-ink-subtle);
  letter-spacing: 0.24em;
  padding-left: 0.24em;
  text-transform: uppercase;
}

.home-page__topnav-profile-entry {
  min-width: 224rpx;
  min-height: 88rpx;
  padding: 0 30rpx;
  border-radius: 9999rpx;
  border: 1px solid color-mix(in srgb, var(--noche-border) 82%, transparent);
  background: color-mix(in srgb, var(--noche-surface-strong) 96%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  box-shadow: 0 10rpx 24rpx rgba(var(--noche-shadow-rgb), 0.08);
}

.home-page__topnav-profile-icon {
  width: 28rpx;
  height: 28rpx;
  color: var(--noche-ink-faint);
}

.home-page__topnav-profile-text {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 21rpx;
  line-height: 1.35;
  letter-spacing: 0.08em;
  color: var(--noche-text);
  padding-left: 0.08em;
}

.home-page__main {
  flex: 1;
  min-height: var(--noche-content-min-height);
  width: 100%;
  padding: 12rpx var(--noche-page-padding-x) var(--noche-page-bottom-padding);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: clamp(24px, 3.8vh, 40px);
}

.home-page__hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14rpx;
  padding-top: 6rpx;
}

.home-page__hero-kicker {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  line-height: 1.35;
  color: var(--noche-ink-subtle);
  letter-spacing: 0.3em;
  padding-left: 0.3em;
  text-transform: uppercase;
}

.home-page__hero-title {
  font-size: clamp(34px, 9vw, 42px);
  line-height: 1.12;
  font-weight: 300;
  color: var(--noche-text);
}

.home-page__letter-spacing-widest {
  letter-spacing: 0.48em;
  padding-left: 0.48em;
}

.home-page__letter-spacing-medium {
  letter-spacing: 0.26em;
  padding-left: 0.26em;
}

.home-page__focus {
  width: 100%;
  display: flex;
  justify-content: center;
}

.home-page__paper-premium {
  position: relative;
  width: min(100%, 100%);
  max-width: 540px;
  min-height: clamp(320px, 46vh, 460px);
  padding: clamp(28px, 4.5vw, 38px);
  background-color: var(--noche-panel);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 18px 44px -10px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(0, 0, 0, 0.02);
}

.home-page__paper-premium::after {
  content: "";
  position: absolute;
  inset: 10px;
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
  min-height: 100%;
  border: 0.5px solid var(--noche-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.home-page__paper-line {
  position: absolute;
  top: 34px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 1px;
  background: var(--noche-border);
}

.home-page__paper-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  z-index: 1;
}

.home-page__paper-icon-wrap {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-page__paper-icon {
  width: 42px;
  height: 42px;
  color: var(--noche-muted);
}

.home-page__paper-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.home-page__paper-heading {
  font-size: clamp(26px, 6.6vw, 31px);
  line-height: 1.28;
  font-weight: 300;
  color: var(--noche-text);
  text-align: center;
}

.home-page__paper-subtitle {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--noche-muted);
  padding-left: 0.28em;
  text-align: center;
}

.home-page__paper-seal {
  position: absolute;
  bottom: 34px;
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.home-page__nav-entry {
  min-height: 164rpx;
  padding: 22rpx 18rpx;
  border-radius: 26rpx;
  border: 1px solid color-mix(in srgb, var(--noche-border) 84%, transparent);
  background: color-mix(in srgb, var(--noche-surface-strong) 94%, transparent);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
  box-shadow: 0 10rpx 28rpx rgba(var(--noche-shadow-rgb), 0.06);
}

.home-page__nav-entry-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--noche-chip) 92%, transparent);
  color: var(--noche-muted);
}

.home-page__nav-entry-icon-svg {
  width: 30rpx;
  height: 30rpx;
}

.home-page__nav-entry-label {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 20rpx;
  line-height: 1.45;
  letter-spacing: 0.18em;
  color: var(--noche-text);
  padding-left: 0.18em;
}

.home-page__nav-entry-label--latin {
  letter-spacing: 0.08em;
  padding-left: 0.08em;
}

.home-page__footer {
  margin-top: auto;
  padding-top: 4rpx;
  display: flex;
  justify-content: center;
}

.home-page__footer-text {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  line-height: 1.4;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: var(--noche-muted);
  padding-left: 0.42em;
}

.home-page__jotting-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px 16px calc(var(--noche-safe-bottom) + 24px);
  background: var(--noche-overlay);
  backdrop-filter: blur(8px);
}

.home-page__jotting-modal {
  width: min(100%, 420px);
  background: var(--noche-surface-elevated);
  border: 1px solid var(--noche-border);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(var(--noche-shadow-rgb), 0.14);
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
</style>
