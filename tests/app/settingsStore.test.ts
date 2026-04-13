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
      { key: "privacyLockEnabled", value: "1" },
      { key: "writingPreset", value: "large" },
      { key: "futureLetterPaperLinesEnabled", value: "0" },
      { key: "albumDisplayCount", value: "24" },
      { key: "homeTitleMode", value: "custom" },
      { key: "homeCustomTitle", value: "今日有信" },
    ]);
    setPrefsRepository(repository);
    const store = useSettingsStore();

    await store.hydrate();

    expect(store.theme).toBe("dark");
    expect(store.locale).toBe("en-US");
    expect(store.weekStartsOn).toBe(0);
    expect(store.privacyLockEnabled).toBe(true);
    expect(store.writingPreset).toBe("large");
    expect(store.futureLetterPaperLinesEnabled).toBe(false);
    expect(store.albumDisplayCount).toBe(24);
    expect(store.homeTitleMode).toBe("custom");
    expect(store.homeCustomTitle).toBe("今日有信");

    store.setTheme("light");
    store.setLocale("ja-JP");
    store.setWeekStartsOn(1);
    store.setPrivacyLockEnabled(false);
    store.setWritingPreset("small");
    store.setFutureLetterPaperLinesEnabled(true);
    store.setAlbumDisplayCount(12);
    store.setHomeTitleMode("custom");
    store.setHomeCustomTitle("缓缓落笔");

    await Promise.resolve();
    await Promise.resolve();

    expect(await repository.get("theme")).toEqual({ key: "theme", value: "light" });
    expect(await repository.get("locale")).toEqual({ key: "locale", value: "ja-JP" });
    expect(await repository.get("weekStartsOn")).toEqual({ key: "weekStartsOn", value: "1" });
    expect(await repository.get("privacyLockEnabled")).toEqual({ key: "privacyLockEnabled", value: "0" });
    expect(await repository.get("writingPreset")).toEqual({ key: "writingPreset", value: "small" });
    expect(await repository.get("futureLetterPaperLinesEnabled")).toEqual({ key: "futureLetterPaperLinesEnabled", value: "1" });
    expect(await repository.get("albumDisplayCount")).toEqual({ key: "albumDisplayCount", value: "12" });
    expect(await repository.get("homeTitleMode")).toEqual({ key: "homeTitleMode", value: "custom" });
    expect(await repository.get("homeCustomTitle")).toEqual({ key: "homeCustomTitle", value: "缓缓落笔" });
    expect(await repository.get("homeTitle")).toEqual({ key: "homeTitle", value: "缓缓落笔" });
  });

  it("migrates the legacy single home title value into custom mode when new settings are absent", async () => {
    const repository = createMemoryPrefsRepository([
      { key: "homeTitle", value: "纸上光阴" },
    ]);
    setPrefsRepository(repository);
    const store = useSettingsStore();

    await store.hydrate();

    expect(store.homeTitleMode).toBe("custom");
    expect(store.homeCustomTitle).toBe("纸上光阴");
  });

  it("clears the legacy title mirror when switching back to random mode", async () => {
    const repository = createMemoryPrefsRepository([
      { key: "homeTitleMode", value: "custom" },
      { key: "homeCustomTitle", value: "缓缓落笔" },
      { key: "homeTitle", value: "缓缓落笔" },
    ]);
    setPrefsRepository(repository);
    const store = useSettingsStore();

    await store.hydrate();
    store.setHomeTitleMode("random");

    await Promise.resolve();
    await Promise.resolve();

    expect(await repository.get("homeTitleMode")).toEqual({ key: "homeTitleMode", value: "random" });
    expect(await repository.get("homeTitle")).toEqual({ key: "homeTitle", value: "" });
  });
});
