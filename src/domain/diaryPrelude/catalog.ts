import type { DiaryPreludeMeta, DiaryPreludeOption, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";

export const DIARY_WEATHER_OPTIONS: DiaryPreludeOption[] = [
  {
    code: "sunny",
    labelZh: "晴朗",
    labelEn: "Sunny",
  },
  {
    code: "cloudy",
    labelZh: "多云",
    labelEn: "Cloudy",
  },
  {
    code: "rainy",
    labelZh: "下雨",
    labelEn: "Rainy",
  },
  {
    code: "windy",
    labelZh: "有风",
    labelEn: "Windy",
  },
];

export const DIARY_MOOD_OPTIONS: DiaryPreludeOption[] = [
  {
    code: "calm",
    labelZh: "平和",
    labelEn: "Calm",
  },
  {
    code: "joyful",
    labelZh: "欢喜",
    labelEn: "Joyful",
  },
  {
    code: "anxious",
    labelZh: "焦虑",
    labelEn: "Anxious",
  },
  {
    code: "melancholy",
    labelZh: "低落",
    labelEn: "Melancholy",
  },
  {
    code: "relieved",
    labelZh: "释然",
    labelEn: "Relieved",
  },
];

const DIARY_PRELUDE_QUOTES: Record<string, string> = {
  "weather:sunny": "日光铺陈，万物皆有回响。",
  "weather:cloudy": "云遮半寸光，为心事留一道暗影。",
  "weather:rainy": "听雨滴敲响时间，打湿了光阴的边角。",
  "weather:windy": "风过窗前，翻动无字的流年。",
  "mood:calm": "岁月无声，心泊于恰好的宁静。",
  "mood:joyful": "心头抽出柔软的芽，触碰人间的暖。",
  "mood:anxious": "思绪在雾里打结，找不到靠岸的绳。",
  "mood:melancholy": "灵魂缓缓下沉，在沉默里小憩。",
  "mood:relieved": "掸落心上尘，与世间握手言和。",
  "sunny:calm": "溪水静淌，日光不语，万物在光影里各得其所。",
  "sunny:joyful": "烈日灼亮了心头的欢喜，连风也带有甜腻的香气。",
  "sunny:anxious": "晴空万里，心却无处安放，阳光刺眼得有些虚妄。",
  "sunny:melancholy": "阳光洒满一地，我却只看见阴影，独自在光明里享受悲伤。",
  "sunny:relieved": "心若开朗，满目皆是风景，阴霾散尽后日光重临。",
  "cloudy:calm": "浮云淡淡，心也静默，在灰白的间隙里寻找答案。",
  "cloudy:joyful": "云端亦有光，即使前路迷茫，心头仍有未熄的火种。",
  "cloudy:anxious": "云层压得极低，心也紧紧，焦虑如这云般找不到出口。",
  "cloudy:melancholy": "天空蒙上薄纱，心也成了灰色，沉溺在没有尽头的阴沉里。",
  "cloudy:relieved": "浮云散去，重见天日，接受了这不完美的完美。",
  "rainy:calm": "雨声如禅，心也清明，在滴答声中沉淀浮躁的灵魂。",
  "rainy:joyful": "借着这场雨，洗净心头的烦忧，让快乐在雨中肆意生长。",
  "rainy:anxious": "雨水洗不净心头的焦躁，雨声如鼓，一声声敲击着脆弱的神经。",
  "rainy:melancholy": "看着窗外的雨，思绪飘远，心也随之沉入没有底部的深渊。",
  "rainy:relieved": "心中雨已停，彩虹虽未现，但至少已经不再感到潮湿。",
  "windy:calm": "风也温柔，心也安静，任由这阵风吹乱思绪再轻抚平静。",
  "windy:joyful": "借着这阵风，将欢喜传向远方，让快乐也随风起舞。",
  "windy:anxious": "风声鹤唳，草木皆兵，焦虑如风般无孔不入吹得心烦意乱。",
  "windy:melancholy": "风吹不散心头的烦忧，看着落叶飘零，感叹命运的无常。",
  "windy:relieved": "风后晴空，心也开朗，借着这阵风，告别过去，拥抱未来。",
};

const DIARY_PRELUDE_STATUS_VALUES = ["unseen", "selected", "skipped"] as const;

type LegacyDiaryPreludeMeta = Partial<DiaryPreludeMeta> & {
  note?: string | null;
};

function findOption(
  options: DiaryPreludeOption[],
  code: string | null | undefined,
): DiaryPreludeOption | null {
  if (!code) {
    return null;
  }

  return options.find((item) => item.code === code) ?? null;
}

function sanitizeText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function buildDiaryPreludeQuoteKey(weatherCode: string, moodCode: string): string {
  return `${weatherCode}:${moodCode}`;
}

export function resolveDiaryPreludeQuote(
  weatherCode: string | null | undefined,
  moodCode: string | null | undefined,
): string | null {
  if (weatherCode && moodCode) {
    return DIARY_PRELUDE_QUOTES[buildDiaryPreludeQuoteKey(weatherCode, moodCode)] ?? null;
  }

  if (weatherCode) {
    return DIARY_PRELUDE_QUOTES[`weather:${weatherCode}`] ?? null;
  }

  if (moodCode) {
    return DIARY_PRELUDE_QUOTES[`mood:${moodCode}`] ?? null;
  }

  return null;
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
    quote: resolveDiaryPreludeQuote(weather?.code ?? null, mood?.code ?? null),
  };
}

export function hasDiaryPrelude(prelude: DiaryPreludeMeta | null | undefined): boolean {
  return Boolean(prelude?.weatherCode || prelude?.moodCode);
}

export function normalizeDiaryPrelude(
  prelude: DiaryPreludeMeta | LegacyDiaryPreludeMeta | null | undefined,
): DiaryPreludeMeta | null {
  if (!prelude || typeof prelude !== "object") {
    return null;
  }

  const weather = findOption(DIARY_WEATHER_OPTIONS, sanitizeText(prelude.weatherCode));
  const mood = findOption(DIARY_MOOD_OPTIONS, sanitizeText(prelude.moodCode));
  const legacyQuote = sanitizeText(prelude.quote) ?? sanitizeText((prelude as LegacyDiaryPreludeMeta).note);
  const mappedQuote = resolveDiaryPreludeQuote(weather?.code ?? null, mood?.code ?? null);

  if (!weather && !mood && !legacyQuote) {
    return null;
  }

  return {
    weatherCode: weather?.code ?? null,
    weatherLabelZh: sanitizeText(prelude.weatherLabelZh) ?? weather?.labelZh ?? null,
    weatherLabelEn: sanitizeText(prelude.weatherLabelEn) ?? weather?.labelEn ?? null,
    moodCode: mood?.code ?? null,
    moodLabelZh: sanitizeText(prelude.moodLabelZh) ?? mood?.labelZh ?? null,
    moodLabelEn: sanitizeText(prelude.moodLabelEn) ?? mood?.labelEn ?? null,
    quote: mappedQuote ?? legacyQuote ?? null,
  };
}

export function normalizeDiaryPreludeStatus(
  status: DiaryPreludeStatus | string | null | undefined,
  options: {
    isNewDiaryDraft?: boolean;
    prelude?: DiaryPreludeMeta | LegacyDiaryPreludeMeta | null;
  } = {},
): DiaryPreludeStatus {
  if ((DIARY_PRELUDE_STATUS_VALUES as readonly string[]).includes(status ?? "")) {
    return status as DiaryPreludeStatus;
  }

  if (hasDiaryPrelude(normalizeDiaryPrelude(options.prelude))) {
    return "selected";
  }

  return options.isNewDiaryDraft ? "unseen" : "skipped";
}

export function cloneDiaryPrelude(
  prelude: DiaryPreludeMeta | LegacyDiaryPreludeMeta | null | undefined,
): DiaryPreludeMeta | null {
  const normalizedPrelude = normalizeDiaryPrelude(prelude);

  return normalizedPrelude
    ? {
        ...normalizedPrelude,
      }
    : null;
}
