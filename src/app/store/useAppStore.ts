import { defineStore } from "pinia";
import { ROUTES } from "@/shared/constants/routes";

export type AppBootStatus = "idle" | "ready";

interface AppState {
  bootStatus: AppBootStatus;
  currentRoute: string;
  isPrivacyLocked: boolean;
}

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    bootStatus: "idle",
    currentRoute: ROUTES.home,
    isPrivacyLocked: false,
  }),
  actions: {
    markReady() {
      this.bootStatus = "ready";
    },
    setCurrentRoute(route: string) {
      this.currentRoute = route;
    },
    lockPrivacy() {
      this.isPrivacyLocked = true;
    },
    unlockPrivacy() {
      this.isPrivacyLocked = false;
    },
  },
});
