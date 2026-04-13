import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("future editor scroll animation", () => {
  it("does not keep scroll animation permanently enabled during normal typing", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain(":scroll-with-animation=\"scrollWithAnimation\"");
    expect(futureShell).toContain("const scrollWithAnimation = ref(false);");
    expect(futureShell).not.toContain("scroll-with-animation\n");
  });

  it("separates keyboard-transition scrolling from input-time scrolling", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain("watch(\n  () => props.keyboardVisible");
    expect(futureShell).toContain("syncWritingScroll(");
    expect(futureShell).toContain("scrollWithAnimation.value = false;");
    expect(futureShell).not.toContain("if (props.keyboardVisible && estimatedHeight !== previousMeasuredHeight) {\n    syncWritingScroll(");
  });

  it("keeps future editor safe spacing tied to the active writing line height", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(editorPage).toContain("resolveEditorLiveSpacing");
    expect(editorPage).toContain("Math.max(minLineGapToKeyboard.value, writingAppearance.value.lineHeightPx)");
    expect(editorPage).toContain("Math.max(cursorSpacing.value, writingAppearance.value.lineHeightPx)");
  });
});
