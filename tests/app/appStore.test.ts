import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/app/store/useAppStore";

describe("app store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("locks and unlocks privacy overlay state", () => {
    const store = useAppStore();

    expect(store.isPrivacyLocked).toBe(false);

    store.lockPrivacy();
    expect(store.isPrivacyLocked).toBe(true);

    store.unlockPrivacy();
    expect(store.isPrivacyLocked).toBe(false);
  });

  it("starts locked when the stored settings already enable privacy lock", () => {
    vi.stubGlobal("uni", {
      getStorageSync(key: string) {
        if (key === "noche.preferences.v1") {
          return JSON.stringify({
            privacyLockEnabled: "1",
          });
        }

        return "";
      },
    });
    setActivePinia(createPinia());

    const store = useAppStore();

    expect(store.isPrivacyLocked).toBe(true);
  });
});
