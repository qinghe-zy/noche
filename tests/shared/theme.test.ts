import { describe, expect, it } from "vitest";
import { getThemeTokens, resolveThemeKey } from "@/shared/theme";

describe("theme resolution", () => {
  it("resolves claude family with explicit dark mode", () => {
    expect(resolveThemeKey("claude", "dark", "light")).toBe("claude-dark");
  });

  it("uses system mode to derive the final key", () => {
    expect(resolveThemeKey("claude", "system", "dark")).toBe("claude-dark");
  });

  it("returns Claude token colors from the registry", () => {
    const tokens = getThemeTokens("claude-dark");

    expect(tokens["--app-bg"]).toBe("#141413");
    expect(tokens["--text-secondary"]).toBe("#b0aea5");
  });
});
