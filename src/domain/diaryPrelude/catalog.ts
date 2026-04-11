import type { DiaryPreludeMeta, DiaryPreludeOption } from "@/domain/diaryPrelude/types";

export const DIARY_WEATHER_OPTIONS: DiaryPreludeOption[] = [
  {
    code: "sunny",
    labelZh: "晴朗",
    labelEn: "Sunny",
    note: "光线安静地落在纸页上。",
  },
  {
    code: "cloudy",
    labelZh: "多云",
    labelEn: "Cloudy",
    note: "天色柔下来，心事也慢下来。",
  },
  {
    code: "rainy",
    labelZh: "下雨",
    labelEn: "Rainy",
    note: "雨声把今天包得更近了一点。",
  },
  {
    code: "windy",
    labelZh: "有风",
    labelEn: "Windy",
    note: "风从纸边掠过，留下轻轻的回声。",
  },
];

export const DIARY_MOOD_OPTIONS: DiaryPreludeOption[] = [
  {
    code: "calm",
    labelZh: "平和",
    labelEn: "Calm",
    note: "光线安静地落在纸页上。",
  },
  {
    code: "joyful",
    labelZh: "欢喜",
    labelEn: "Joyful",
    note: "心口有一点明亮，刚好够照见今天。",
  },
  {
    code: "anxious",
    labelZh: "焦虑",
    labelEn: "Anxious",
    note: "先把纷乱放在纸上，再慢慢安顿下来。",
  },
  {
    code: "melancholy",
    labelZh: "低落",
    labelEn: "Melancholy",
    note: "情绪像薄雾，落在字里行间。",
  },
  {
    code: "relieved",
    labelZh: "释然",
    labelEn: "Relieved",
    note: "有些重量终于肯从肩上离开。",
  },
];

function findOption(
  options: DiaryPreludeOption[],
  code: string | null | undefined,
): DiaryPreludeOption | null {
  if (!code) {
    return null;
  }

  return options.find((item) => item.code === code) ?? null;
}

export function buildDiaryPreludeMeta(input: {
  weatherCode?: string | null;
  moodCode?: string | null;
}): DiaryPreludeMeta | null {
  const weather = findOption(DIARY_WEATHER_OPTIONS, input.weatherCode);
  const mood = findOption(DIARY_MOOD_OPTIONS, input.moodCode);

  if (!weather && !mood) {
    return null;
  }

  return {
    weatherCode: weather?.code ?? null,
    weatherLabelZh: weather?.labelZh ?? null,
    weatherLabelEn: weather?.labelEn ?? null,
    moodCode: mood?.code ?? null,
    moodLabelZh: mood?.labelZh ?? null,
    moodLabelEn: mood?.labelEn ?? null,
    note: mood?.note ?? weather?.note ?? null,
  };
}

export function hasDiaryPrelude(prelude: DiaryPreludeMeta | null | undefined): boolean {
  return Boolean(prelude?.weatherCode || prelude?.moodCode);
}

export function cloneDiaryPrelude(
  prelude: DiaryPreludeMeta | null | undefined,
): DiaryPreludeMeta | null {
  return prelude
    ? {
        ...prelude,
      }
    : null;
}
