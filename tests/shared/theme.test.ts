import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveThemeMode } from "@/shared/theme";

describe("theme runtime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the native system theme when follow-system is enabled in uni runtime", () => {
    vi.stubGlobal("uni", {
      getSystemInfoSync: () => ({
        theme: "dark",
      }),
    });

    expect(resolveThemeMode("system")).toBe("dark");
  });

  it("keeps explicit light and dark selections stable", () => {
    expect(resolveThemeMode("light")).toBe("light");
    expect(resolveThemeMode("dark")).toBe("dark");
  });
});
