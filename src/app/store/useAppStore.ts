import { defineStore } from "pinia";
import { ROUTES } from "@/shared/constants/routes";

export type AppBootStatus = "idle" | "ready";

interface AppState {
  bootStatus: AppBootStatus;
  currentRoute: string;
}

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    bootStatus: "idle",
    currentRoute: ROUTES.home,
  }),
  actions: {
    markReady() {
      this.bootStatus = "ready";
    },
    setCurrentRoute(route: string) {
      this.currentRoute = route;
    },
  },
});
