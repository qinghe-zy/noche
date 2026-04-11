import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("diary prelude stitch parity", () => {
  it("keeps the picker and inline card local-first instead of depending on stitch export assets", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");
    const inlineCard = readProjectFile("src/features/editor/components/DiaryPreludeInlineCard.vue");

    expect(picker).toContain("DiaryPreludeGlyph");
    expect(inlineCard).toContain("DiaryPreludeGlyph");
    expect(picker).not.toContain("fonts.googleapis.com");
    expect(picker).not.toContain("cdn.tailwindcss.com");
    expect(picker).not.toContain("Material Symbols");
    expect(picker).not.toContain("https://");
    expect(inlineCard).not.toContain("fonts.googleapis.com");
    expect(inlineCard).not.toContain("cdn.tailwindcss.com");
    expect(inlineCard).not.toContain("https://");
  });

  it("avoids duplicate tap and click bindings on picker toggles in H5", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");
    const inlineCard = readProjectFile("src/features/editor/components/DiaryPreludeInlineCard.vue");

    expect(picker).not.toContain('@tap="toggleWeather(option.code)"\n            @click="toggleWeather(option.code)"');
    expect(picker).not.toContain('@tap="toggleMood(option.code)"\n            @click="toggleMood(option.code)"');
    expect(picker).not.toContain('@tap="handleConfirm"\n          @click="handleConfirm"');
    expect(inlineCard).not.toContain('@tap="handleTap"\n    @click="handleTap"');
  });

  it("strengthens selected-state contrast and keeps click motion accessible", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");

    expect(picker).toContain(".diary-prelude-picker__option--active");
    expect(picker).toContain("box-shadow:");
    expect(picker).toContain("transform:");
    expect(picker).toContain(".diary-prelude-picker__option:active");
    expect(picker).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
