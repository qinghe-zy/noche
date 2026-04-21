<template>
  <scroll-view class="dark-today" scroll-y>
    <view class="dark-today__inner">
      <text class="dark-today__date">{{ displayDate }}</text>
      <text class="dark-today__title" :style="titleStyle">{{ homeHeroTitle }}</text>
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
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useArchiveStore } from "@/app/store/useArchiveStore";
import { getEntryRepository } from "@/app/store/entryRepository";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { resolveHomeHeroTitle } from "@/features/home/homeHeroTitle";
import { t } from "@/shared/i18n";
import { formatDate } from "@/shared/utils/date";

const props = defineProps<{
  welcomeContent?: string;
}>();

const emit = defineEmits<{
  (event: "open-archive", mode: "main" | "write"): void;
}>();

const settingsStore = useSettingsStore();
const archiveStore = useArchiveStore();
const copy = computed(() => t(settingsStore.locale));
const todayDate = computed(() => formatDate(new Date(), "YYYY-MM-DD"));
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
const titleLength = computed(() => Array.from(homeHeroTitle.value.trim()).length || 1);
const titleStyle = computed(() => {
  if (titleLength.value <= 2) {
    return {
      fontSize: "58px",
      letterSpacing: "0.64em",
      paddingLeft: "0.64em",
    };
  }

  if (titleLength.value === 3) {
    return {
      fontSize: "50px",
      letterSpacing: "0.34em",
      paddingLeft: "0.34em",
    };
  }

  if (titleLength.value === 4) {
    return {
      fontSize: "42px",
      letterSpacing: "0.18em",
      paddingLeft: "0.18em",
    };
  }

  if (titleLength.value === 5) {
    return {
      fontSize: "36px",
      letterSpacing: "0.08em",
      paddingLeft: "0.08em",
    };
  }

  return {
    fontSize: "32px",
    letterSpacing: "0.04em",
    paddingLeft: "0.04em",
  };
});
const subtitle = computed(() => props.welcomeContent?.trim() || copy.value.home.heroSubtitle);
const todayQuestion = computed(() => archiveStore.todayQuestion?.question ?? "今天你最想留下什么？");
const streakText = computed(() => `第${Math.max(recordedDays.value, 1)}天`);
const stats = computed(() => ([
  { value: String(recordedDays.value), label: "连续书写天数" },
  { value: String(archiveStore.history.length), label: "归档记忆总数" },
  { value: String(pendingFutureCount.value), label: "待开封信件" },
]));

function openArchive() {
  emit("open-archive", archiveStore.hasAnsweredToday ? "main" : "write");
}

async function loadTodayData(): Promise<void> {
  await archiveStore.resolveTodayQuestion(todayDate.value);

  const [statsSnapshot, futures] = await Promise.all([
    getEntryRepository().getProfileStats(),
    getEntryRepository().getByType("future"),
  ]);

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
  max-width: 100%;
  line-height: 1.05;
  font-weight: 300;
  white-space: nowrap;
  overflow: hidden;
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

.dark-today__section-label,
.dark-today__question-action,
.dark-today__stat-label {
  font-size: 12px;
  line-height: 1.6;
  color: #b8883a;
}

.dark-today__question-card {
  border: 1px solid #1e1a14;
  border-left: 2px solid #a83228;
  background: #131009;
  padding: 22px 22px 20px;
  box-shadow:
    0 0 0 1px rgba(201, 150, 60, 0.06),
    0 18px 34px rgba(0, 0, 0, 0.28),
    0 0 16px rgba(168, 50, 40, 0.12);
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
  box-shadow:
    inset 0 0 0 1px rgba(234, 226, 206, 0.03),
    0 0 14px rgba(201, 150, 60, 0.08);
}

.dark-today__stat-value {
  display: block;
  font-size: 30px;
  line-height: 1.2;
  color: #d4c9b0;
}
</style>
