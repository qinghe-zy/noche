<template>
  <view class="diary-prelude-picker noche-mobile-page">
    <view class="diary-prelude-picker__grain"></view>

    <view class="diary-prelude-picker__topbar">
      <TopbarIconButton @tap="$emit('go-back')" />
      <text class="diary-prelude-picker__title">{{ copy.editor.diaryPreludeTitle }}</text>
      <text v-if="canSkip" class="diary-prelude-picker__skip" @tap="handleSkip">{{ copy.editor.diaryPreludeSkip }}</text>
      <view v-else class="diary-prelude-picker__skip-spacer"></view>
    </view>

    <scroll-view
      :id="viewportIds.body"
      class="diary-prelude-picker__body noche-mobile-scroll"
      :scroll-y="viewportScrollEnabled"
    >
      <view :id="viewportIds.content" class="diary-prelude-picker__body-fill noche-mobile-scroll-fill">
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
            <text class="diary-prelude-picker__section-title">{{ copy.editor.diaryPreludeWeather }}</text>
            <text class="diary-prelude-picker__section-subtitle">{{ settingsStore.locale === "en-US" ? "WEATHER" : "Weather" }}</text>
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
              <text class="diary-prelude-picker__option-zh">{{ settingsStore.locale === "en-US" ? option.labelEn : option.labelZh }}</text>
              <text class="diary-prelude-picker__option-en">{{ settingsStore.locale === "en-US" ? option.labelZh : option.labelEn.toUpperCase() }}</text>
            </view>
          </view>
        </view>

        <view class="diary-prelude-picker__section">
          <view class="diary-prelude-picker__section-head">
            <text class="diary-prelude-picker__section-title">{{ copy.editor.diaryPreludeMood }}</text>
            <text class="diary-prelude-picker__section-subtitle">{{ settingsStore.locale === "en-US" ? "MOOD" : "Mood" }}</text>
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
              <text class="diary-prelude-picker__option-zh">{{ settingsStore.locale === "en-US" ? option.labelEn : option.labelZh }}</text>
              <text class="diary-prelude-picker__option-en">{{ settingsStore.locale === "en-US" ? option.labelZh : option.labelEn.toUpperCase() }}</text>
            </view>
          </view>
        </view>

        <view class="diary-prelude-picker__footer">
          <view
            class="diary-prelude-picker__confirm"
            :class="{ 'diary-prelude-picker__confirm--disabled': !previewPrelude }"
            @tap="handleConfirm"
          >
            <text class="diary-prelude-picker__confirm-label">{{ copy.editor.diaryPreludeConfirm }}</text>
          </view>
          <text v-if="pickerHint" class="diary-prelude-picker__hint">{{ pickerHint }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import {
  buildDiaryPreludeMeta,
  DIARY_MOOD_OPTIONS,
  DIARY_WEATHER_OPTIONS,
} from "@/domain/diaryPrelude/catalog";
import type { DiaryPreludeMeta } from "@/domain/diaryPrelude/types";
import { useViewportContentFit } from "@/features/editor/composables/useViewportContentFit";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import { t } from "@/shared/i18n";
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
const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));

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
    return copy.value.editor.diaryPreludeEmptyPrimary;
  }

  return [
    settingsStore.locale === "en-US" ? selectedWeather.value?.labelEn : selectedWeather.value?.labelZh,
    settingsStore.locale === "en-US" ? selectedMood.value?.labelEn : selectedMood.value?.labelZh,
  ].filter(Boolean).join(" · ");
});
const previewHeadlineEn = computed(() => {
  if (!selectedWeather.value && !selectedMood.value) {
    return copy.value.editor.diaryPreludeEmptySecondary;
  }

  return [
    settingsStore.locale === "en-US" ? selectedWeather.value?.labelZh : selectedWeather.value?.labelEn,
    settingsStore.locale === "en-US" ? selectedMood.value?.labelZh : selectedMood.value?.labelEn,
  ]
    .filter(Boolean)
    .map((segment) => settingsStore.locale === "en-US" ? segment : segment?.toUpperCase())
    .join(" · ");
});
const previewNote = computed(() => {
  if (previewPrelude.value?.quote) {
    return previewPrelude.value.quote;
  }

  return copy.value.editor.diaryPreludeNoteFallback;
});
const pickerHint = computed(() => (props.canSkip ? copy.value.editor.diaryPreludeHint : ""));
const viewportLayoutSignature = computed(() => [
  settingsStore.locale,
  props.canSkip ? "skip" : "locked",
  weatherCode.value ?? "none",
  moodCode.value ?? "none",
  previewNote.value,
].join(":"));
const viewportFit = useViewportContentFit({
  layoutSignature: viewportLayoutSignature,
});
const viewportIds = viewportFit.ids;
const viewportScrollEnabled = viewportFit.scrollEnabled;

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
  background: var(--noche-bg);
  color: var(--noche-text);
  position: relative;
}

.diary-prelude-picker__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background:
    linear-gradient(to bottom, rgba(var(--noche-shadow-rgb), 0.02), rgba(var(--noche-shadow-rgb), 0.01)),
    radial-gradient(circle at center, rgba(var(--noche-paper-shadow-rgb), 0.05), transparent 60%);
}

.diary-prelude-picker__topbar {
  z-index: 10;
  display: grid;
  grid-template-columns: 72rpx 1fr auto;
  align-items: center;
  min-height: var(--noche-nav-bar-height);
  gap: 20rpx;
  padding: var(--noche-status-bar-height) var(--noche-page-padding-x) 0;
  background: var(--noche-surface);
  backdrop-filter: blur(12rpx);
  flex-shrink: 0;
}

.diary-prelude-picker__title {
  text-align: center;
  font-size: 24rpx;
  line-height: 1.5;
  color: var(--noche-ink-faint);
  letter-spacing: 0.1em;
}

.diary-prelude-picker__skip {
  min-width: 72rpx;
  text-align: right;
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 22rpx;
  color: var(--noche-ink-faint);
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
  min-height: var(--noche-content-min-height);
  padding: var(--noche-page-section-gap-tight) var(--noche-page-padding-x) var(--noche-page-bottom-padding);
}

.diary-prelude-picker__body-fill {
  gap: 0;
}

.diary-prelude-picker__preview-card {
  padding: 22rpx 18rpx 16rpx;
  border-radius: 24rpx;
  background: var(--noche-surface-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.diary-prelude-picker__preview-glyph-wrap {
  width: 68rpx;
  height: 68rpx;
  border-radius: 999rpx;
  background: var(--noche-card-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--noche-ink-strong);
  margin-bottom: 10rpx;
}

.diary-prelude-picker__preview-glyph {
  width: 40rpx;
  height: 40rpx;
}

.diary-prelude-picker__preview-headline {
  font-size: 32rpx;
  line-height: 1.16;
  letter-spacing: 0.18em;
  margin-bottom: 8rpx;
}

.diary-prelude-picker__preview-subline {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 15rpx;
  color: var(--noche-ink-faint);
  letter-spacing: 0.28em;
}

.diary-prelude-picker__preview-line {
  width: 72rpx;
  height: 1rpx;
  background: var(--noche-paper-line);
  margin: 14rpx 0 10rpx;
}

.diary-prelude-picker__preview-note {
  font-size: 17rpx;
  line-height: 1.45;
  color: var(--noche-ink-faint);
}

.diary-prelude-picker__section {
  margin-top: 16rpx;
}

.diary-prelude-picker__section-head {
  margin-bottom: 10rpx;
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.diary-prelude-picker__section-title {
  font-size: 22rpx;
  letter-spacing: 0.1em;
}

.diary-prelude-picker__section-subtitle {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 13rpx;
  color: var(--noche-ink-faint);
  letter-spacing: 0.24em;
}

.diary-prelude-picker__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rpx;
}

.diary-prelude-picker__grid--mood {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.diary-prelude-picker__option {
  position: relative;
  min-height: 94rpx;
  padding: 12rpx 12rpx;
  border-radius: 22rpx;
  background: var(--noche-surface-faint);
  border: 1rpx solid color-mix(in srgb, var(--noche-border) 55%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  text-align: center;
  color: var(--noche-ink-strong);
  transform: translateY(0) scale(1);
  box-shadow: 0 0 0 rgba(var(--noche-paper-shadow-rgb), 0);
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms ease,
    background-color 220ms ease,
    color 180ms ease;
}

.diary-prelude-picker__option:active {
  transform: translateY(1rpx) scale(0.985);
  box-shadow: 0 8rpx 18rpx rgba(var(--noche-paper-shadow-rgb), 0.12);
}

.diary-prelude-picker__option--active {
  background: var(--noche-surface-strong);
  border-color: color-mix(in srgb, var(--noche-accent) 42%, var(--noche-border));
  color: var(--noche-ink-strong);
  transform: translateY(-4rpx);
  box-shadow:
    0 14rpx 28rpx rgba(var(--noche-paper-shadow-rgb), 0.16),
    0 2rpx 0 rgba(var(--noche-shadow-rgb), 0.08) inset;
}

.diary-prelude-picker__option-glyph-wrap {
  width: 42rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: var(--noche-card-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--noche-ink-soft);
  transition:
    background-color 220ms ease,
    color 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-glyph-wrap {
  background: var(--noche-card-mark);
  color: var(--noche-ink-strong);
  transform: scale(1.05);
}

.diary-prelude-picker__option-mark {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: var(--noche-accent);
  box-shadow: 0 0 0 4rpx rgba(var(--noche-shadow-rgb), 0.14);
}

.diary-prelude-picker__option-glyph {
  width: 24rpx;
  height: 24rpx;
}

.diary-prelude-picker__option-zh {
  font-size: 20rpx;
  line-height: 1.2;
  transition: color 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-zh {
  color: var(--noche-ink-strong);
  transform: translateY(-1rpx);
}

.diary-prelude-picker__option-en {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 11rpx;
  color: var(--noche-ink-faint);
  letter-spacing: 0.22em;
  transition: color 180ms ease, letter-spacing 220ms ease;
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-en {
  color: var(--noche-ink-faint);
  letter-spacing: 0.24em;
}

.diary-prelude-picker__footer {
  margin-top: auto;
  padding-top: var(--noche-page-section-gap);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.diary-prelude-picker__confirm {
  min-height: 64rpx;
  border-radius: 999rpx;
  background: var(--noche-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1);
  box-shadow: 0 10rpx 18rpx rgba(var(--noche-paper-shadow-rgb), 0.18);
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.diary-prelude-picker__confirm:active {
  transform: scale(0.992);
  box-shadow: 0 6rpx 12rpx rgba(var(--noche-paper-shadow-rgb), 0.14);
}

.diary-prelude-picker__confirm--disabled {
  background: var(--noche-ink-ghost);
  box-shadow: none;
}

.diary-prelude-picker__confirm-label {
  color: var(--noche-accent-contrast);
  font-size: 20rpx;
  letter-spacing: 0.16em;
}

.diary-prelude-picker__hint {
  text-align: center;
  font-size: 16rpx;
  line-height: 1.35;
  color: var(--noche-ink-faint);
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
