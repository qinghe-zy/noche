import { describe, expect, it } from "vitest";
import {
  buildDiaryPreludeMeta,
  hasDiaryPrelude,
  DIARY_MOOD_OPTIONS,
  DIARY_WEATHER_OPTIONS,
  normalizeDiaryPreludeStatus,
} from "@/domain/diaryPrelude/catalog";

describe("diary prelude catalog", () => {
  it("builds localized diary prelude metadata from weather and mood codes with a persisted quote", () => {
    const prelude = buildDiaryPreludeMeta({
      weatherCode: "cloudy",
      moodCode: "anxious",
    });

    expect(prelude).toEqual({
      weatherCode: "cloudy",
      weatherLabelZh: "多云",
      weatherLabelEn: "Cloudy",
      moodCode: "anxious",
      moodLabelZh: "焦虑",
      moodLabelEn: "Anxious",
      quote: "云层压得极低，心也紧紧，焦虑如这云般找不到出口。",
    });
  });

  it("builds weather-only and mood-only quotes when only one side is selected", () => {
    expect(
      buildDiaryPreludeMeta({
        weatherCode: "sunny",
        moodCode: null,
      }),
    ).toEqual({
      weatherCode: "sunny",
      weatherLabelZh: "晴朗",
      weatherLabelEn: "Sunny",
      moodCode: null,
      moodLabelZh: null,
      moodLabelEn: null,
      quote: "日光铺陈，万物皆有回响。",
    });

    expect(
      buildDiaryPreludeMeta({
        weatherCode: null,
        moodCode: "anxious",
      }),
    ).toEqual({
      weatherCode: null,
      weatherLabelZh: null,
      weatherLabelEn: null,
      moodCode: "anxious",
      moodLabelZh: "焦虑",
      moodLabelEn: "Anxious",
      quote: "思绪在雾里打结，找不到靠岸的绳。",
    });
  });

  it("treats missing weather and mood as no prelude", () => {
    expect(buildDiaryPreludeMeta({ weatherCode: null, moodCode: null })).toBeNull();
    expect(hasDiaryPrelude(null)).toBe(false);
  });

  it("normalizes diary prelude status for new and legacy diary data", () => {
    expect(normalizeDiaryPreludeStatus(undefined, { isNewDiaryDraft: true, prelude: null })).toBe("unseen");
    expect(normalizeDiaryPreludeStatus(undefined, { isNewDiaryDraft: false, prelude: null })).toBe("skipped");
    expect(
      normalizeDiaryPreludeStatus(undefined, {
        isNewDiaryDraft: false,
        prelude: buildDiaryPreludeMeta({
          weatherCode: "sunny",
          moodCode: "joyful",
        }),
      }),
    ).toBe("selected");
  });

  it("keeps option catalogs local and diary-scoped", () => {
    expect(DIARY_WEATHER_OPTIONS.map((item) => item.code)).toContain("cloudy");
    expect(DIARY_MOOD_OPTIONS.map((item) => item.code)).toContain("anxious");
  });
});
