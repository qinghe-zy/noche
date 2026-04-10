import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/app/store/useAppStore";

describe("app store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("locks and unlocks privacy overlay state", () => {
    const store = useAppStore();

    expect(store.isPrivacyLocked).toBe(false);

    store.lockPrivacy();
    expect(store.isPrivacyLocked).toBe(true);

    store.unlockPrivacy();
    expect(store.isPrivacyLocked).toBe(false);
  });
});
