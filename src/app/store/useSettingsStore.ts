import { defineStore } from "pinia";

export interface SettingsState {
  theme: "system" | "light" | "dark";
  locale: string;
  weekStartsOn: 0 | 1;
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    theme: "system",
    locale: "zh-CN",
    weekStartsOn: 1,
  }),
  actions: {
    setTheme(theme: SettingsState["theme"]) {
      this.theme = theme;
    },
    setLocale(locale: string) {
      this.locale = locale;
    },
  },
});
