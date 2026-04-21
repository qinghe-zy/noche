<template>
  <scroll-view class="dark-future" scroll-y>
    <view class="dark-future__inner">
      <text class="dark-future__eyebrow">Letters to Future Self</text>
      <text class="dark-future__title">致未来</text>

      <view class="dark-future__intro" @tap="openFutureEditor">
        <ChisuSymbol symbol="✉" tone="muted" class="dark-future__intro-icon" />
        <text class="dark-future__intro-title">写给以后的你</text>
        <text class="dark-future__intro-copy">信件将在你指定的日期{{ '\n' }}悄悄出现在邮箱里</text>
      </view>

      <view
        v-for="entry in futureEntries"
        :key="entry.id"
        class="dark-future__entry"
        @tap="handleOpenEntry(entry.id)"
      >
        <view class="dark-future__entry-head">
          <text class="dark-future__entry-title">{{ entry.title || '致未来的自己' }}</text>
          <text class="dark-future__entry-date">{{ entry.unlockDate ? `${entry.unlockDate} ${entry.status === 'sealed' ? '开封' : '已启'}` : '' }}</text>
        </view>
        <text class="dark-future__entry-preview">{{ formatPreview(entry.content) }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getEntryRepository } from "@/app/store/entryRepository";
import type { Entry } from "@/domain/entry/types";
import ChisuSymbol from "@/features/dark-shell/components/ChisuSymbol.vue";
import { ROUTES } from "@/shared/constants/routes";

const futureEntries = ref<Entry[]>([]);

function formatPreview(content: string): string {
  return content.length > 80 ? `${content.slice(0, 80)}…` : content;
}

function openFutureEditor() {
  uni.navigateTo({
    url: `/${ROUTES.editor}?type=future`,
  });
}

function handleOpenEntry(entryId: string) {
  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entryId}`,
  });
}

onMounted(async () => {
  futureEntries.value = await getEntryRepository().getByType("future");
});
</script>

<style scoped>
.dark-future {
  flex: 1;
  min-height: 0;
}

.dark-future__inner {
  max-width: 390px;
  margin: 0 auto;
  padding: 52px 28px 104px;
}

.dark-future__eyebrow {
  display: block;
  font-size: 12px;
  line-height: 1.6;
  color: #564e42;
}

.dark-future__title {
  display: block;
  margin-top: 18px;
  font-size: 42px;
  line-height: 1.08;
  letter-spacing: 0.18em;
}

.dark-future__intro {
  margin-top: 28px;
  padding: 40px 24px;
  border-top: 1px solid #1e1a14;
  border-bottom: 1px solid #1e1a14;
  text-align: center;
}

.dark-future__intro-icon {
  font-size: 36px;
}

.dark-future__intro-title {
  display: block;
  margin-top: 16px;
  font-size: 24px;
}

.dark-future__intro-copy {
  display: block;
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.9;
  color: #564e42;
}

.dark-future__entry {
  margin-top: 18px;
  border: 1px solid #1e1a14;
  padding: 18px;
}

.dark-future__entry-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.dark-future__entry-title {
  font-size: 18px;
  line-height: 1.6;
  color: #b8883a;
}

.dark-future__entry-date {
  font-size: 12px;
  color: #564e42;
}

.dark-future__entry-preview {
  display: block;
  margin-top: 16px;
  font-size: 16px;
  line-height: 1.8;
}
</style>
