import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("jotting editor layout parity", () => {
  it("lets the card body consume remaining space with flex instead of measured inner heights", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).not.toContain("const cardFixedHeight = ref(");
    expect(jottingShell).not.toContain("const cardInteractiveLayerHeight = computed(");
    expect(jottingShell).not.toContain(".select(\".jotting-editor-shell__card-fixed-layer\")");
    expect(jottingShell).not.toContain("const cardTopGap = computed(");
    expect(jottingShell).not.toContain("const cardBottomGap = computed(");
    expect(jottingShell).not.toContain("const cardVisualHeight = computed(");
    expect(jottingShell).not.toContain(":style=\"cardStyle\"");
    expect(jottingShell).toContain(".jotting-editor-shell__card-interactive-layer {\n  flex: 1 1 auto;");
    expect(jottingShell).toContain(".jotting-editor-shell__body {\n  flex: 1 1 auto;");
    expect(jottingShell).toContain(".jotting-editor-shell__card {\n  width: 100%;");
    expect(jottingShell).toContain("height: 100%;");
    expect(jottingShell).toContain("const bodyStageStyle = computed(() => ({");
    expect(jottingShell).toContain("minHeight: `${interactiveLayerHeight.value}px`");
    expect(jottingShell).toContain("paddingBottom: `${bodyBottomPadding.value}px`");
  });
});
