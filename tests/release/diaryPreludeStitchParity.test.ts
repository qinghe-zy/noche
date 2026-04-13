import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("diary prelude stitch parity", () => {
  it("keeps the picker and inline card local-first instead of depending on stitch export assets", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");
    const headerMeta = readProjectFile("src/features/editor/components/DiaryPreludeHeaderMeta.vue");

    expect(picker).toContain("DiaryPreludeGlyph");
    expect(picker).not.toContain("fonts.googleapis.com");
    expect(picker).not.toContain("cdn.tailwindcss.com");
    expect(picker).not.toContain("Material Symbols");
    expect(picker).not.toContain("https://");
    expect(headerMeta).not.toContain("fonts.googleapis.com");
    expect(headerMeta).not.toContain("cdn.tailwindcss.com");
    expect(headerMeta).not.toContain("https://");
  });

  it("avoids duplicate tap and click bindings on picker toggles in H5", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");
    const headerMeta = readProjectFile("src/features/editor/components/DiaryPreludeHeaderMeta.vue");

    expect(picker).not.toContain('@tap="toggleWeather(option.code)"\n            @click="toggleWeather(option.code)"');
    expect(picker).not.toContain('@tap="toggleMood(option.code)"\n            @click="toggleMood(option.code)"');
    expect(picker).not.toContain('@tap="handleConfirm"\n          @click="handleConfirm"');
    expect(headerMeta).not.toContain('@tap="handleEdit"\n    @click="handleEdit"');
  });

  it("strengthens selected-state contrast and keeps click motion accessible", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");

    expect(picker).toContain(".diary-prelude-picker__option--active");
    expect(picker).toContain("box-shadow:");
    expect(picker).toContain("transform:");
    expect(picker).toContain(".diary-prelude-picker__option:active");
    expect(picker).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("keeps the picker compact enough to fit the main content on one screen", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");

    expect(picker).toContain("paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`");
    expect(picker).toContain("height: 100vh;");
    expect(picker).toContain("min-height: 124rpx;");
    expect(picker).toContain("min-height: 88rpx;");
  });

  it("uses the static diary prelude button copy map instead of generated button text", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");
    const copyMap = readProjectFile("src/features/editor/constants/diaryPreludeButtonCopy.ts");

    expect(picker).toContain("diaryPreludeButtonCopyMap");
    expect(copyMap).toContain("\"sunny|calm\": \"展卷，沐浴此刻的暖阳\"");
    expect(copyMap).toContain("weatherOnly");
    expect(copyMap).toContain("moodOnly");
  });

  it("uses the same image-based glyph delivery path as the packaged app icons", () => {
    const glyph = readProjectFile("src/features/editor/components/DiaryPreludeGlyph.vue");

    expect(glyph).toContain("<image");
    expect(glyph).toContain("data:image/svg+xml;utf8,");
    expect(glyph).not.toContain("<template>\n  <svg");
  });
});
