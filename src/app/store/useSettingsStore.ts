import { defineStore } from "pinia";
import { getPrefsRepository, setPrefsRepository } from "@/app/store/settingsRepository";

export interface SettingsState {
  theme: "system" | "light" | "dark";
  locale: string;
  weekStartsOn: 0 | 1;
}

interface SettingsStoreState extends SettingsState {
  isLoading: boolean;
  error: string | null;
}

const SETTINGS_DEFAULTS: SettingsState = {
  theme: "system",
  locale: "zh-CN",
  weekStartsOn: 1,
};

function isTheme(value: string | null): value is SettingsState["theme"] {
  return value === "system" || value === "light" || value === "dark";
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

export { setPrefsRepository };

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsStoreState => ({
    theme: "system",
    locale: "zh-CN",
    weekStartsOn: 1,
    isLoading: false,
    error: null,
  }),
  actions: {
    async hydrate(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const repository = getPrefsRepository();
        const [themeRecord, localeRecord, weekStartsOnRecord] = await Promise.all([
          repository.get("theme"),
          repository.get("locale"),
          repository.get("weekStartsOn"),
        ]);
        const persistedTheme = themeRecord?.value ?? null;

        this.theme = isTheme(persistedTheme)
          ? persistedTheme
          : SETTINGS_DEFAULTS.theme;
        this.locale = localeRecord?.value ?? SETTINGS_DEFAULTS.locale;
        this.weekStartsOn = toWeekStartsOn(weekStartsOnRecord?.value ?? null) ?? SETTINGS_DEFAULTS.weekStartsOn;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to hydrate settings.";
      } finally {
        this.isLoading = false;
      }
    },
    setTheme(theme: SettingsState["theme"]) {
      this.theme = theme;
      void this.persistPreference("theme", theme);
    },
    setLocale(locale: string) {
      this.locale = locale;
      void this.persistPreference("locale", locale);
    },
    setWeekStartsOn(weekStartsOn: 0 | 1) {
      this.weekStartsOn = weekStartsOn;
      void this.persistPreference("weekStartsOn", String(weekStartsOn));
    },
    async persistPreference(key: string, value: string): Promise<void> {
      try {
        await getPrefsRepository().set({ key, value });
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to persist settings.";
      }
    },
  },
});
