import type { HomeTitleMode } from "@/app/store/useSettingsStore";

export const HOME_RANDOM_TITLES = [
  "纸短情长",
  "落笔生温",
  "纸上光阴",
  "岁月留白",
  "此时此地",
  "静候日常",
  "今日与回声",
  "寄远",
  "岁月纪实",
  "尺素",
  "屿白",
  "留白",
] as const;

export const HOME_HIDDEN_TITLE = "【.屿】";

export interface ResolveHomeHeroTitleOptions {
  dateKey: string;
  locale: string;
  fallbackTitle: string;
  titleMode: HomeTitleMode;
  customTitle: string;
}

export function resolveRandomHomeTitle(dateKey: string, locale: string, fallbackTitle: string): string {
  if (locale !== "zh-CN") {
    return fallbackTitle;
  }

  if (Math.random() < 0.05) {
    return HOME_HIDDEN_TITLE;
  }

  const title = HOME_RANDOM_TITLES[Math.floor(Math.random() * HOME_RANDOM_TITLES.length)];
  return title ?? fallbackTitle;
}

export function resolveHomeHeroTitle({
  dateKey,
  locale,
  fallbackTitle,
  titleMode,
  customTitle,
}: ResolveHomeHeroTitleOptions): string {
  const normalizedCustomTitle = customTitle.trim();

  if (titleMode === "custom" && normalizedCustomTitle) {
    return normalizedCustomTitle;
  }

  return resolveRandomHomeTitle(dateKey, locale, fallbackTitle);
}
