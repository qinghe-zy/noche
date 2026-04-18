import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("jotting read collapse parity", () => {
  it("guards the read overlay shell markers", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("jotting-shell-read__spacer");
    expect(jottingShell).toContain("jotting-shell-read__paper");
    expect(jottingShell).toContain("jotting-shell-read__overlay-bg");
    expect(jottingShell).toContain("@scroll=\"onReadScroll\"");
  });

  it("guards the continue-write return-to-top flow in read mode", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("isTransitioningToEdit");
    expect(jottingShell).toContain("readScrollWithAnimation");
    expect(jottingShell).toContain("readAnimatedScrollTop");
    expect(jottingShell).toContain("setTimeout(() => {");
    expect(jottingShell).toContain("emit(\"continue-write\")");
  });

  it("guards the measured read scroll gating markers", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("measuredPaperHeight");
    expect(jottingShell).toContain("measuredDateWidth");
    expect(jottingShell).toContain("measurePaperHeight");
    expect(jottingShell).toContain("measureCollapsedDateWidth");
  });

  it("guards the edit shell timing markers so collapse only follows page scrolling before the keyboard opens", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("editUserScrollTop");
    expect(jottingShell).toContain("editShellScrollTop");
    expect(jottingShell).toContain("editCollapseProgress");
    expect(jottingShell).toContain("isProgrammaticEditBodyScroll");
    expect(jottingShell).toContain("onEditShellScroll");
    expect(jottingShell).toContain("measureEditBodyViewport");
  });
});
