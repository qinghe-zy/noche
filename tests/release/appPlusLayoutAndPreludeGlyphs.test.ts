import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("app-plus layout and prelude glyph assets", () => {
  it("pushes mobile layout vars into app-plus page containers, not only documentElement", () => {
    const layoutFile = readProjectFile("src/shared/layout/mobileLayout.ts");

    expect(layoutFile).toContain("document.body");
    expect(layoutFile).toContain(".uni-page-body");
    expect(layoutFile).toContain(".uni-page-wrapper");
  });

  it("resolves diary prelude glyphs through bundled asset urls instead of runtime /static strings", () => {
    const glyph = readProjectFile("src/features/editor/components/DiaryPreludeGlyph.vue");

    expect(glyph).toContain("@error=\"handleImageError\"");
    expect(glyph).toContain("resolvePreludeGlyphFallbackSource");
    expect(glyph).toContain("resolvePreludeGlyphPrimarySource");
  });
});
