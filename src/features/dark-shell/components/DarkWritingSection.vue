<template>
  <scroll-view class="dark-writing" scroll-y>
    <view class="dark-writing__inner">
      <view class="dark-writing__topbar">
        <text class="dark-writing__topbar-label">{{ topbarLabel }}</text>
        <view class="dark-writing__topbar-dots">
          <span></span>
          <span></span>
          <span></span>
        </view>
      </view>

      <view class="dark-writing__hero">
        <text class="dark-writing__hero-eyebrow">{{ heroEyebrow }}</text>
        <view class="dark-writing__hero-head">
          <text class="dark-writing__hero-title">{{ activeMode === 'jotting' ? copy.mailbox.jotting : copy.mailbox.diary }}</text>
          <view class="dark-writing__hero-badge">
            <text class="dark-writing__hero-badge-value">{{ entryCountLabel }}</text>
            <text class="dark-writing__hero-badge-label">{{ badgeLabel }}</text>
          </view>
        </view>
        <text class="dark-writing__hero-copy">{{ heroCopy }}</text>
        <view class="dark-writing__hero-divider"></view>
        <view class="dark-writing__hero-actions">
          <button
            class="dark-writing__hero-action"
            :class="{ 'dark-writing__hero-action--active': activeMode === 'jotting' }"
            @tap="activeMode = 'jotting'"
          >
            <text class="dark-writing__hero-action-text">{{ copy.mailbox.jotting }}</text>
          </button>
          <button
            class="dark-writing__hero-action"
            :class="{ 'dark-writing__hero-action--active': activeMode === 'diary' }"
            @tap="activeMode = 'diary'"
          >
            <text class="dark-writing__hero-action-text">{{ copy.mailbox.diary }}</text>
          </button>
        </view>
      </view>

      <view
        v-if="featuredEntry"
        class="dark-writing__latest"
        @tap="handleOpenEntry(featuredEntry.id)"
        @longpress.stop="handleRequestDeleteEntry(featuredEntry)"
      >
        <view class="dark-writing__latest-gold-bar"></view>
        <text class="dark-writing__latest-date">{{ formatDate(featuredEntry.recordDate, 'YYYY.MM.DD') }}</text>
        <text class="dark-writing__latest-title">{{ featuredEntry.title || fallbackEntryTitle(featuredEntry.type, settingsStore.locale) }}</text>
        <text class="dark-writing__latest-body">{{ formatPreview(featuredEntry.content, 98) }}</text>
      </view>

      <view v-if="visibleEntries.length > 1" class="dark-writing__list-head">
        <text class="dark-writing__list-label">{{ listLabel }}</text>
        <view class="dark-writing__list-line"></view>
      </view>

      <view
        v-for="entry in remainingEntries"
        :key="entry.id"
        class="dark-writing__entry"
        @tap="handleOpenEntry(entry.id)"
        @longpress.stop="handleRequestDeleteEntry(entry)"
      >
        <view class="dark-writing__entry-date">
          <text class="dark-writing__entry-date-day">{{ formatDate(entry.recordDate, 'DD') }}</text>
          <text class="dark-writing__entry-date-month">{{ formatDate(entry.recordDate, 'MM') }}</text>
        </view>
        <view class="dark-writing__entry-body">
          <text class="dark-writing__entry-title">{{ entry.title || fallbackEntryTitle(entry.type, settingsStore.locale) }}</text>
          <text class="dark-writing__entry-preview">{{ formatPreview(entry.content, 56) }}</text>
        </view>
        <view class="dark-writing__entry-arrow"></view>
      </view>

      <view v-if="!visibleEntries.length" class="dark-writing__empty">
        <text class="dark-writing__empty-title">{{ emptyTitle }}</text>
        <text class="dark-writing__empty-copy">{{ emptyCopy }}</text>
      </view>
    </view>

    <button class="dark-writing__fab" @tap="handleCompose">
      <ChisuSymbol symbol="✦" tone="active" />
    </button>

    <PaperConfirmDialog
      :open="isDeleteDialogOpen"
      :title="deleteDialogTitle"
      :copy="deleteDialogCopy"
      :actions="deleteDialogActions"
      @close="closeDeleteDialog"
      @action="handleDeleteDialogAction"
    />
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getEntryRepository } from "@/app/store/entryRepository";
import { useEntryStore } from "@/app/store/useEntryStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { Entry } from "@/domain/entry/types";
import { fallbackEntryTitle } from "@/features/entries/entryDisplay";
import ChisuSymbol from "@/features/dark-shell/components/ChisuSymbol.vue";
import { ROUTES } from "@/shared/constants/routes";
import { t } from "@/shared/i18n";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import { formatDate } from "@/shared/utils/date";

const settingsStore = useSettingsStore();
const entryStore = useEntryStore();
const copy = computed(() => t(settingsStore.locale));
const activeMode = ref<"jotting" | "diary">("jotting");
const jottingEntries = ref<Entry[]>([]);
const diaryEntries = ref<Entry[]>([]);
const pendingDeleteEntry = ref<Entry | null>(null);
const isDeleteDialogOpen = ref(false);

const visibleEntries = computed(() => activeMode.value === "jotting" ? jottingEntries.value : diaryEntries.value);
const featuredEntry = computed(() => visibleEntries.value[0] ?? null);
const remainingEntries = computed(() => visibleEntries.value.slice(1));
const topbarLabel = computed(() => activeMode.value === "jotting"
  ? (settingsStore.locale === "en-US" ? "PRIVATE JOTTINGS" : "私人随笔")
  : (settingsStore.locale === "en-US" ? "PRIVATE DIARIES" : "私人日记"));
const heroEyebrow = computed(() => settingsStore.locale === "en-US" ? "Archive" : "Archive · 档案馆");
const heroCopy = computed(() => activeMode.value === "jotting"
  ? (settingsStore.locale === "en-US" ? "Fragments, margins, and thoughts you kept for yourself." : "把刚刚落下来的念头，收进一张更像档案纸的页边。")
  : (settingsStore.locale === "en-US" ? "Days that became complete enough to stay." : "把一天慢慢写成可回看的形状。"));
const entryCountLabel = computed(() => String(visibleEntries.value.length).padStart(2, "0"));
const badgeLabel = computed(() => settingsStore.locale === "en-US" ? "pages" : "页记录");
const listLabel = computed(() => settingsStore.locale === "en-US" ? "INDEX" : "目录");
const emptyTitle = computed(() => activeMode.value === "jotting"
  ? (settingsStore.locale === "en-US" ? "No jotting kept yet" : "还没有收好的随笔")
  : (settingsStore.locale === "en-US" ? "No diary page yet" : "还没有写完的日记"));
const emptyCopy = computed(() => activeMode.value === "jotting"
  ? (settingsStore.locale === "en-US" ? "The next fleeting thought can begin here." : "下一句刚刚好的念头，会从这里开始。")
  : (settingsStore.locale === "en-US" ? "The next full day can start from this page." : "下一天完整的心事，会从这里开始。"));
const deleteDialogTitle = computed(() => {
  if (!pendingDeleteEntry.value) {
    return copy.value.mailbox.deleteTitle;
  }

  if (settingsStore.locale === "en-US") {
    return pendingDeleteEntry.value.type === "diary" ? "Delete this diary page?" : "Delete this jotting?";
  }

  return pendingDeleteEntry.value.type === "diary" ? "删除这页日记？" : "删除这页随笔？";
});
const deleteDialogCopy = computed(() => settingsStore.locale === "en-US"
  ? "This page will be removed from the archive shelf and cannot be restored."
  : "删除后这页会从当前书写目录里移除，且无法恢复。");
const deleteDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "keep",
    title: copy.value.mailbox.deleteKeep,
    tone: "muted",
  },
  {
    key: "delete",
    title: copy.value.mailbox.deleteConfirm,
    tone: "danger",
  },
]));

function formatPreview(content: string, maxLength: number): string {
  return content.length > maxLength ? `${content.slice(0, maxLength)}…` : content;
}

function handleOpenEntry(entryId: string) {
  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entryId}`,
  });
}

function handleCompose() {
  uni.navigateTo({
    url: `/${ROUTES.editor}?type=${activeMode.value}`,
  });
}

function handleRequestDeleteEntry(entry: Entry): void {
  pendingDeleteEntry.value = entry;
  isDeleteDialogOpen.value = true;
}

function closeDeleteDialog(): void {
  isDeleteDialogOpen.value = false;
  pendingDeleteEntry.value = null;
}

async function handleDeleteDialogAction(actionKey: string): Promise<void> {
  const entry = pendingDeleteEntry.value;
  closeDeleteDialog();

  if (actionKey !== "delete" || !entry) {
    return;
  }

  await entryStore.destroyEntry(entry.id);
  await loadEntries();

  uni.showToast({
    title: copy.value.mailbox.destroyedToast,
    icon: "none",
  });
}

async function loadEntries(): Promise<void> {
  const [jottings, diaries] = await Promise.all([
    getEntryRepository().getByType("jotting"),
    getEntryRepository().getByType("diary"),
  ]);
  jottingEntries.value = jottings;
  diaryEntries.value = diaries;

  if (activeMode.value === "jotting" && !jottings.length && diaries.length) {
    activeMode.value = "diary";
  } else if (activeMode.value === "diary" && !diaries.length && jottings.length) {
    activeMode.value = "jotting";
  }
}

onMounted(() => {
  void loadEntries();
});

onShow(() => {
  void loadEntries();
});
</script>

<style scoped>
.dark-writing {
  flex: 1;
  min-height: 0;
}

.dark-writing__inner {
  max-width: 390px;
  margin: 0 auto;
  padding: 52px 28px 120px;
}

.dark-writing__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
}

.dark-writing__topbar-label {
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.22em;
  color: #6b5e48;
}

.dark-writing__topbar-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dark-writing__topbar-dots span {
  width: 4px;
  height: 4px;
  background: #6b5e48;
  opacity: 0.4;
}

.dark-writing__topbar-dots span:last-child {
  opacity: 0.8;
  background: #8a6828;
}

.dark-writing__hero {
  border: 1px solid #2a2520;
  background: #1c1915;
  padding: 28px 24px 24px;
  margin-bottom: 2px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(201, 150, 60, 0.04);
}

.dark-writing__hero::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-left: 1px solid #2a2520;
  border-bottom: 1px solid #2a2520;
}

.dark-writing__hero-eyebrow {
  display: block;
  margin-bottom: 10px;
  font-size: 8px;
  line-height: 1.5;
  letter-spacing: 0.25em;
  color: #8a6828;
  text-transform: uppercase;
}

.dark-writing__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.dark-writing__hero-title {
  display: block;
  font-size: 38px;
  line-height: 1.04;
  color: #f0e8d5;
  letter-spacing: 0.08em;
}

.dark-writing__hero-copy {
  display: block;
  font-size: 12px;
  line-height: 1.8;
  color: #6b5e48;
  letter-spacing: 0.04em;
}

.dark-writing__hero-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 64px;
}

.dark-writing__hero-badge-value {
  font-size: 48px;
  line-height: 1;
  color: #c9963c;
}

.dark-writing__hero-badge-label {
  font-size: 9px;
  line-height: 1.4;
  letter-spacing: 0.18em;
  color: #6b5e48;
  text-transform: uppercase;
}

.dark-writing__hero-divider {
  width: 40px;
  height: 1px;
  margin-top: 24px;
  margin-bottom: 20px;
  background: #c9963c;
  opacity: 0.5;
}

.dark-writing__hero-actions {
  display: flex;
  align-items: flex-end;
  gap: 24px;
}

.dark-writing__hero-action {
  min-height: 34px;
  border: none;
  background: transparent;
  padding: 0 2px 10px;
  position: relative;
  flex: 0 0 auto;
}

.dark-writing__hero-action::after {
  content: "";
  position: absolute;
  left: -4px;
  right: -4px;
  bottom: 0;
  height: 2px;
  background: rgba(42, 37, 32, 0.92);
  transform: scaleX(0.55);
  transform-origin: left center;
  opacity: 0.85;
}

.dark-writing__hero-action-text {
  font-size: 13px;
  line-height: 1.4;
  letter-spacing: 0.14em;
  color: #8a6828;
}

.dark-writing__hero-action--active::after {
  background: #c63a2d;
  transform: scaleX(1);
  opacity: 1;
  box-shadow:
    0 0 10px rgba(198, 58, 45, 0.34),
    0 0 18px rgba(198, 58, 45, 0.18);
}

.dark-writing__hero-action--active .dark-writing__hero-action-text {
  color: #f0e8d5;
}

.dark-writing__latest {
  position: relative;
  padding: 16px 22px 14px 20px;
  background: #ece0c2;
  color: #241d14;
  overflow: hidden;
  margin-top: 14px;
  border-top: 1px solid rgba(201, 150, 60, 0.68);
  border-right: 1px solid rgba(201, 150, 60, 0.68);
  border-bottom: 1px solid rgba(201, 150, 60, 0.68);
  border-left: none;
  border-left: 2px solid #a83228;
  margin-bottom: 24px;
  box-shadow:
    -8px 0 18px -14px rgba(168, 50, 40, 0.55),
    0 0 0 1px rgba(215, 199, 166, 0.18);
}

.dark-writing__latest::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    transparent,
    transparent 28px,
    rgba(54, 42, 24, 0.055) 28px,
    rgba(54, 42, 24, 0.055) 29px
  );
  opacity: 0.44;
  pointer-events: none;
}

.dark-writing__latest-gold-bar {
  position: relative;
  z-index: 2;
  width: 34px;
  height: 1.5px;
  margin-bottom: 10px;
  background: #c9963c;
  opacity: 0.5;
}

.dark-writing__latest-date,
.dark-writing__list-label {
  position: relative;
  z-index: 2;
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.18em;
  color: #55452e;
}

.dark-writing__latest-title {
  position: relative;
  z-index: 2;
  display: block;
  margin-top: 8px;
  font-size: 24px;
  line-height: 1.08;
}

.dark-writing__latest-body {
  position: relative;
  z-index: 2;
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.52;
  color: #4a3d2a;
}

.dark-writing__list-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 0;
  margin-bottom: 0;
}

.dark-writing__list-line {
  flex: 1;
  height: 1px;
  background: #2a2520;
}

.dark-writing__entry {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  width: calc(100% - 24px);
  margin-left: 12px;
  margin-right: 12px;
  padding: 17px 14px 16px;
  border: 1px solid rgba(201, 150, 60, 0.58);
  background: linear-gradient(180deg, rgba(28, 25, 21, 0.96), rgba(20, 18, 16, 0.96));
  box-shadow:
    inset 0 0 0 1px rgba(201, 150, 60, 0.08),
    0 8px 18px rgba(0, 0, 0, 0.12);
}

.dark-writing__entry + .dark-writing__entry {
  margin-top: 12px;
}

.dark-writing__entry-date {
  min-width: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #8a6828;
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.1em;
  padding-top: 3px;
}

.dark-writing__entry-date-day {
  font-size: 12px;
  color: #c9963c;
}

.dark-writing__entry-date-month {
  color: #8a6828;
}

.dark-writing__entry-body {
  flex: 1;
}

.dark-writing__entry-title {
  display: block;
  font-size: 18px;
  line-height: 1.4;
  color: #f0e8d5;
  letter-spacing: 0.04em;
}

.dark-writing__entry-preview {
  display: block;
  margin-top: 4px;
  font-size: 9px;
  line-height: 1.55;
  color: #6b5e48;
  letter-spacing: 0.06em;
}

.dark-writing__entry-arrow {
  width: 18px;
  height: 1px;
  margin-top: 12px;
  background: #8a6828;
  position: relative;
  flex-shrink: 0;
  opacity: 0.45;
}

.dark-writing__entry-arrow::after {
  content: "";
  position: absolute;
  right: 0;
  top: -3px;
  width: 5px;
  height: 5px;
  border-right: 1px solid #8a6828;
  border-top: 1px solid #8a6828;
  transform: rotate(45deg);
}

.dark-writing__empty {
  margin-top: 18px;
  border: 1px solid #2a2520;
  background: #141210;
  padding: 22px 20px;
}

.dark-writing__empty-title {
  display: block;
  font-size: 20px;
  line-height: 1.5;
  color: #eae2ce;
}

.dark-writing__empty-copy {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
  color: #6b5e48;
}

.dark-writing__fab {
  position: fixed;
  right: 28px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 82px);
  width: 56px;
  height: 56px;
  border: none;
  background: #a83228;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
