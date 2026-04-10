import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";
import { setPrefsRepository, useSettingsStore } from "@/app/store/useSettingsStore";

describe("settings store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setPrefsRepository(createMemoryPrefsRepository());
  });

  it("hydrates persisted settings and persists sync setter updates", async () => {
    const repository = createMemoryPrefsRepository([
      { key: "theme", value: "dark" },
      { key: "locale", value: "en-US" },
      { key: "weekStartsOn", value: "0" },
    ]);
    setPrefsRepository(repository);
    const store = useSettingsStore();

    await store.hydrate();

    expect(store.theme).toBe("dark");
    expect(store.locale).toBe("en-US");
    expect(store.weekStartsOn).toBe(0);

    store.setTheme("light");
    store.setLocale("ja-JP");
    store.setWeekStartsOn(1);

    await Promise.resolve();
    await Promise.resolve();

    expect(await repository.get("theme")).toEqual({ key: "theme", value: "light" });
    expect(await repository.get("locale")).toEqual({ key: "locale", value: "ja-JP" });
    expect(await repository.get("weekStartsOn")).toEqual({ key: "weekStartsOn", value: "1" });
  });
});
