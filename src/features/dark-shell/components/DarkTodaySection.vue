<template>
  <scroll-view class="dark-today" scroll-y>
    <view class="dark-today__inner">
      <text class="dark-today__date">{{ displayDate }}</text>
      <text class="dark-today__title">{{ homeHeroTitle }}</text>
      <text class="dark-today__subtitle">{{ subtitle }}</text>

      <view class="dark-today__divider">
        <view class="dark-today__divider-accent"></view>
        <view class="dark-today__divider-line"></view>
      </view>

      <view class="dark-today__section-head">
        <text class="dark-today__section-label">今日一问 · 五分钟档案馆</text>
        <view class="dark-today__section-line"></view>
      </view>

      <view class="dark-today__question-card" @tap="openArchive">
        <text class="dark-today__question">「{{ todayQuestion }}」</text>
        <view class="dark-today__question-foot">
          <text class="dark-today__question-action">{{ archiveStore.hasAnsweredToday ? copy.archive.saved : copy.archive.answerNow }}</text>
          <text class="dark-today__question-action">{{ streakText }}</text>
        </view>
      </view>

      <view class="dark-today__stats">
        <view v-for="item in stats" :key="item.label" class="dark-today__stat">
          <text class="dark-today__stat-value">{{ item.value }}</text>
          <text class="dark-today__stat-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="dark-today__section-head dark-today__section-head--secondary">
        <text class="dark-today__section-label">最近随笔</text>
        <view class="dark-today__section-line"></view>
      </view>

      <view
        v-for="entry in recentJottings"
        :key="entry.id"
        class="dark-today__entry"
        @tap="handleOpenEntry(entry.id)"
      >
        <text class="dark-today__entry-date">{{ formatDate(entry.recordDate, 'DD') }}</text>
        <view class="dark-today__entry-copy">
          <text class="dark-today__entry-title">{{ entry.title || '未命名随笔' }}</text>
          <text class="dark-today__entry-preview">{{ formatPreview(entry.content) }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useArchiveStore } from "@/app/store/useArchiveStore";
import { getEntryRepository } from "@/app/store/entryRepository";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { resolveHomeHeroTitle } from "@/features/home/homeHeroTitle";
import { ROUTES } from "@/shared/constants/routes";
import { t } from "@/shared/i18n";
import { formatDate } from "@/shared/utils/date";
import type { Entry } from "@/domain/entry/types";

const emit = defineEmits<{
  (event: "open-archive", mode: "main" | "write"): void;
}>();

const settingsStore = useSettingsStore();
const archiveStore = useArchiveStore();
const copy = computed(() => t(settingsStore.locale));
const todayDate = computed(() => formatDate(new Date(), "YYYY-MM-DD"));
const recentJottings = ref<Entry[]>([]);
const recordedDays = ref(0);
const pendingFutureCount = ref(0);

const displayDate = computed(() => formatDate(new Date(), settingsStore.locale === "en-US" ? "MMMM YYYY" : "YYYY年MM月DD日 · dddd"));
const homeHeroTitle = computed(() => resolveHomeHeroTitle({
  dateKey: todayDate.value,
  locale: settingsStore.locale,
  fallbackTitle: copy.value.home.title,
  titleMode: settingsStore.homeTitleMode,
  customTitle: settingsStore.homeCustomTitle,
}));
const subtitle = computed(() => copy.value.home.heroSubtitle);
const todayQuestion = computed(() => archiveStore.todayQuestion?.question ?? "今天你最想留下什么？");
const streakText = computed(() => `第${Math.max(recordedDays.value, 1)}天`);
const stats = computed(() => ([
  { value: String(recordedDays.value), label: "连续书写天数" },
  { value: String(archiveStore.history.length), label: "归档记忆总数" },
  { value: String(pendingFutureCount.value), label: "待开封信件" },
]));

function formatPreview(content: string): string {
  return content.length > 46 ? `${content.slice(0, 46)}…` : content;
}

function openArchive() {
  emit("open-archive", archiveStore.hasAnsweredToday ? "main" : "write");
}

function handleOpenEntry(entryId: string) {
  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entryId}`,
  });
}

async function loadTodayData(): Promise<void> {
  await archiveStore.resolveTodayQuestion(todayDate.value);

  const [jottings, statsSnapshot, futures] = await Promise.all([
    getEntryRepository().getByType("jotting"),
    getEntryRepository().getProfileStats(),
    getEntryRepository().getByType("future"),
  ]);

  recentJottings.value = jottings.slice(0, 4);
  recordedDays.value = statsSnapshot.recordedDays;
  pendingFutureCount.value = futures.filter((entry) => entry.status === "sealed").length;
}

onMounted(() => {
  void loadTodayData();
});
</script>

<style scoped>
.dark-today {
  flex: 1;
  min-height: 0;
}

.dark-today__inner {
  max-width: 390px;
  margin: 0 auto;
  padding: 52px 28px 104px;
}

.dark-today__date {
  display: block;
  font-size: 12px;
  line-height: 1.6;
  color: #564e42;
}

.dark-today__title {
  display: block;
  margin-top: 22px;
  font-size: 58px;
  line-height: 1.05;
  font-weight: 300;
  letter-spacing: 0.64em;
  padding-left: 0.64em;
}

.dark-today__subtitle {
  display: block;
  margin-top: 18px;
  font-size: 14px;
  line-height: 2;
  color: #564e42;
}

.dark-today__divider {
  display: flex;
  align-items: center;
  margin: 36px 0 28px;
}

.dark-today__divider-accent {
  width: 42px;
  height: 1px;
  background: #a83228;
}

.dark-today__divider-line,
.dark-today__section-line {
  flex: 1;
  height: 1px;
  background: #1e1a14;
}

.dark-today__section-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.dark-today__section-head--secondary {
  margin-top: 36px;
}

.dark-today__section-label,
.dark-today__question-action,
.dark-today__stat-label,
.dark-today__entry-date {
  font-size: 12px;
  line-height: 1.6;
  color: #b8883a;
}

.dark-today__question-card {
  border: 1px solid #1e1a14;
  border-left: 2px solid #a83228;
  background: #131009;
  padding: 22px 22px 20px;
}

.dark-today__question {
  display: block;
  font-size: 20px;
  line-height: 1.7;
}

.dark-today__question-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}

.dark-today__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 18px;
}

.dark-today__stat {
  border: 1px solid #1e1a14;
  background: #0c0a08;
  padding: 16px 14px;
}

.dark-today__stat-value {
  display: block;
  font-size: 30px;
  line-height: 1.2;
  color: #d4c9b0;
}

.dark-today__entry {
  display: flex;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid #1e1a14;
}

.dark-today__entry-date {
  width: 40px;
}

.dark-today__entry-copy {
  flex: 1;
}

.dark-today__entry-title {
  display: block;
  font-size: 20px;
  line-height: 1.5;
}

.dark-today__entry-preview {
  display: block;
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.9;
  color: #564e42;
}
</style>
