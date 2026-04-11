import { describe, expect, it } from "vitest";
import {
  buildDiaryPreludeMeta,
  hasDiaryPrelude,
  DIARY_MOOD_OPTIONS,
  DIARY_WEATHER_OPTIONS,
} from "@/domain/diaryPrelude/catalog";

describe("diary prelude catalog", () => {
  it("builds localized diary prelude metadata from weather and mood codes", () => {
    const prelude = buildDiaryPreludeMeta({
      weatherCode: "sunny",
      moodCode: "calm",
    });

    expect(prelude).toEqual({
      weatherCode: "sunny",
      weatherLabelZh: "晴朗",
      weatherLabelEn: "Sunny",
      moodCode: "calm",
      moodLabelZh: "平和",
      moodLabelEn: "Calm",
      note: "光线安静地落在纸页上。",
    });
  });

  it("treats missing weather and mood as no prelude", () => {
    expect(buildDiaryPreludeMeta({ weatherCode: null, moodCode: null })).toBeNull();
    expect(hasDiaryPrelude(null)).toBe(false);
  });

  it("keeps option catalogs local and diary-scoped", () => {
    expect(DIARY_WEATHER_OPTIONS.map((item) => item.code)).toContain("cloudy");
    expect(DIARY_MOOD_OPTIONS.map((item) => item.code)).toContain("anxious");
  });
});
