export const HOME_WELCOME_CARD_SOLAR_TERMS = [
  "小寒",
  "大寒",
  "立春",
  "雨水",
  "惊蛰",
  "春分",
  "清明",
  "谷雨",
  "立夏",
  "小满",
  "芒种",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "处暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
  "冬至",
] as const;

export type HomeWelcomeCardSolarTerm = typeof HOME_WELCOME_CARD_SOLAR_TERMS[number];

interface SolarTermRule {
  centuryValue: number;
  month: number;
  januaryOrFebruaryAdjustedLeap?: boolean;
  plusOneYears?: number[];
  minusOneYears?: number[];
}

const SOLAR_TERM_RULES: Record<HomeWelcomeCardSolarTerm, SolarTermRule> = {
  小寒: { centuryValue: 5.4055, month: 1, januaryOrFebruaryAdjustedLeap: true, plusOneYears: [1982], minusOneYears: [2019] },
  大寒: { centuryValue: 20.12, month: 1, januaryOrFebruaryAdjustedLeap: true, plusOneYears: [2000, 2082] },
  立春: { centuryValue: 3.87, month: 2, januaryOrFebruaryAdjustedLeap: true },
  雨水: { centuryValue: 18.73, month: 2, januaryOrFebruaryAdjustedLeap: true, minusOneYears: [2026] },
  惊蛰: { centuryValue: 5.63, month: 3 },
  春分: { centuryValue: 20.646, month: 3, plusOneYears: [2084] },
  清明: { centuryValue: 4.81, month: 4 },
  谷雨: { centuryValue: 20.1, month: 4 },
  立夏: { centuryValue: 5.52, month: 5 },
  小满: { centuryValue: 21.04, month: 5, plusOneYears: [2008] },
  芒种: { centuryValue: 5.678, month: 6 },
  夏至: { centuryValue: 21.37, month: 6 },
  小暑: { centuryValue: 7.108, month: 7, plusOneYears: [2016] },
  大暑: { centuryValue: 22.83, month: 7 },
  立秋: { centuryValue: 7.5, month: 8, plusOneYears: [2002] },
  处暑: { centuryValue: 23.13, month: 8 },
  白露: { centuryValue: 7.646, month: 9 },
  秋分: { centuryValue: 23.042, month: 9 },
  寒露: { centuryValue: 8.318, month: 10 },
  霜降: { centuryValue: 23.438, month: 10, plusOneYears: [2089] },
  立冬: { centuryValue: 7.438, month: 11, plusOneYears: [2089] },
  小雪: { centuryValue: 22.36, month: 11 },
  大雪: { centuryValue: 7.18, month: 12 },
  冬至: { centuryValue: 21.94, month: 12, minusOneYears: [2021] },
};

function resolveSolarTermDay(year: number, solarTerm: HomeWelcomeCardSolarTerm): number {
  const rule = SOLAR_TERM_RULES[solarTerm];
  const yearOfCentury = year % 100;
  const leapBase = rule.januaryOrFebruaryAdjustedLeap ? yearOfCentury - 1 : yearOfCentury;
  let day = Math.floor(yearOfCentury * 0.2422 + rule.centuryValue) - Math.floor(leapBase / 4);

  if (rule.plusOneYears?.includes(year)) {
    day += 1;
  }

  if (rule.minusOneYears?.includes(year)) {
    day -= 1;
  }

  return day;
}

export function extractSolarTermsFromContent(content: string): HomeWelcomeCardSolarTerm[] {
  return HOME_WELCOME_CARD_SOLAR_TERMS.filter((solarTerm) => content.includes(solarTerm));
}

export function resolveSolarTermDateKey(year: number, solarTerm: HomeWelcomeCardSolarTerm): string {
  const rule = SOLAR_TERM_RULES[solarTerm];
  const day = resolveSolarTermDay(year, solarTerm);

  return `${year}-${String(rule.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isDateKeyOnSolarTerm(dateKey: string, solarTerm: HomeWelcomeCardSolarTerm): boolean {
  const year = Number(dateKey.slice(0, 4));

  if (!Number.isInteger(year) || year < 2000 || year > 2099) {
    return false;
  }

  return resolveSolarTermDateKey(year, solarTerm) === dateKey;
}
