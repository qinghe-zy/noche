import { defineStore } from "pinia";
import { getPrefsRepository, setPrefsRepository } from "@/app/store/settingsRepository";
import type { ThemeFamily, ThemeMode } from "@/shared/themeRegistry";

export type HomeTitleMode = "random" | "custom";

export interface SettingsState {
  themeFamily: ThemeFamily;
  themeMode: ThemeMode;
  locale: string;
  weekStartsOn: 0 | 1;
  privacyLockEnabled: boolean;
  writingPreset: "small" | "medium" | "large";
  futureLetterPaperLinesEnabled: boolean;
  albumDisplayCount: 12 | 24 | 0;
  homeTitleMode: HomeTitleMode;
  homeCustomTitle: string;
}

interface SettingsStoreState extends SettingsState {
  isLoading: boolean;
  error: string | null;
}

const SETTINGS_DEFAULTS: SettingsState = {
  themeFamily: "default",
  themeMode: "system",
  locale: "zh-CN",
  weekStartsOn: 1,
  privacyLockEnabled: false,
  writingPreset: "medium",
  futureLetterPaperLinesEnabled: true,
  albumDisplayCount: 24,
  homeTitleMode: "random",
  homeCustomTitle: "",
};

function isThemeMode(value: string | null): value is SettingsState["themeMode"] {
  return value === "system" || value === "light" || value === "dark";
}

function isThemeFamily(value: string | null): value is SettingsState["themeFamily"] {
  return value === "default" || value === "claude";
}

function toWeekStartsOn(value: string | null): 0 | 1 | null {
  if (value === "0") {
    return 0;
  }

  if (value === "1") {
    return 1;
  }

  return null;
}

function toBooleanFlag(value: string | null): boolean | null {
  if (value === "1") {
    return true;
  }

  if (value === "0") {
    return false;
  }

  return null;
}

function isWritingPreset(value: string | null): value is SettingsState["writingPreset"] {
  return value === "small" || value === "medium" || value === "large";
}

function toAlbumDisplayCount(value: string | null): SettingsState["albumDisplayCount"] | null {
  if (value === "12") {
    return 12;
  }

  if (value === "24") {
    return 24;
  }

  if (value === "0") {
    return 0;
  }

  return null;
}

function isHomeTitleMode(value: string | null): value is HomeTitleMode {
  return value === "random" || value === "custom";
}

function normalizeHomeCustomTitle(value: string | null): string {
  return value?.trim() ?? "";
}

export { setPrefsRepository };

export const useSettingsStore = defineStore("settings", {
  getters: {
    theme: (state): SettingsState["themeMode"] => state.themeMode,
  },
  state: (): SettingsStoreState => ({
    themeFamily: "default",
    themeMode: "system",
    locale: "zh-CN",
    weekStartsOn: 1,
    privacyLockEnabled: false,
    writingPreset: "medium",
    futureLetterPaperLinesEnabled: true,
    albumDisplayCount: 24,
    homeTitleMode: "random",
    homeCustomTitle: "",
    isLoading: false,
    error: null,
  }),
  actions: {
    async hydrate(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const repository = getPrefsRepository();
        const [
          themeFamilyRecord,
          themeModeRecord,
          themeRecord,
          localeRecord,
          weekStartsOnRecord,
          privacyLockRecord,
          writingPresetRecord,
          futurePaperLinesRecord,
          albumDisplayCountRecord,
          homeTitleModeRecord,
          homeCustomTitleRecord,
          homeTitleRecord,
        ] = await Promise.all([
          repository.get("themeFamily"),
          repository.get("themeMode"),
          repository.get("theme"),
          repository.get("locale"),
          repository.get("weekStartsOn"),
          repository.get("privacyLockEnabled"),
          repository.get("writingPreset"),
          repository.get("futureLetterPaperLinesEnabled"),
          repository.get("albumDisplayCount"),
          repository.get("homeTitleMode"),
          repository.get("homeCustomTitle"),
          repository.get("homeTitle"),
        ]);
        const persistedThemeFamily = themeFamilyRecord?.value ?? null;
        const persistedThemeMode = themeModeRecord?.value ?? null;
        const persistedLegacyTheme = themeRecord?.value ?? null;
        const normalizedLegacyHomeTitle = normalizeHomeCustomTitle(homeTitleRecord?.value ?? null);
        const normalizedCustomHomeTitle = normalizeHomeCustomTitle(homeCustomTitleRecord?.value ?? null);

        this.themeFamily = isThemeFamily(persistedThemeFamily)
          ? persistedThemeFamily
          : SETTINGS_DEFAULTS.themeFamily;
        this.themeMode = isThemeMode(persistedThemeMode)
          ? persistedThemeMode
          : isThemeMode(persistedLegacyTheme)
            ? persistedLegacyTheme
            : SETTINGS_DEFAULTS.themeMode;
        this.locale = localeRecord?.value ?? SETTINGS_DEFAULTS.locale;
        this.weekStartsOn = toWeekStartsOn(weekStartsOnRecord?.value ?? null) ?? SETTINGS_DEFAULTS.weekStartsOn;
        this.privacyLockEnabled = toBooleanFlag(privacyLockRecord?.value ?? null) ?? SETTINGS_DEFAULTS.privacyLockEnabled;
        this.writingPreset = isWritingPreset(writingPresetRecord?.value ?? null)
          ? writingPresetRecord!.value as SettingsState["writingPreset"]
          : SETTINGS_DEFAULTS.writingPreset;
        this.futureLetterPaperLinesEnabled = toBooleanFlag(futurePaperLinesRecord?.value ?? null)
          ?? SETTINGS_DEFAULTS.futureLetterPaperLinesEnabled;
        this.albumDisplayCount = toAlbumDisplayCount(albumDisplayCountRecord?.value ?? null)
          ?? SETTINGS_DEFAULTS.albumDisplayCount;
        this.homeTitleMode = isHomeTitleMode(homeTitleModeRecord?.value ?? null)
          ? homeTitleModeRecord!.value as HomeTitleMode
          : normalizedLegacyHomeTitle
            ? "custom"
            : SETTINGS_DEFAULTS.homeTitleMode;
        this.homeCustomTitle = normalizedCustomHomeTitle || normalizedLegacyHomeTitle;
        if (this.homeTitleMode === "custom" && !this.homeCustomTitle) {
          this.homeTitleMode = SETTINGS_DEFAULTS.homeTitleMode;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to hydrate settings.";
      } finally {
        this.isLoading = false;
      }
    },
    setThemeFamily(themeFamily: SettingsState["themeFamily"]) {
      this.themeFamily = themeFamily;
      void this.persistPreference("themeFamily", themeFamily);
    },
    setThemeMode(themeMode: SettingsState["themeMode"]) {
      this.themeMode = themeMode;
      void this.persistPreference("themeMode", themeMode);
    },
    setTheme(theme: SettingsState["themeMode"]) {
      this.setThemeMode(theme);
    },
    setLocale(locale: string) {
      this.locale = locale;
      void this.persistPreference("locale", locale);
    },
    setWeekStartsOn(weekStartsOn: 0 | 1) {
      this.weekStartsOn = weekStartsOn;
      void this.persistPreference("weekStartsOn", String(weekStartsOn));
    },
    setPrivacyLockEnabled(enabled: boolean) {
      this.privacyLockEnabled = enabled;
      void this.persistPreference("privacyLockEnabled", enabled ? "1" : "0");
    },
    setWritingPreset(preset: SettingsState["writingPreset"]) {
      this.writingPreset = preset;
      void this.persistPreference("writingPreset", preset);
    },
    setFutureLetterPaperLinesEnabled(enabled: boolean) {
      this.futureLetterPaperLinesEnabled = enabled;
      void this.persistPreference("futureLetterPaperLinesEnabled", enabled ? "1" : "0");
    },
    setAlbumDisplayCount(count: SettingsState["albumDisplayCount"]) {
      this.albumDisplayCount = count;
      void this.persistPreference("albumDisplayCount", String(count));
    },
    setHomeTitleMode(mode: HomeTitleMode) {
      this.homeTitleMode = mode;
      void this.persistPreference("homeTitleMode", mode);

      if (mode === "random") {
        void this.persistLegacyHomeTitle("");
        return;
      }

      if (this.homeCustomTitle) {
        void this.persistLegacyHomeTitle(this.homeCustomTitle);
      }
    },
    setHomeCustomTitle(title: string) {
      const normalizedTitle = title.trim();

      this.homeCustomTitle = normalizedTitle;
      void this.persistPreference("homeCustomTitle", normalizedTitle);

      if (!normalizedTitle) {
        this.setHomeTitleMode("random");
        return;
      }

      if (this.homeTitleMode !== "custom") {
        this.homeTitleMode = "custom";
        void this.persistPreference("homeTitleMode", "custom");
      }

      void this.persistLegacyHomeTitle(normalizedTitle);
    },
    async persistPreference(key: string, value: string): Promise<void> {
      try {
        await getPrefsRepository().set({ key, value });
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to persist settings.";
      }
    },
    async persistLegacyHomeTitle(title: string): Promise<void> {
      await this.persistPreference("homeTitle", title);
    },
  },
});
