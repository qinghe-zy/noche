<template>
  <scroll-view class="dark-writing" scroll-y>
    <view class="dark-writing__inner">
      <text class="dark-writing__eyebrow">{{ activeMode === 'jotting' ? 'April 2026' : 'Diary 2026' }}</text>
      <view class="dark-writing__title-row">
        <text
          class="dark-writing__title"
          :class="{ 'dark-writing__title--active': activeMode === 'jotting' }"
          @tap="activeMode = 'jotting'"
        >随 笔</text>
        <text
          class="dark-writing__title"
          :class="{ 'dark-writing__title--active': activeMode === 'diary' }"
          @tap="activeMode = 'diary'"
        >日 记</text>
      </view>

      <view
        v-for="entry in visibleEntries"
        :key="entry.id"
        class="dark-writing__entry"
        @tap="handleOpenEntry(entry.id)"
      >
        <view class="dark-writing__date">
          <text>{{ formatDate(entry.recordDate, 'DD') }}</text>
          <text>{{ formatDate(entry.recordDate, 'MM') }}</text>
        </view>
        <view class="dark-writing__copy">
          <text class="dark-writing__entry-title">{{ entry.title || fallbackEntryTitle(entry.type, settingsStore.locale) }}</text>
          <text class="dark-writing__entry-preview">{{ formatPreview(entry.content) }}</text>
        </view>
      </view>
    </view>

    <button class="dark-writing__fab" @tap="handleCompose">
      <ChisuSymbol symbol="✦" tone="active" />
    </button>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getEntryRepository } from "@/app/store/entryRepository";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { Entry } from "@/domain/entry/types";
import { fallbackEntryTitle } from "@/features/entries/entryDisplay";
import ChisuSymbol from "@/features/dark-shell/components/ChisuSymbol.vue";
import { ROUTES } from "@/shared/constants/routes";
import { formatDate } from "@/shared/utils/date";

const settingsStore = useSettingsStore();
const activeMode = ref<"jotting" | "diary">("jotting");
const jottingEntries = ref<Entry[]>([]);
const diaryEntries = ref<Entry[]>([]);

const visibleEntries = computed(() => activeMode.value === "jotting" ? jottingEntries.value : diaryEntries.value);

function formatPreview(content: string): string {
  return content.length > 72 ? `${content.slice(0, 72)}…` : content;
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

async function loadEntries() {
  const [jottings, diaries] = await Promise.all([
    getEntryRepository().getByType("jotting"),
    getEntryRepository().getByType("diary"),
  ]);
  jottingEntries.value = jottings;
  diaryEntries.value = diaries;
}

onMounted(() => {
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

.dark-writing__eyebrow {
  display: block;
  font-size: 12px;
  line-height: 1.6;
  color: #564e42;
}

.dark-writing__title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.dark-writing__title {
  font-size: 42px;
  line-height: 1.08;
  color: #564e42;
  letter-spacing: 0.22em;
}

.dark-writing__title--active {
  color: #eae2ce;
}

.dark-writing__entry {
  display: flex;
  gap: 20px;
  padding: 24px 0;
  border-top: 1px solid #1e1a14;
}

.dark-writing__date {
  width: 40px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #564e42;
  font-size: 12px;
}

.dark-writing__copy {
  flex: 1;
}

.dark-writing__entry-title {
  display: block;
  font-size: 20px;
  line-height: 1.5;
}

.dark-writing__entry-preview {
  display: block;
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.9;
  color: #564e42;
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
