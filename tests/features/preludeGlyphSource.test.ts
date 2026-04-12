import { describe, expect, it } from "vitest";
import {
  resolvePreludeGlyphFallbackSource,
  resolvePreludeGlyphPrimarySource,
} from "@/features/editor/preludeGlyphSource";

describe("prelude glyph source", () => {
  it("returns an embedded svg data uri for the primary source", () => {
    const source = resolvePreludeGlyphPrimarySource("weather", "sunny");

    expect(source.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(decodeURIComponent(source)).toContain("circle cx='12' cy='12' r='4.2'");
  });

  it("returns a data-uri fallback for the same glyph", () => {
    const fallback = resolvePreludeGlyphFallbackSource("mood", "anxious");

    expect(fallback.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(decodeURIComponent(fallback)).toContain("17.5 7.4");
  });
});
