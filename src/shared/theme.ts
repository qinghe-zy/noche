import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import type { SettingsState } from "@/app/store/useSettingsStore";

export type AppThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export function resolveThemeMode(theme: AppThemeMode): ResolvedTheme {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

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

export function resolveThemeClass(theme: AppThemeMode): string {
  return resolveThemeMode(theme) === "dark" ? "theme-dark" : "theme-light";
}

export function resolveTypographyClass(preset: SettingsState["writingPreset"]): string {
  return `type-scale-${preset}`;
}

export function useThemeClass() {
  const settingsStore = useSettingsStore();

  return computed(() => resolveThemeClass(settingsStore.theme));
}

export function useTypographyClass() {
  const settingsStore = useSettingsStore();

  return computed(() => resolveTypographyClass(settingsStore.writingPreset));
}
