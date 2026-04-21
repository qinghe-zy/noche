<template>
  <view class="diary-prelude-picker" :class="themeClass">
    <view class="diary-prelude-picker__grain"></view>

    <view class="diary-prelude-picker__topbar" :style="topbarStyle">
      <TopbarIconButton @tap="$emit('go-back')" />
      <view class="diary-prelude-picker__topbar-spacer"></view>
      <text v-if="canSkip" class="diary-prelude-picker__skip" @tap="handleSkip">{{ copy.editor.diaryPreludeSkip }}</text>
      <view v-else class="diary-prelude-picker__skip-spacer"></view>
    </view>

    <view class="diary-prelude-picker__hero">
      <text class="diary-prelude-picker__hero-title">{{ copy.editor.diaryPreludeTitle }}</text>
    </view>

    <view class="diary-prelude-picker__body">
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

      <view class="diary-prelude-picker__footer" :style="{ paddingBottom: `${safeAreaBottom + rpxToPx(32)}px` }">
        <view
          class="diary-prelude-picker__confirm"
          :class="{ 'diary-prelude-picker__confirm--disabled': !previewPrelude }"
          @tap="handleConfirm"
        >
          <text class="diary-prelude-picker__confirm-label">{{ confirmButtonCopy }}</text>
        </view>
        <text v-if="pickerHint" class="diary-prelude-picker__hint">{{ pickerHint }}</text>
      </view>
    </view>
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
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import { diaryPreludeButtonCopyMap } from "@/features/editor/constants/diaryPreludeButtonCopy";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { t } from "@/shared/i18n";
import { useThemeClass } from "@/shared/theme";
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
const themeClass = useThemeClass();
const { statusBarHeight, safeAreaBottom, rpxToPx } = useEditorKeyboardViewport();
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
const topbarStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
  paddingLeft: `${rpxToPx(32)}px`,
  paddingRight: `${rpxToPx(32)}px`,
}));
const confirmButtonCopy = computed(() => {
  if (weatherCode.value && moodCode.value) {
    return diaryPreludeButtonCopyMap.combo[`${weatherCode.value}|${moodCode.value}` as keyof typeof diaryPreludeButtonCopyMap.combo]
      ?? copy.value.editor.diaryPreludeConfirm;
  }

  if (weatherCode.value) {
    return diaryPreludeButtonCopyMap.weatherOnly[weatherCode.value as keyof typeof diaryPreludeButtonCopyMap.weatherOnly]
      ?? copy.value.editor.diaryPreludeConfirm;
  }

  if (moodCode.value) {
    return diaryPreludeButtonCopyMap.moodOnly[moodCode.value as keyof typeof diaryPreludeButtonCopyMap.moodOnly]
      ?? copy.value.editor.diaryPreludeConfirm;
  }

  return copy.value.editor.diaryPreludeConfirm;
});
const pickerHint = computed(() => (props.canSkip ? copy.value.editor.diaryPreludeHint : ""));

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
  --prelude-bg: #fbf9f5;
  --prelude-text: #31332e;
  --prelude-muted: rgba(99, 95, 85, 0.76);
  --prelude-soft: rgba(138, 129, 120, 0.72);
  --prelude-line: rgba(177, 179, 171, 0.16);
  --prelude-line-strong: rgba(177, 179, 171, 0.28);
  --prelude-surface: rgba(255, 255, 255, 0.88);
  --prelude-panel: rgba(255, 255, 255, 0.68);
  --prelude-panel-strong: rgba(255, 255, 255, 0.96);
  --prelude-topbar: rgba(251, 249, 245, 0.96);
  --prelude-glyph: rgba(245, 244, 238, 0.92);
  --prelude-mark: rgba(138, 129, 120, 0.82);
  --prelude-confirm: rgba(95, 94, 94, 0.92);
  --prelude-confirm-disabled: rgba(177, 179, 171, 0.56);
  --prelude-confirm-text: #faf7f6;
  --prelude-shadow: rgba(49, 51, 46, 0.1);
  min-height: 100vh;
  background: var(--prelude-bg);
  color: var(--prelude-text);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.theme-dark.diary-prelude-picker {
  --prelude-bg: var(--noche-shell-bg);
  --prelude-text: var(--noche-shell-text);
  --prelude-muted: var(--noche-shell-muted);
  --prelude-soft: var(--noche-shell-soft);
  --prelude-line: var(--noche-shell-line);
  --prelude-line-strong: var(--noche-shell-line-strong);
  --prelude-surface: rgba(18, 15, 10, 0.94);
  --prelude-panel: rgba(23, 19, 12, 0.88);
  --prelude-panel-strong: rgba(28, 23, 15, 0.96);
  --prelude-topbar: rgba(12, 10, 8, 0.96);
  --prelude-glyph: rgba(234, 226, 206, 0.1);
  --prelude-mark: var(--noche-shell-accent);
  --prelude-confirm: rgba(118, 37, 30, 0.92);
  --prelude-confirm-disabled: rgba(61, 53, 40, 0.82);
  --prelude-confirm-text: var(--noche-shell-text);
  --prelude-shadow: rgba(0, 0, 0, 0.26);
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
  z-index: 10;
  display: grid;
  grid-template-columns: 88rpx 1fr auto;
  align-items: center;
  gap: 20rpx;
  padding-bottom: 12rpx;
  background: var(--prelude-topbar);
  backdrop-filter: blur(12rpx);
}

.diary-prelude-picker__topbar-spacer {
  width: 88rpx;
  height: 88rpx;
}

.diary-prelude-picker__hero {
  padding: 14rpx 32rpx 16rpx;
  text-align: center;
}

.diary-prelude-picker__hero-title {
  text-align: center;
  font-size: 24rpx;
  line-height: 1.5;
  color: var(--prelude-muted);
  letter-spacing: 0.1em;
}

.diary-prelude-picker__skip {
  min-width: 72rpx;
  text-align: right;
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 22rpx;
  color: var(--prelude-soft);
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
  flex: 1;
  min-height: 0;
  padding: 0 32rpx 0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.diary-prelude-picker__preview-card {
  padding: 24rpx 24rpx 20rpx;
  border-radius: 30rpx;
  background: var(--prelude-surface);
  border: 1rpx solid var(--prelude-line);
  box-shadow: 0 18rpx 38rpx var(--prelude-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.diary-prelude-picker__preview-glyph-wrap {
  width: 76rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: var(--prelude-glyph);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--prelude-text);
  margin-bottom: 10rpx;
}

.diary-prelude-picker__preview-glyph {
  width: 40rpx;
  height: 40rpx;
}

.diary-prelude-picker__preview-headline {
  font-size: 36rpx;
  line-height: 1.16;
  letter-spacing: 0.18em;
  margin-bottom: 6rpx;
}

.diary-prelude-picker__preview-subline {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 15rpx;
  color: var(--prelude-soft);
  letter-spacing: 0.28em;
}

.diary-prelude-picker__preview-line {
  width: 72rpx;
  height: 1rpx;
  background: var(--prelude-line-strong);
  margin: 12rpx 0 8rpx;
}

.diary-prelude-picker__preview-note {
  font-size: 18rpx;
  line-height: 1.45;
  color: var(--prelude-muted);
}

.diary-prelude-picker__section {
  margin-top: 0;
}

.diary-prelude-picker__section-head {
  margin-bottom: 8rpx;
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
  color: var(--prelude-soft);
  letter-spacing: 0.24em;
}

.diary-prelude-picker__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8rpx;
}

.diary-prelude-picker__grid--mood {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.diary-prelude-picker__option {
  position: relative;
  min-height: 116rpx;
  padding: 16rpx 14rpx;
  border-radius: 22rpx;
  background: var(--prelude-panel);
  border: 1rpx solid var(--prelude-line);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  text-align: center;
  color: var(--prelude-text);
  transform: translateY(0) scale(1);
  box-shadow: 0 0 0 var(--prelude-shadow);
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms ease,
    background-color 220ms ease,
    color 180ms ease;
}

.diary-prelude-picker__option:active {
  transform: translateY(1rpx) scale(0.985);
  box-shadow: 0 8rpx 18rpx var(--prelude-shadow);
}

.diary-prelude-picker__option--active {
  background: var(--prelude-panel-strong);
  border-color: var(--prelude-mark);
  color: var(--prelude-text);
  transform: translateY(-4rpx);
  box-shadow:
    0 14rpx 28rpx var(--prelude-shadow),
    0 2rpx 0 rgba(255, 255, 255, 0.08) inset;
}

.diary-prelude-picker__option-glyph-wrap {
  width: 42rpx;
  height: 42rpx;
  border-radius: 999rpx;
  background: var(--prelude-glyph);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--prelude-muted);
  transition:
    background-color 220ms ease,
    color 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-glyph-wrap {
  background: rgba(88, 68, 37, 0.38);
  color: var(--prelude-text);
  transform: scale(1.05);
}

.diary-prelude-picker__option-mark {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: var(--prelude-mark);
  box-shadow: 0 0 0 4rpx rgba(184, 136, 58, 0.18);
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
  color: var(--prelude-text);
  transform: translateY(-1rpx);
}

.diary-prelude-picker__option-en {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 11rpx;
  color: var(--prelude-soft);
  letter-spacing: 0.22em;
  transition: color 180ms ease, letter-spacing 220ms ease;
}

.diary-prelude-picker__option--active .diary-prelude-picker__option-en {
  color: var(--prelude-muted);
  letter-spacing: 0.24em;
}

.diary-prelude-picker__footer {
  margin-top: auto;
  padding-top: 14rpx;
  padding-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.diary-prelude-picker__confirm {
  min-height: 88rpx;
  border-radius: 999rpx;
  background: var(--prelude-confirm);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1);
  box-shadow: 0 10rpx 18rpx var(--prelude-shadow);
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.diary-prelude-picker__confirm:active {
  transform: scale(0.992);
  box-shadow: 0 6rpx 12rpx var(--prelude-shadow);
}

.diary-prelude-picker__confirm--disabled {
  background: var(--prelude-confirm-disabled);
  box-shadow: none;
}

.diary-prelude-picker__confirm-label {
  color: var(--prelude-confirm-text);
  font-size: 22rpx;
  letter-spacing: 0.12em;
}

.diary-prelude-picker__hint {
  text-align: center;
  font-size: 16rpx;
  line-height: 1.35;
  color: var(--prelude-soft);
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
