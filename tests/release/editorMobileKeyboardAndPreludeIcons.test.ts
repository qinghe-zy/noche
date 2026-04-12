import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor mobile keyboard and prelude icons", () => {
  it("sets app-plus editor pages to resize the webview instead of panning the whole page", () => {
    const pagesJson = readProjectFile("src/pages.json");

    expect(pagesJson).toContain("\"path\": \"features/editor/pages/EditorPage\"");
    expect(pagesJson).toContain("\"softinputMode\": \"adjustResize\"");
  });

  it("keeps diary prelude glyphs on image tags but resolves them from embedded svg data uris", () => {
    const glyph = readProjectFile("src/features/editor/components/DiaryPreludeGlyph.vue");
    const sourceUtil = readProjectFile("src/features/editor/preludeGlyphSource.ts");

    expect(glyph).toContain("<image");
    expect(glyph).toContain("handleImageError");
    expect(glyph).toContain("resolvePreludeGlyphPrimarySource");
    expect(glyph).toContain("resolvePreludeGlyphFallbackSource");
    expect(sourceUtil).toContain("data:image/svg+xml;utf8,");
    expect(sourceUtil).not.toContain("/static/prelude-glyphs");
    expect(glyph).not.toContain("<svg");
  });
});
