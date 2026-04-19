import { describe, expect, it } from "vitest";
import { getThemeTokens, resolveThemeClass, resolveThemeKey } from "@/shared/theme";

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

  it("keeps Claude light visibly warmer and more editorial than default light", () => {
    const tokens = getThemeTokens("claude-light");

    expect(tokens["--app-bg"]).toBe("#efe7d8");
    expect(tokens["--surface-primary"]).toBe("#fbf4e8");
    expect(tokens["--surface-secondary"]).toBe("#e3d5be");
    expect(tokens["--text-primary"]).toBe("#1b1713");
    expect(tokens["--text-secondary"]).toBe("#6b6154");
    expect(tokens["--border-subtle"]).toBe("#d7c8b1");
  });

  it("resolves theme classes with mode, family, and key so pages can distinguish default from claude", () => {
    expect(resolveThemeClass("default", "light", "light")).toBe("theme-light theme-family-default theme-key-default-light");
    expect(resolveThemeClass("claude", "system", "dark")).toBe("theme-dark theme-family-claude theme-key-claude-dark");
  });
});
