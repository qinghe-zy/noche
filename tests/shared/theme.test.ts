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

    expect(tokens["--app-bg"]).toBe("#f5f4ed");
    expect(tokens["--surface-primary"]).toBe("#fbf4e8");
    expect(tokens["--surface-secondary"]).toBe("#e3d5be");
    expect(tokens["--text-primary"]).toBe("#1b1713");
    expect(tokens["--text-secondary"]).toBe("#6b6154");
    expect(tokens["--border-subtle"]).toBe("#d7c8b1");
  });

  it("keeps the default family on a sans-first stack so Claude typography does not leak into baseline screens", () => {
    const lightTokens = getThemeTokens("default-light");
    const darkTokens = getThemeTokens("default-dark");

    expect(lightTokens["--font-heading"]).toBe("\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif");
    expect(lightTokens["--font-body"]).toBe("\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif");
    expect(darkTokens["--font-heading"]).toBe("\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif");
    expect(darkTokens["--font-body"]).toBe("\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif");
  });

  it("defines dedicated Claude button tokens for pills, chips, FAB, and topbar actions", () => {
    const lightTokens = getThemeTokens("claude-light");
    const darkTokens = getThemeTokens("claude-dark");

    expect(lightTokens["--button-pill-bg"]).toBe("#e3d5be");
    expect(lightTokens["--button-chip-bg"]).toBe("#fffaf2");
    expect(lightTokens["--button-fab-bg"]).toBe("#1b1713");
    expect(lightTokens["--button-topbar-bg"]).toBe("#ffffff");
    expect(darkTokens["--button-pill-bg"]).toBe("#2a2520");
    expect(darkTokens["--button-chip-bg"]).toBe("#1e1a17");
    expect(darkTokens["--button-fab-bg"]).toBe("#d97757");
    expect(darkTokens["--button-topbar-bg"]).toBe("#2a2520");
  });

  it("defines Claude option-button tokens for diary prelude chips and active weather/mood states", () => {
    const lightTokens = getThemeTokens("claude-light");
    const darkTokens = getThemeTokens("claude-dark");

    expect(lightTokens["--button-option-bg"]).toBe("#faf9f5");
    expect(lightTokens["--button-option-active-bg"]).toBe("#c96442");
    expect(lightTokens["--button-option-active-text"]).toBe("#faf9f5");
    expect(darkTokens["--button-option-bg"]).toBe("#1e1a17");
    expect(darkTokens["--button-option-active-bg"]).toBe("#d97757");
    expect(darkTokens["--button-option-active-text"]).toBe("#141413");
  });

  it("resolves theme classes with mode, family, and key so pages can distinguish default from claude", () => {
    expect(resolveThemeClass("default", "light", "light")).toBe("theme-light theme-family-default theme-key-default-light");
    expect(resolveThemeClass("claude", "system", "dark")).toBe("theme-dark theme-family-claude theme-key-claude-dark");
  });
});
