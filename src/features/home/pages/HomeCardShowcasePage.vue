<template>
  <view class="home-card-showcase-page" :class="[themeClass, typographyClass]">
    <view class="home-card-showcase-page__topbar">
      <view class="home-card-showcase-page__topbar-inner" :style="topbarInnerStyle">
        <TopbarIconButton @tap="handleGoBack" />
        <view class="home-card-showcase-page__topbar-copy">
          <text class="home-card-showcase-page__eyebrow">{{ pageEyebrow }}</text>
          <text class="home-card-showcase-page__title">{{ pageTitle }}</text>
        </view>
        <view class="home-card-showcase-page__spacer"></view>
      </view>
    </view>

    <scroll-view scroll-y class="home-card-showcase-page__scroll">
      <view v-if="groupedCollection.length === 0" class="home-card-showcase-page__empty">
        <text class="home-card-showcase-page__empty-title">{{ emptyTitle }}</text>
        <text class="home-card-showcase-page__empty-copy">{{ emptyCopy }}</text>
      </view>

      <view v-else class="home-card-showcase-page__content">
        <view
          v-for="group in groupedCollection"
          :key="group.type"
          class="home-card-showcase-page__group"
        >
          <view class="home-card-showcase-page__group-head">
            <view
              class="home-card-showcase-page__group-chip"
              :class="`home-card-showcase-page__group-chip--${group.type}`"
            >
              <text class="home-card-showcase-page__group-icon">{{ group.theme.icon }}</text>
            </view>
            <view class="home-card-showcase-page__group-copy">
              <text class="home-card-showcase-page__group-title">{{ group.label }}</text>
              <text class="home-card-showcase-page__group-subtitle">{{ group.subtitle }}</text>
            </view>
            <text class="home-card-showcase-page__group-count">{{ group.records.length }}</text>
          </view>

          <view class="home-card-showcase-page__group-list">
            <view
              v-for="record in group.records"
              :key="record.cardId"
              class="home-card-showcase-page__paper-item"
              :class="`home-card-showcase-page__paper-item--${record.type}`"
              @tap="openDetail(record.cardId)"
              @click="openDetail(record.cardId)"
              @longpress="promptRemove(record)"
            >
              <view class="home-card-showcase-page__paper-item-head">
                <text class="home-card-showcase-page__paper-item-eyebrow">{{ group.label }}</text>
                <text class="home-card-showcase-page__paper-item-date">{{ formatCollectedDate(record.collectedDateKey) }}</text>
              </view>
              <text class="home-card-showcase-page__paper-item-content">{{ resolveCardContent(record.cardId) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view
      v-if="activeDetailCard"
      class="home-card-showcase-page__detail-mask"
      @tap="closeDetail"
      @click="closeDetail"
    >
      <view
        class="home-card-showcase-page__detail-card"
        :class="`home-card-showcase-page__detail-card--${activeDetailCard.type}`"
        @tap.stop
        @click.stop
      >
        <view class="home-card-showcase-page__detail-head">
          <view class="home-card-showcase-page__detail-chip">
            <text class="home-card-showcase-page__detail-icon">{{ activeDetailTheme.icon }}</text>
          </view>
          <view class="home-card-showcase-page__detail-copy">
            <text class="home-card-showcase-page__detail-eyebrow">{{ activeDetailEyebrow }}</text>
            <text class="home-card-showcase-page__detail-date">{{ activeCollectedDate }}</text>
          </view>
          <view class="home-card-showcase-page__detail-close" @tap="closeDetail" @click="closeDetail">
            <AppIcon name="close" class="home-card-showcase-page__detail-close-icon" />
          </view>
        </view>

        <text class="home-card-showcase-page__detail-content">{{ activeDetailCard.content }}</text>
      </view>
    </view>

    <PaperConfirmDialog
      :open="isDeleteDialogOpen"
      :title="deleteDialogTitle"
      :copy="deleteDialogCopy"
      :actions="deleteDialogActions"
      @close="closeDeleteDialog"
      @action="handleDeleteDialogAction"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import { useThemeClass, useTypographyClass } from "@/shared/theme";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import AppIcon from "@/shared/ui/AppIcon.vue";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import {
  readHomeWelcomeCardCollection,
  removeHomeWelcomeCardCollected,
  resolveCollectedHomeWelcomeCard,
  resolveHomeWelcomeCardEyebrow,
  resolveHomeWelcomeCardTheme,
  type HomeWelcomeCardCollectionRecord,
  type HomeWelcomeCardType,
} from "@/features/home/homeWelcomeCard";

const HOME_CARD_SHOWCASE_TYPES: HomeWelcomeCardType[] = [
  "today_quote",
  "mood_response",
  "weather_season",
  "playful_draw",
  "action_prompt",
];

const settingsStore = useSettingsStore();
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const { statusBarHeight, topbarBottomSpacing, rpxToPx } = useEditorKeyboardViewport();
const collectionVersion = ref(0);
const activeDetailCardId = ref<string | null>(null);
const pendingDeleteRecord = ref<HomeWelcomeCardCollectionRecord | null>(null);
const isDeleteDialogOpen = ref(false);

const collection = computed(() => {
  collectionVersion.value;
  return readHomeWelcomeCardCollection();
});

const pageEyebrow = computed(() => settingsStore.locale === "en-US" ? "CARD SHOWCASE" : "卡片展柜");
const pageTitle = computed(() => settingsStore.locale === "en-US" ? "Collected Notes" : "收下的卡片");
const emptyTitle = computed(() => settingsStore.locale === "en-US" ? "No cards kept yet" : "还没有收下卡片");
const emptyCopy = computed(() => settingsStore.locale === "en-US"
  ? "The cards you keep will rest here quietly."
  : "那些被你收下的卡片，会安静地留在这里。");
const deleteDialogTitle = computed(() => settingsStore.locale === "en-US" ? "Remove this card from the showcase?" : "从展柜里删除这张卡？");
const deleteDialogCopy = computed(() => settingsStore.locale === "en-US"
  ? "This only removes the collection record from the showcase. The card may still appear again on the home page later."
  : "这次只会删除展柜里的收藏记录，不会拉黑这张卡；它以后仍可能再次出现在首页。");
const deleteDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "keep",
    title: settingsStore.locale === "en-US" ? "Keep it" : "先保留",
    tone: "muted",
  },
  {
    key: "delete",
    title: settingsStore.locale === "en-US" ? "Delete" : "确认删除",
    tone: "danger",
  },
]));
const topbarInnerStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
  paddingLeft: `${rpxToPx(32)}px`,
  paddingRight: `${rpxToPx(32)}px`,
  paddingBottom: `${topbarBottomSpacing.value}px`,
}));

const groupedCollection = computed(() => HOME_CARD_SHOWCASE_TYPES
  .map((type) => {
    const records = collection.value.filter((record) => record.type === type);

    if (records.length === 0) {
      return null;
    }

    return {
      type,
      records,
      label: resolveHomeWelcomeCardEyebrow(type, settingsStore.locale),
      subtitle: settingsStore.locale === "en-US" ? "Collected in your private stack" : "收藏于你的私人卡堆",
      theme: resolveHomeWelcomeCardTheme(type),
    };
  })
  .filter((group): group is NonNullable<typeof group> => group !== null));

const activeDetailRecord = computed(() => activeDetailCardId.value
  ? collection.value.find((item) => item.cardId === activeDetailCardId.value) ?? null
  : null);
const activeDetailCard = computed(() => activeDetailRecord.value
  ? resolveCollectedHomeWelcomeCard(activeDetailRecord.value)
  : null);
const activeDetailTheme = computed(() => resolveHomeWelcomeCardTheme(activeDetailCard.value?.type ?? "today_quote"));
const activeDetailEyebrow = computed(() => activeDetailCard.value
  ? resolveHomeWelcomeCardEyebrow(activeDetailCard.value.type, settingsStore.locale)
  : "");
const activeCollectedDate = computed(() => {
  if (!activeDetailCardId.value) {
    return "";
  }

  const record = collection.value.find((item) => item.cardId === activeDetailCardId.value);
  return record ? formatCollectedDate(record.collectedDateKey) : "";
});

function formatCollectedDate(dateKey: string): string {
  return settingsStore.locale === "en-US"
    ? dayjs(dateKey).format("MMM DD, YYYY")
    : dayjs(dateKey).format("YYYY年MM月DD日");
}

function resolveCardContent(cardId: string): string {
  const record = collection.value.find((item) => item.cardId === cardId);
  return record ? resolveCollectedHomeWelcomeCard(record)?.content ?? "" : "";
}

function refreshCollection(): void {
  collectionVersion.value += 1;
}

function openDetail(cardId: string): void {
  activeDetailCardId.value = cardId;
}

function closeDetail(): void {
  activeDetailCardId.value = null;
}

function promptRemove(record: HomeWelcomeCardCollectionRecord): void {
  pendingDeleteRecord.value = record;
  isDeleteDialogOpen.value = true;
}

function closeDeleteDialog(): void {
  isDeleteDialogOpen.value = false;
  pendingDeleteRecord.value = null;
}

function handleDeleteDialogAction(actionKey: string): void {
  const record = pendingDeleteRecord.value;
  closeDeleteDialog();

  if (actionKey !== "delete" || !record) {
    return;
  }

  removeHomeWelcomeCardCollected(record.cardId);
  if (activeDetailCardId.value === record.cardId) {
    closeDetail();
  }
  refreshCollection();
  uni.showToast({
    title: settingsStore.locale === "en-US" ? "Removed from showcase" : "已从展柜移除",
    icon: "none",
  });
}

function handleGoBack(): void {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.home}`,
  });
}
</script>

<style scoped>
.home-card-showcase-page {
  min-height: 100vh;
  --home-showcase-accent: var(--accent-brand);
  --home-showcase-heading-font: var(--font-heading);
  background:
    radial-gradient(circle at top left, var(--page-atmosphere-primary, transparent), transparent 28%),
    radial-gradient(circle at top right, var(--page-atmosphere-secondary, transparent), transparent 24%),
    var(--app-bg, var(--noche-bg));
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif);
}

.home-card-showcase-page__topbar {
  position: sticky;
  top: 0;
  width: 100%;
  background: var(--app-bg, var(--noche-bg));
  z-index: 8;
}

.home-card-showcase-page__topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.home-card-showcase-page__topbar-copy,
.home-card-showcase-page__group-copy,
.home-card-showcase-page__detail-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.home-card-showcase-page__spacer {
  width: 88rpx;
  height: 88rpx;
}

.home-card-showcase-page__eyebrow,
.home-card-showcase-page__group-subtitle,
.home-card-showcase-page__paper-item-eyebrow,
.home-card-showcase-page__detail-eyebrow {
  font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif);
  font-size: 20rpx;
  line-height: 1.5;
  letter-spacing: 0.18em;
  color: var(--text-secondary, var(--noche-muted));
}

.home-card-showcase-page__title,
.home-card-showcase-page__group-title,
.home-card-showcase-page__empty-title {
  font-family: var(--home-showcase-heading-font, "Source Han Serif SC", "Noto Serif SC", "Songti SC", serif);
  font-size: 36rpx;
  line-height: 1.35;
}

.home-card-showcase-page__group-count {
  font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif);
  font-size: 22rpx;
  color: var(--text-secondary, var(--noche-muted));
}

.home-card-showcase-page__scroll {
  height: calc(100vh - 132rpx);
}

.home-card-showcase-page__content {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 10rpx 32rpx 48rpx;
}

.home-card-showcase-page__group {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.home-card-showcase-page__group-head {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.home-card-showcase-page__group-chip,
.home-card-showcase-page__detail-chip {
  width: 72rpx;
  height: 72rpx;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-primary, var(--noche-surface));
  border: 1px solid var(--border-subtle, var(--noche-border));
  box-shadow: var(--shadow-ring, 0 0 0 1px rgba(221, 212, 200, 0.72));
}

.home-card-showcase-page__group-chip--today_quote,
.home-card-showcase-page__paper-item--today_quote,
.home-card-showcase-page__detail-card--today_quote {
  background-color: color-mix(in srgb, var(--home-showcase-accent, #c96442) 8%, var(--surface-primary, #faf9f5));
}

.home-card-showcase-page__group-chip--mood_response,
.home-card-showcase-page__paper-item--mood_response,
.home-card-showcase-page__detail-card--mood_response {
  background-color: color-mix(in srgb, var(--home-showcase-accent, #c96442) 11%, var(--surface-primary, #faf9f5));
}

.home-card-showcase-page__group-chip--weather_season,
.home-card-showcase-page__paper-item--weather_season,
.home-card-showcase-page__detail-card--weather_season {
  background-color: color-mix(in srgb, var(--surface-secondary, #e8e6dc) 66%, var(--surface-primary, #faf9f5));
}

.home-card-showcase-page__group-chip--playful_draw,
.home-card-showcase-page__paper-item--playful_draw,
.home-card-showcase-page__detail-card--playful_draw {
  background-color: color-mix(in srgb, var(--home-showcase-accent, #c96442) 9%, var(--surface-primary, #faf9f5));
}

.home-card-showcase-page__group-chip--action_prompt,
.home-card-showcase-page__paper-item--action_prompt,
.home-card-showcase-page__detail-card--action_prompt {
  background-color: color-mix(in srgb, var(--home-showcase-accent, #c96442) 13%, var(--surface-primary, #faf9f5));
}

.home-card-showcase-page__group-icon,
.home-card-showcase-page__detail-icon {
  font-size: 32rpx;
  line-height: 1;
}

.home-card-showcase-page__group-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.home-card-showcase-page__paper-item {
  padding: 24rpx 26rpx;
  border-radius: 28rpx;
  border: 1px solid var(--border-subtle, var(--noche-border));
  box-shadow: var(--shadow-ring, 0 0 0 1px rgba(221, 212, 200, 0.72));
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.home-card-showcase-page__paper-item-head,
.home-card-showcase-page__detail-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.home-card-showcase-page__paper-item-date,
.home-card-showcase-page__detail-date {
  font-family: var(--font-body, "Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif);
  font-size: 22rpx;
  color: var(--text-secondary, var(--noche-muted));
}

.home-card-showcase-page__paper-item-content,
.home-card-showcase-page__detail-content {
  font-size: 30rpx;
  line-height: 1.95;
  color: var(--text-primary, var(--noche-text));
}

.home-card-showcase-page__empty {
  min-height: calc(100vh - 132rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  padding: 32rpx;
  text-align: center;
}

.home-card-showcase-page__empty-copy {
  max-width: 480rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--text-secondary, var(--noche-muted));
}

.home-card-showcase-page__detail-mask {
  position: fixed;
  inset: 0;
  z-index: 24;
  background: color-mix(in srgb, var(--accent-brand, #c96442) 10%, rgba(236, 230, 222, 0.76));
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.home-card-showcase-page__detail-card {
  width: 100%;
  max-width: 620rpx;
  border-radius: 32rpx;
  border: 1px solid var(--border-subtle, var(--noche-border));
  box-shadow: var(--shadow-ring, 0 0 0 1px rgba(221, 212, 200, 0.72));
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.home-card-showcase-page__detail-close {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--surface-primary, #faf9f5) 92%, transparent);
  border: 1px solid var(--border-subtle, var(--noche-border));
}

.home-card-showcase-page__detail-close-icon {
  width: 32rpx;
  height: 32rpx;
  color: var(--text-secondary, var(--noche-muted));
}
</style>
