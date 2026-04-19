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

  it("keeps Claude light visibly warmer and more editorial than default light", () => {
    const tokens = getThemeTokens("claude-light");

    expect(tokens["--app-bg"]).toBe("#efe7d8");
    expect(tokens["--surface-primary"]).toBe("#fbf4e8");
    expect(tokens["--surface-secondary"]).toBe("#e3d5be");
    expect(tokens["--text-primary"]).toBe("#1b1713");
    expect(tokens["--text-secondary"]).toBe("#6b6154");
    expect(tokens["--border-subtle"]).toBe("#d7c8b1");
  });
});
