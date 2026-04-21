<template>
  <scroll-view class="dark-mailbox" scroll-y>
    <view class="dark-mailbox__inner">
      <text class="dark-mailbox__eyebrow">Mailbox</text>
      <view class="dark-mailbox__head">
        <text class="dark-mailbox__title">邮 箱</text>
        <TopbarIconButton icon-name="calendar" @tap="openCalendar" />
      </view>

      <view
        v-for="entry in mergedEntries"
        :key="entry.id"
        class="dark-mailbox__item"
        @tap="openEntry(entry)"
        @longpress.stop="handleRequestDeleteEntry(entry)"
      >
        <view class="dark-mailbox__item-head">
          <view class="dark-mailbox__item-mark" :class="{ 'dark-mailbox__item-mark--active': entry.type === 'future' }"></view>
          <text class="dark-mailbox__from">{{ resolveMailboxSource(entry) }}</text>
          <view class="dark-mailbox__meta">
            <text class="dark-mailbox__date">{{ formatDateLabel(entry) }}</text>
            <view
              v-if="hasDiaryPreludeGlyphs(entry)"
              class="dark-mailbox__prelude"
            >
              <DiaryPreludeGlyph
                v-if="entry.diaryPrelude?.weatherCode"
                class="dark-mailbox__prelude-glyph"
                kind="weather"
                :code="entry.diaryPrelude.weatherCode"
              />
              <DiaryPreludeGlyph
                v-if="entry.diaryPrelude?.moodCode"
                class="dark-mailbox__prelude-glyph"
                kind="mood"
                :code="entry.diaryPrelude.moodCode"
              />
            </view>
          </view>
        </view>
        <text class="dark-mailbox__subject">{{ entry.title || fallbackEntryTitle(entry.type, settingsStore.locale) }}</text>
        <text class="dark-mailbox__preview">{{ formatPreview(entry.content) }}</text>
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
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useMailboxStore } from "@/app/store/useMailboxStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { Entry } from "@/domain/entry/types";
import { fallbackEntryTitle } from "@/features/entries/entryDisplay";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import { buildDarkMailboxList } from "@/features/dark-shell/darkMailboxView";
import { ROUTES } from "@/shared/constants/routes";
import { t } from "@/shared/i18n";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import { formatDate } from "@/shared/utils/date";

const mailboxStore = useMailboxStore();
const entryStore = useEntryStore();
const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));
const pendingDeleteEntry = ref<Entry | null>(null);
const isDeleteDialogOpen = ref(false);

const mergedEntries = computed(() => buildDarkMailboxList({
  documentaryDiaries: mailboxStore.documentaryDiaries,
  documentaryJottings: mailboxStore.documentaryJottings,
  distantOpenedFutures: mailboxStore.distantOpenedFutures,
  distantPendingFutures: mailboxStore.distantPendingFutures,
}));
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
  ? "This page will be removed from the mailbox shelf and cannot be restored."
  : "删除后这页会从邮箱目录里移除，且无法恢复。");
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

function formatPreview(content: string): string {
  return content.length > 72 ? `${content.slice(0, 72)}…` : content;
}

function resolveMailboxSource(entry: Entry): string {
  if (entry.type === "future") {
    return `来自 ${entry.unlockDate ?? entry.recordDate} 的你`;
  }

  return entry.type === "diary" ? "来自今天的日记" : "来自刚刚的随笔";
}

function formatDateLabel(entry: Entry): string {
  const base = entry.unlockDate ?? entry.recordDate;
  return formatDate(base, "MM.DD");
}

function hasDiaryPreludeGlyphs(entry: Entry): boolean {
  return entry.type === "diary" && Boolean(entry.diaryPrelude?.weatherCode || entry.diaryPrelude?.moodCode);
}

function openCalendar() {
  uni.navigateTo({
    url: `/${ROUTES.calendar}`,
  });
}

function openEntry(entry: Entry) {
  if (entry.type === "future" && entry.status === "sealed") {
    uni.showToast({
      title: entry.unlockDate ? `将于 ${entry.unlockDate} 启封` : "尚未开启",
      icon: "none",
    });
    return;
  }

  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entry.id}`,
  });
}

function handleRequestDeleteEntry(entry: Entry): void {
  if (entry.type === "future") {
    return;
  }

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
  await mailboxStore.refreshMailbox();

  uni.showToast({
    title: copy.value.mailbox.destroyedToast,
    icon: "none",
  });
}

onMounted(() => {
  void mailboxStore.refreshMailbox();
});

onShow(() => {
  void mailboxStore.refreshMailbox();
});
</script>

<style scoped>
.dark-mailbox {
  flex: 1;
  min-height: 0;
}

.dark-mailbox__inner {
  max-width: 390px;
  margin: 0 auto;
  padding: 52px 28px 104px;
}

.dark-mailbox__eyebrow {
  display: block;
  font-size: 12px;
  line-height: 1.6;
  color: #564e42;
}

.dark-mailbox__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
}

.dark-mailbox__title {
  font-size: 42px;
  line-height: 1.08;
  letter-spacing: 0.24em;
}

.dark-mailbox__item {
  padding: 24px 0;
  border-top: 1px solid #1e1a14;
}

.dark-mailbox__item-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mailbox__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mailbox__item-mark {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #1e1a14;
}

.dark-mailbox__item-mark--active {
  background: #a83228;
}

.dark-mailbox__from {
  flex: 1;
  font-size: 12px;
  line-height: 1.6;
  color: #b8883a;
}

.dark-mailbox__date {
  font-size: 12px;
  color: #564e42;
}

.dark-mailbox__prelude {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(184, 136, 58, 0.82);
}

.dark-mailbox__prelude-glyph {
  width: 14px;
  height: 14px;
}

.dark-mailbox__subject {
  display: block;
  margin-top: 12px;
  font-size: 20px;
  line-height: 1.5;
}

.dark-mailbox__preview {
  display: block;
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.9;
  color: #564e42;
}
</style>
