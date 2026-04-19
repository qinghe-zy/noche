export type ThemeFamily = "default" | "claude";
export type ThemeMode = "system" | "light" | "dark";
export type ResolvedColorScheme = "light" | "dark";
export type ResolvedThemeKey = "default-light" | "default-dark" | "claude-light" | "claude-dark";

export type ThemeTokens = Record<string, string>;

export const THEME_TOKENS: Record<ResolvedThemeKey, ThemeTokens> = {
  "default-light": {
    "--app-bg": "#fbf9f5",
    "--surface-primary": "rgba(252, 248, 241, 0.98)",
    "--surface-secondary": "#ffffff",
    "--text-primary": "#31332e",
    "--text-secondary": "rgba(99, 95, 85, 0.8)",
    "--border-subtle": "rgba(221, 212, 200, 0.72)",
    "--accent-brand": "#7f6b5a",
    "--shadow-ring": "0 0 0 1px rgba(221, 212, 200, 0.72)",
    "--font-heading": "\"Noto Serif SC\", \"Source Han Serif SC\", serif",
    "--font-body": "\"PingFang SC\", \"Noto Sans SC\", sans-serif",
  },
  "default-dark": {
    "--app-bg": "#171716",
    "--surface-primary": "rgba(30, 30, 29, 0.98)",
    "--surface-secondary": "#222220",
    "--text-primary": "#f1ede6",
    "--text-secondary": "rgba(224, 218, 208, 0.72)",
    "--border-subtle": "rgba(117, 110, 101, 0.48)",
    "--accent-brand": "#c8b39c",
    "--shadow-ring": "0 0 0 1px rgba(117, 110, 101, 0.48)",
    "--font-heading": "\"Noto Serif SC\", \"Source Han Serif SC\", serif",
    "--font-body": "\"PingFang SC\", \"Noto Sans SC\", sans-serif",
  },
  "claude-light": {
    "--app-bg": "#efe7d8",
    "--surface-primary": "#fbf4e8",
    "--surface-secondary": "#e3d5be",
    "--text-primary": "#1b1713",
    "--text-secondary": "#6b6154",
    "--border-subtle": "#d7c8b1",
    "--accent-brand": "#c96442",
    "--accent-brand-soft": "#de8564",
    "--shadow-ring": "0 0 0 1px rgba(165, 133, 102, 0.28)",
    "--font-heading": "\"Source Han Serif SC\", \"Noto Serif SC\", \"Songti SC\", serif",
    "--font-body": "\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", sans-serif",
  },
  "claude-dark": {
    "--app-bg": "#141413",
    "--surface-primary": "#30302e",
    "--surface-secondary": "#1d1d1b",
    "--text-primary": "#faf9f5",
    "--text-secondary": "#b0aea5",
    "--border-subtle": "#30302e",
    "--accent-brand": "#c96442",
    "--accent-brand-soft": "#d97757",
    "--shadow-ring": "0 0 0 1px rgba(176, 174, 165, 0.18)",
    "--font-heading": "\"Source Han Serif SC\", \"Noto Serif SC\", \"Songti SC\", serif",
    "--font-body": "\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", sans-serif",
  },
};
