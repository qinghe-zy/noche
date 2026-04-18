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
    expect(jottingShell).toContain(".jotting-editor-shell__card-interactive-layer {");
    expect(jottingShell).toContain("flex: 1 1 auto;");
    expect(jottingShell).toContain(".jotting-editor-shell__body {");
    expect(jottingShell).toContain(".jotting-editor-shell__card {");
    expect(jottingShell).toContain("width: 100%;");
    expect(jottingShell).toContain("height: 100%;");
    expect(jottingShell).toContain("const bodyStageStyle = computed(() => ({");
    expect(jottingShell).toContain("minHeight: `${interactiveLayerHeight.value}px`");
    expect(jottingShell).toContain("paddingBottom: `${bodyBottomPadding.value}px`");
  });

  it("only enables body scrolling when the writing area actually overflows or the keyboard needs room", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain(':scroll-y="shouldEnableBodyScroll"');
    expect(jottingShell).not.toContain("\n            scroll-y\n");
    expect(jottingShell).toContain("const bodyViewportHeight = ref(0);");
    expect(jottingShell).toContain("const shouldEnableBodyScroll = computed(() =>");
    expect(jottingShell).toContain("const effectiveScrollableHeight = renderWritingHeight.value");
    expect(jottingShell).toContain('props.mode === "edit" && keyboardVisible.value ? minLineGapToKeyboard.value : 0');
    expect(jottingShell).toContain("bodyViewportHeight.value");
    expect(jottingShell).toContain("writingScrollTop.value = 0;");
  });
});
