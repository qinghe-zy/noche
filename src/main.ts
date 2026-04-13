import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { bootstrapAppRuntime } from "@/app/providers/bootstrapAppRuntime";

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();

  app.use(pinia);
  void bootstrapAppRuntime(pinia);

  return {
    app,
    pinia,
  };
}
