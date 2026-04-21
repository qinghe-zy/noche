<template>
  <scroll-view class="dark-mailbox" scroll-y>
    <view class="dark-mailbox__inner">
      <text class="dark-mailbox__eyebrow">Mailbox</text>
      <view class="dark-mailbox__head">
        <text class="dark-mailbox__title">邮 箱</text>
        <button class="dark-mailbox__calendar" @tap="openCalendar">
          <ChisuSymbol symbol="▦" tone="muted" />
        </button>
      </view>

      <view
        v-for="entry in mergedEntries"
        :key="entry.id"
        class="dark-mailbox__item"
        @tap="openEntry(entry)"
      >
        <view class="dark-mailbox__item-head">
          <view class="dark-mailbox__item-mark" :class="{ 'dark-mailbox__item-mark--active': entry.type === 'future' }"></view>
          <text class="dark-mailbox__from">{{ resolveMailboxSource(entry) }}</text>
          <text class="dark-mailbox__date">{{ formatDateLabel(entry) }}</text>
        </view>
        <text class="dark-mailbox__subject">{{ entry.title || fallbackEntryTitle(entry.type, settingsStore.locale) }}</text>
        <text class="dark-mailbox__preview">{{ formatPreview(entry.content) }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useMailboxStore } from "@/app/store/useMailboxStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { Entry } from "@/domain/entry/types";
import { fallbackEntryTitle } from "@/features/entries/entryDisplay";
import ChisuSymbol from "@/features/dark-shell/components/ChisuSymbol.vue";
import { buildDarkMailboxList } from "@/features/dark-shell/darkMailboxView";
import { ROUTES } from "@/shared/constants/routes";
import { formatDate } from "@/shared/utils/date";

const mailboxStore = useMailboxStore();
const settingsStore = useSettingsStore();

const mergedEntries = computed(() => buildDarkMailboxList({
  documentaryDiaries: mailboxStore.documentaryDiaries,
  documentaryJottings: mailboxStore.documentaryJottings,
  distantOpenedFutures: mailboxStore.distantOpenedFutures,
  distantPendingFutures: mailboxStore.distantPendingFutures,
}));

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

onMounted(() => {
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

.dark-mailbox__calendar {
  width: 44px;
  height: 44px;
  border: 1px solid #1e1a14;
  background: transparent;
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
