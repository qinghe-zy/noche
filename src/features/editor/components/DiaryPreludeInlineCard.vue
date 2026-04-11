<template>
  <view
    class="diary-prelude-inline-card"
    :class="{
      'diary-prelude-inline-card--editable': mode === 'edit',
      'diary-prelude-inline-card--empty': !hasPrelude,
    }"
    @tap="handleTap"
  >
    <view class="diary-prelude-inline-card__leading">
      <view class="diary-prelude-inline-card__glyph-wrap">
        <DiaryPreludeGlyph
          class="diary-prelude-inline-card__glyph"
          :kind="primaryKind"
          :code="primaryCode"
        />
      </view>
      <view v-if="hasMoodBadge" class="diary-prelude-inline-card__badge">
        <DiaryPreludeGlyph class="diary-prelude-inline-card__badge-glyph" kind="mood" :code="prelude?.moodCode" />
      </view>
    </view>

    <view class="diary-prelude-inline-card__content">
      <text class="diary-prelude-inline-card__headline">{{ summaryZh }}</text>
      <text class="diary-prelude-inline-card__subline">{{ summaryEn }}</text>
      <text v-if="noteLine" class="diary-prelude-inline-card__note">{{ noteLine }}</text>
    </view>

    <text v-if="mode === 'edit'" class="diary-prelude-inline-card__cta">
      {{ hasPrelude ? "轻点修改" : "先选一下" }}
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { hasDiaryPrelude } from "@/domain/diaryPrelude/catalog";
import type { DiaryPreludeMeta } from "@/domain/diaryPrelude/types";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";

const props = defineProps<{
  mode: "edit" | "read";
  prelude: DiaryPreludeMeta | null;
}>();

const emit = defineEmits<{
  (event: "edit"): void;
}>();

const hasPrelude = computed(() => hasDiaryPrelude(props.prelude));
const primaryKind = computed<"weather" | "mood">(() => (props.prelude?.weatherCode ? "weather" : "mood"));
const primaryCode = computed(() => props.prelude?.weatherCode ?? props.prelude?.moodCode ?? "sunny");
const hasMoodBadge = computed(() => Boolean(props.prelude?.weatherCode && props.prelude?.moodCode));
const summaryZh = computed(() => {
  if (!hasPrelude.value) {
    return "先选天气和心情";
  }

  return [props.prelude?.weatherLabelZh, props.prelude?.moodLabelZh].filter(Boolean).join(" · ");
});
const summaryEn = computed(() => {
  if (!hasPrelude.value) {
    return "WEATHER & MOOD";
  }

  return [props.prelude?.weatherLabelEn, props.prelude?.moodLabelEn]
    .filter(Boolean)
    .map((segment) => segment?.toUpperCase())
    .join(" · ");
});
const noteLine = computed(() => (hasPrelude.value ? props.prelude?.note ?? "" : "可跳过，稍后也能在纸面顶部补选"));

function handleTap(): void {
  if (props.mode !== "edit") {
    return;
  }

  emit("edit");
}
</script>

<style scoped>
.diary-prelude-inline-card,
.diary-prelude-inline-card * {
  box-sizing: border-box;
}

.diary-prelude-inline-card {
  width: 100%;
  min-height: 176rpx;
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 22rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(177, 179, 171, 0.18);
}

.diary-prelude-inline-card--editable {
  background: rgba(255, 255, 255, 0.84);
}

.diary-prelude-inline-card--empty {
  background: rgba(245, 244, 238, 0.68);
}

.diary-prelude-inline-card__leading {
  width: 82rpx;
  height: 82rpx;
  position: relative;
  flex-shrink: 0;
}

.diary-prelude-inline-card__glyph-wrap {
  width: 82rpx;
  height: 82rpx;
  border-radius: 999rpx;
  background: rgba(245, 244, 238, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(49, 51, 46, 0.82);
}

.diary-prelude-inline-card__glyph {
  width: 42rpx;
  height: 42rpx;
}

.diary-prelude-inline-card__badge {
  position: absolute;
  right: -4rpx;
  bottom: -2rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 999rpx;
  background: rgba(251, 249, 245, 0.96);
  border: 1rpx solid rgba(177, 179, 171, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(99, 95, 85, 0.88);
}

.diary-prelude-inline-card__badge-glyph {
  width: 18rpx;
  height: 18rpx;
}

.diary-prelude-inline-card__content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.diary-prelude-inline-card__headline {
  font-size: 28rpx;
  line-height: 1.24;
  color: rgba(49, 51, 46, 0.92);
  letter-spacing: 0.08em;
}

.diary-prelude-inline-card__subline {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  color: rgba(138, 129, 120, 0.72);
  letter-spacing: 0.28em;
}

.diary-prelude-inline-card__note {
  font-size: 20rpx;
  line-height: 1.42;
  color: rgba(99, 95, 85, 0.56);
}

.diary-prelude-inline-card__cta {
  flex-shrink: 0;
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  color: rgba(138, 129, 120, 0.72);
  letter-spacing: 0.18em;
}
</style>
