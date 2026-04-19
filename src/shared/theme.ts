import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { SettingsState } from "@/app/store/useSettingsStore";
import { THEME_TOKENS, type ResolvedColorScheme, type ResolvedThemeKey, type ThemeFamily, type ThemeMode } from "@/shared/themeRegistry";

export function resolveSystemTheme(): ResolvedColorScheme {
  if (typeof uni !== "undefined" && typeof uni.getSystemInfoSync === "function") {
    const systemTheme = (uni.getSystemInfoSync() as { theme?: string }).theme;
    if (systemTheme === "dark" || systemTheme === "light") {
      return systemTheme;
    }
  }

  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
}

export function resolveThemeMode(themeMode: ThemeMode, systemTheme = resolveSystemTheme()): ResolvedColorScheme {
  if (themeMode === "light" || themeMode === "dark") {
    return themeMode;
  }

  return systemTheme;
}

export function resolveThemeKey(
  themeFamily: ThemeFamily,
  themeMode: ThemeMode,
  systemTheme = resolveSystemTheme(),
): ResolvedThemeKey {
  const resolvedThemeMode = resolveThemeMode(themeMode, systemTheme);
  return `${themeFamily}-${resolvedThemeMode}` as ResolvedThemeKey;
}

export function getThemeTokens(themeKey: ResolvedThemeKey) {
  return THEME_TOKENS[themeKey];
}

export function resolveThemeClass(themeMode: ThemeMode): string {
  return resolveThemeMode(themeMode) === "dark" ? "theme-dark" : "theme-light";
}

export function resolveTypographyClass(preset: SettingsState["writingPreset"]): string {
  return `type-scale-${preset}`;
}

export function useThemeClass() {
  const settingsStore = useSettingsStore();

  return computed(() => resolveThemeClass(settingsStore.themeMode));
}

export function useResolvedThemeKey() {
  const settingsStore = useSettingsStore();

  return computed(() => resolveThemeKey(settingsStore.themeFamily, settingsStore.themeMode));
}

export function useTypographyClass() {
  const settingsStore = useSettingsStore();

  return computed(() => resolveTypographyClass(settingsStore.writingPreset));
}
