<template>
  <view class="diary-prelude-picker">
    <view class="diary-prelude-picker__grain"></view>

    <view class="diary-prelude-picker__topbar">
      <TopbarIconButton @tap="$emit('go-back')" />
      <text class="diary-prelude-picker__title">落笔之前，先拾起今日的碎片</text>
      <text v-if="canSkip" class="diary-prelude-picker__skip" @tap="handleSkip">跳过</text>
      <view v-else class="diary-prelude-picker__skip-spacer"></view>
    </view>

    <scroll-view class="diary-prelude-picker__body" scroll-y>
      <view class="diary-prelude-picker__preview-card">
        <view class="diary-prelude-picker__preview-glyph-wrap">
          <DiaryPreludeGlyph
            class="diary-prelude-picker__preview-glyph"
            :kind="previewWeatherCode ? 'weather' : 'mood'"
            :code="previewWeatherCode ?? previewMoodCode"
          />
        </view>

        <text class="diary-prelude-picker__preview-headline">{{ previewHeadlineZh }}</text>
        <text class="diary-prelude-picker__preview-subline">{{ previewHeadlineEn }}</text>
        <view class="diary-prelude-picker__preview-line"></view>
        <text class="diary-prelude-picker__preview-note">{{ previewNote }}</text>
      </view>

      <view class="diary-prelude-picker__section">
        <view class="diary-prelude-picker__section-head">
          <text class="diary-prelude-picker__section-title">天气</text>
          <text class="diary-prelude-picker__section-subtitle">Weather</text>
        </view>
        <view class="diary-prelude-picker__grid">
          <view
            v-for="option in DIARY_WEATHER_OPTIONS"
            :key="option.code"
            class="diary-prelude-picker__option"
            :class="{ 'diary-prelude-picker__option--active': weatherCode === option.code }"
            @tap="toggleWeather(option.code)"
          >
            <view class="diary-prelude-picker__option-glyph-wrap">
              <DiaryPreludeGlyph class="diary-prelude-picker__option-glyph" kind="weather" :code="option.code" />
            </view>
            <view v-if="weatherCode === option.code" class="diary-prelude-picker__option-mark"></view>
            <text class="diary-prelude-picker__option-zh">{{ option.labelZh }}</text>
            <text class="diary-prelude-picker__option-en">{{ option.labelEn.toUpperCase() }}</text>
          </view>
        </view>
      </view>

      <view class="diary-prelude-picker__section">
        <view class="diary-prelude-picker__section-head">
          <text class="diary-prelude-picker__section-title">心情</text>
          <text class="diary-prelude-picker__section-subtitle">Mood</text>
        </view>
        <view class="diary-prelude-picker__grid diary-prelude-picker__grid--mood">
          <view
            v-for="option in DIARY_MOOD_OPTIONS"
            :key="option.code"
            class="diary-prelude-picker__option"
            :class="{ 'diary-prelude-picker__option--active': moodCode === option.code }"
            @tap="toggleMood(option.code)"
          >
            <view class="diary-prelude-picker__option-glyph-wrap">
              <DiaryPreludeGlyph class="diary-prelude-picker__option-glyph" kind="mood" :code="option.code" />
            </view>
            <view v-if="moodCode === option.code" class="diary-prelude-picker__option-mark"></view>
            <text class="diary-prelude-picker__option-zh">{{ option.labelZh }}</text>
            <text class="diary-prelude-picker__option-en">{{ option.labelEn.toUpperCase() }}</text>
          </view>
        </view>
      </view>

      <view class="diary-prelude-picker__footer">
        <view
          class="diary-prelude-picker__confirm"
          :class="{ 'diary-prelude-picker__confirm--disabled': !previewPrelude }"
          @tap="handleConfirm"
        >
          <text class="diary-prelude-picker__confirm-label">带着它写下去</text>
        </view>
        <text v-if="pickerHint" class="diary-prelude-picker__hint">{{ pickerHint }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  buildDiaryPreludeMeta,
  DIARY_MOOD_OPTIONS,
  DIARY_WEATHER_OPTIONS,
} from "@/domain/diaryPrelude/catalog";
import type { DiaryPreludeMeta } from "@/domain/diaryPrelude/types";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

const props = defineProps<{
  initialPrelude: DiaryPreludeMeta | null;
  canSkip: boolean;
}>();

const emit = defineEmits<{
  (event: "confirm", payload: DiaryPreludeMeta): void;
  (event: "skip"): void;
  (event: "go-back"): void;
}>();

const weatherCode = ref<string | null>(props.initialPrelude?.weatherCode ?? null);
const moodCode = ref<string | null>(props.initialPrelude?.moodCode ?? null);

watch(
  () => props.initialPrelude,
  (value) => {
    weatherCode.value = value?.weatherCode ?? null;
    moodCode.value = value?.moodCode ?? null;
  },
);

const previewPrelude = computed(() =>
  buildDiaryPreludeMeta({
    weatherCode: weatherCode.value,
    moodCode: moodCode.value,
  }),
);
const selectedWeather = computed(() => DIARY_WEATHER_OPTIONS.find((option) => option.code === weatherCode.value) ?? null);
const selectedMood = computed(() => DIARY_MOOD_OPTIONS.find((option) => option.code === moodCode.value) ?? null);
const previewWeatherCode = computed(() => previewPrelude.value?.weatherCode ?? weatherCode.value);
const previewMoodCode = computed(() => previewPrelude.value?.moodCode ?? moodCode.value);
const previewHeadlineZh = computed(() => {
  if (!selectedWeather.value && !selectedMood.value) {
    return "将天气与心事，安放于纸页边缘";
  }

  return [selectedWeather.value?.labelZh, selectedMood.value?.labelZh].filter(Boolean).join(" · ");
});
const previewHeadlineEn = computed(() => {
  if (!selectedWeather.value && !selectedMood.value) {
    return "WEATHER · MOOD";
  }

  return [selectedWeather.value?.labelEn, selectedMood.value?.labelEn]
    .filter(Boolean)
    .map((segment) => segment?.toUpperCase())
    .join(" · ");
});
const previewNote = computed(() => {
  if (previewPrelude.value?.quote) {
    return previewPrelude.value.quote;
  }

  return "让这页留白先感知，你从怎样的一天里走来。";
});
const pickerHint = computed(() => (props.canSkip ? "可以先跳过。" : ""));

function toggleWeather(code: string): void {
  weatherCode.value = weatherCode.value === code ? null : code;
}

function toggleMood(code: string): void {
  moodCode.value = moodCode.value === code ? null : code;
}

function handleConfirm(): void {
  if (!previewPrelude.value) {
    return;
  }

  emit("confirm", previewPrelude.value);
}

function handleSkip(): void {
  if (!props.canSkip) {
    return;
  }

  emit("skip");
}
</script>

<style scoped>
.diary-prelude-picker,
.diary-prelude-picker * {
  box-sizing: border-box;
}

.diary-prelude-picker {
  min-height: 100vh;
  background: #fbf9f5;
  color: #31332e;
  position: relative;
}

.diary-prelude-picker__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.74)),
    radial-gradient(circle at center, rgba(49, 51, 46, 0.05), transparent 60%);
}

.diary-prelude-picker__topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 72rpx 1fr auto;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 36rpx 24rpx;
  background: rgba(251, 249, 245, 0.96);
  backdrop-filter: blur(12rpx);
}

.diary-prelude-picker__title {
  text-align: center;
  font-size: 24rpx;
  line-height: 1.5;
  color: rgba(99, 95, 85, 0.74);
  letter-spacing: 0.1em;
}

.diary-prelude-picker__skip {
  min-width: 72rpx;
  text-align: right;
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 22rpx;
  color: rgba(138, 129, 120, 0.78);
  transition: opacity 160ms ease, transform 180ms ease;
}

.diary-prelude-picker__skip:active {
  opacity: 0.72;
  transform: translateY(1rpx);
}

.diary-prelude-picker__skip-spacer {
  min-width: 72rpx;
  min-height: 32rpx;
}

.diary-prelude-picker__body {
  min-height: calc(100vh - 124rpx);
  padding: 28rpx 36rpx 44rpx;
}

.diary-prelude-picker__preview-card {
  padding: 68rpx 48rpx 56rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.diary-prelude-picker__preview-glyph-wrap {
  width: 128rpx;
  height: 128rpx;
  border-radius: 999rpx;
  background: rgba(245, 244, 238, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(49, 51, 46, 0.88);
  margin-bottom: 40rpx;
}

.diary-prelude-picker__preview-glyph {
  width: 68rpx;
  height: 68rpx;
}

.diary-prelude-picker__preview-headline {
  font-size: 56rpx;
  line-height: 1.16;
  letter-spacing: 0.18em;
  margin-bottom: 16rpx;
}

.diary-prelude-picker__preview-subline {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 22rpx;
  color: rgba(138, 129, 120, 0.72);
  letter-spacing: 0.4em;
}

.diary-prelude-picker__preview-line {
  width: 72rpx;
  height: 1rpx;
  background: rgba(177, 179, 171, 0.28);
  margin: 36rpx 0 28rpx;
}

.diary-prelude-picker__preview-note {
  font-size: 26rpx;
  line-height: 1.8;
  color: rgba(99, 95, 85, 0.76);
}

.diary-prelude-picker__section {
  margin-top: 40rpx;
}

.diary-prelude-picker__section-head {
  margin-bottom: 18rpx;
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.diary-prelude-picker__section-title {
  font-size: 28rpx;
  letter-spacing: 0.1em;
}

.diary-prelude-picker__section-subtitle {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  color: rgba(138, 129, 120, 0.72);
  letter-spacing: 0.24em;
}

.diary-prelude-picker__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.diary-prelude-picker__grid--mood {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.diary-prelude-picker__option {
  position: relative;
  min-height: 156rpx;
  padding: 24rpx 18rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.68);
  border: 1rpx solid rgba(177, 179, 171, 0.16);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  text-align: center;
  color: rgba(49, 51, 46, 0.86);
  transform: translateY(0) scale(1);
  box-shadow: 0 0 0 rgba(49, 51, 46, 0);
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms ease,
    background-color 220ms ease,
    color 180ms ease;
}

.diary-prelude-picker__option:active {
  transform: translateY(1rpx) scale(0.985);
  box-shadow: 0 8rpx 18rpx rgba(49, 51, 46, 0.06);
}

.diary-prelude-picker__option--active {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(138, 129, 120, 0.48);
  color: rgba(49, 51, 46, 0.96);
  transform: translateY(-4rpx);
  box-shadow:
    0 14rpx 28rpx rgba(49, 51, 46, 0.08),
    0 2rpx 0 rgba(255, 255, 255, 0.85) inset;
}

.diary-prelude-picker__option-glyph-wrap {
  width: 68rpx;
  height: 68rpx;
  border-radius: 999rpx;
  background: rgba(245, 244, 238, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(99, 95, 85, 0.82);
  transition:
    background-color 220ms ease,
    color 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-glyph-wrap {
  background: rgba(234, 229, 218, 0.82);
  color: rgba(49, 51, 46, 0.94);
  transform: scale(1.05);
}

.diary-prelude-picker__option-mark {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 999rpx;
  background: rgba(138, 129, 120, 0.82);
  box-shadow: 0 0 0 6rpx rgba(234, 229, 218, 0.55);
}

.diary-prelude-picker__option-glyph {
  width: 42rpx;
  height: 42rpx;
}

.diary-prelude-picker__option-zh {
  font-size: 26rpx;
  line-height: 1.2;
  transition: color 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-zh {
  color: rgba(49, 51, 46, 0.98);
  transform: translateY(-1rpx);
}

.diary-prelude-picker__option-en {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 16rpx;
  color: rgba(138, 129, 120, 0.68);
  letter-spacing: 0.22em;
  transition: color 180ms ease, letter-spacing 220ms ease;
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-en {
  color: rgba(99, 95, 85, 0.78);
  letter-spacing: 0.24em;
}

.diary-prelude-picker__footer {
  margin-top: 36rpx;
  padding-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.diary-prelude-picker__confirm {
  min-height: 88rpx;
  border-radius: 999rpx;
  background: rgba(95, 94, 94, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1);
  box-shadow: 0 10rpx 18rpx rgba(49, 51, 46, 0.1);
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.diary-prelude-picker__confirm:active {
  transform: scale(0.992);
  box-shadow: 0 6rpx 12rpx rgba(49, 51, 46, 0.08);
}

.diary-prelude-picker__confirm--disabled {
  background: rgba(177, 179, 171, 0.56);
  box-shadow: none;
}

.diary-prelude-picker__confirm-label {
  color: #faf7f6;
  font-size: 26rpx;
  letter-spacing: 0.16em;
}

.diary-prelude-picker__hint {
  text-align: center;
  font-size: 22rpx;
  line-height: 1.7;
  color: rgba(138, 129, 120, 0.72);
}

@media (prefers-reduced-motion: reduce) {
  .diary-prelude-picker__skip,
  .diary-prelude-picker__option,
  .diary-prelude-picker__option-glyph-wrap,
  .diary-prelude-picker__option-zh,
  .diary-prelude-picker__option-en,
  .diary-prelude-picker__confirm {
    transition: none !important;
    transform: none !important;
  }

  .diary-prelude-picker__option:active,
  .diary-prelude-picker__confirm:active,
  .diary-prelude-picker__skip:active,
  .diary-prelude-picker__option--active {
    transform: none !important;
  }
}
</style>
