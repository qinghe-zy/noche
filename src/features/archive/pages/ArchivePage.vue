<template>
  <view class="archive-page theme-dark">
    <view class="archive-page__topbar">
      <button v-if="view !== 'main'" class="archive-page__back" @tap="handleBack">返回</button>
      <text v-else class="archive-page__back archive-page__back--ghost"> </text>
      <text class="archive-page__topbar-title">{{ copy.archive.title }}</text>
      <text class="archive-page__back archive-page__back--ghost"> </text>
    </view>

    <view v-if="view === 'main'" class="archive-page__body">
      <text class="archive-page__eyebrow">{{ copy.archive.eyebrow }}</text>
      <text class="archive-page__title">{{ copy.archive.title }}</text>

      <view class="archive-page__today-card" @tap="handleOpenToday">
        <text class="archive-page__section-label">{{ copy.archive.today }}</text>
        <text class="archive-page__question">「{{ archiveStore.todayQuestion?.question ?? '' }}」</text>
        <text class="archive-page__card-action">
          {{ archiveStore.hasAnsweredToday ? copy.archive.saved : copy.archive.answerNow }}
        </text>
      </view>

      <view
        v-if="archiveStore.oneYearAgoEntry"
        class="archive-page__memory-card"
        @tap="handleOpenMemory(archiveStore.oneYearAgoEntry)"
      >
        <text class="archive-page__section-label">{{ copy.archive.oneYearAgo }}</text>
        <text class="archive-page__memory-question">「{{ archiveStore.oneYearAgoEntry.question }}」</text>
        <text class="archive-page__memory-answer">{{ archiveStore.oneYearAgoEntry.answer }}</text>
      </view>

      <view v-if="archiveStore.history.length" class="archive-page__history">
        <text class="archive-page__section-label">{{ copy.archive.history }}</text>
        <view
          v-for="entry in archiveStore.history"
          :key="entry.id"
          class="archive-page__history-item"
          @tap="handleOpenMemory(entry)"
        >
          <text class="archive-page__history-date">{{ formatArchiveHistoryDate(entry.date, settingsStore.locale) }}</text>
          <view class="archive-page__history-copy">
            <text class="archive-page__history-question">「{{ entry.question }}」</text>
            <text class="archive-page__history-answer">{{ entry.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="view === 'write'" class="archive-page__body archive-page__body--write">
      <text class="archive-page__eyebrow">{{ formatArchiveLongDate(todayDate, settingsStore.locale) }}</text>
      <text class="archive-page__write-question">「{{ archiveStore.todayQuestion?.question ?? '' }}」</text>
      <textarea
        v-model="draftAnswer"
        class="archive-page__write-area"
        :maxlength="500"
        :placeholder="copy.archive.answerPlaceholder"
      />
      <text class="archive-page__write-count">{{ draftAnswer.length }} / 500</text>
      <button class="archive-page__submit" :disabled="!draftAnswer.trim()" @tap="handleSubmit">
        <ChisuSymbol symbol="✦" tone="accent" />
        <text class="archive-page__submit-label">{{ copy.archive.save }}</text>
      </button>
    </view>

    <view v-else-if="view === 'success'" class="archive-page__body archive-page__body--success">
      <ChisuSymbol symbol="✦" tone="accent" class="archive-page__success-symbol" />
      <text class="archive-page__success-title">{{ copy.archive.saved }}</text>
      <button class="archive-page__success-button" @tap="view = 'main'">{{ copy.archive.backToArchive }}</button>
    </view>

    <view v-else-if="view === 'memory'" class="archive-page__body archive-page__body--memory">
      <text class="archive-page__eyebrow">{{ memoryEntry ? formatArchiveLongDate(memoryEntry.date, settingsStore.locale) : '' }}</text>
      <text class="archive-page__write-question">「{{ memoryEntry?.question ?? '' }}」</text>
      <text class="archive-page__memory-detail">{{ memoryEntry?.answer ?? '' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useArchiveStore } from "@/app/store/useArchiveStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import ChisuSymbol from "@/features/dark-shell/components/ChisuSymbol.vue";
import { formatArchiveHistoryDate, formatArchiveLongDate } from "@/features/archive/archiveDisplay";
import type { ArchiveEntry } from "@/features/archive/types";
import { t } from "@/shared/i18n";
import { formatDate } from "@/shared/utils/date";

type ArchivePageView = "main" | "write" | "success" | "memory";

const archiveStore = useArchiveStore();
const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));
const todayDate = formatDate(new Date(), "YYYY-MM-DD");
const view = ref<ArchivePageView>("main");
const draftAnswer = ref("");
const memoryEntry = ref<ArchiveEntry | null>(null);

function handleOpenToday() {
  view.value = archiveStore.hasAnsweredToday ? "main" : "write";
}

async function handleSubmit() {
  const answer = draftAnswer.value.trim();

  if (!answer) {
    return;
  }

  await archiveStore.answerToday(answer);
  draftAnswer.value = "";
  view.value = "success";
}

function handleOpenMemory(entry: ArchiveEntry) {
  memoryEntry.value = entry;
  view.value = "memory";
}

function handleBack() {
  if (view.value === "write" || view.value === "memory" || view.value === "success") {
    view.value = "main";
  }
}

onLoad(async (query) => {
  await archiveStore.resolveTodayQuestion(todayDate);

  if (typeof query?.mode === "string" && query.mode === "write" && !archiveStore.hasAnsweredToday) {
    view.value = "write";
  }
});
</script>

<style scoped>
.archive-page,
.archive-page * {
  box-sizing: border-box;
}

.archive-page {
  min-height: 100vh;
  background: #0c0a08;
  color: #eae2ce;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.archive-page__topbar {
  display: grid;
  grid-template-columns: 72px 1fr 72px;
  align-items: center;
  padding: 24px 20px 8px;
}

.archive-page__topbar-title {
  text-align: center;
  font-size: 16px;
  letter-spacing: 0.16em;
}

.archive-page__back {
  border: none;
  background: transparent;
  color: #564e42;
  text-align: left;
}

.archive-page__back--ghost {
  opacity: 0;
}

.archive-page__body {
  padding: 20px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.archive-page__body--write,
.archive-page__body--success,
.archive-page__body--memory {
  min-height: calc(100vh - 72px);
  justify-content: center;
}

.archive-page__eyebrow,
.archive-page__section-label,
.archive-page__history-date,
.archive-page__card-action {
  font-size: 12px;
  line-height: 1.6;
  color: #b8883a;
}

.archive-page__title {
  font-size: 42px;
  line-height: 1.08;
}

.archive-page__today-card,
.archive-page__memory-card,
.archive-page__history-item {
  border: 1px solid #1e1a14;
  background: #131009;
}

.archive-page__today-card,
.archive-page__memory-card {
  padding: 20px;
}

.archive-page__question,
.archive-page__write-question,
.archive-page__memory-question {
  font-size: 20px;
  line-height: 1.7;
}

.archive-page__memory-answer,
.archive-page__memory-detail,
.archive-page__history-answer {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.9;
  color: #564e42;
}

.archive-page__history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.archive-page__history-item {
  display: flex;
  gap: 14px;
  padding: 16px;
}

.archive-page__history-copy {
  flex: 1;
}

.archive-page__history-question {
  display: block;
  font-size: 16px;
  line-height: 1.7;
}

.archive-page__write-area {
  min-height: 220px;
  width: 100%;
  border: 1px solid #1e1a14;
  background: #131009;
  color: #eae2ce;
  padding: 18px;
}

.archive-page__write-count {
  align-self: flex-end;
  font-size: 12px;
  color: #564e42;
}

.archive-page__submit,
.archive-page__success-button {
  border: 1px solid #1e1a14;
  background: #a83228;
  color: #eae2ce;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.archive-page__submit[disabled] {
  opacity: 0.48;
}

.archive-page__submit-label {
  color: inherit;
}

.archive-page__success-symbol {
  font-size: 32px;
  align-self: center;
}

.archive-page__success-title {
  text-align: center;
  font-size: 28px;
}
</style>
