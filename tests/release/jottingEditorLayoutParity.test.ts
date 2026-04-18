import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("jotting editor layout parity", () => {
  it("moves edit mode onto a full-page shell with a fixed overlay instead of the old card container", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain('v-else-if="mode === \'edit\'"');
    expect(jottingShell).toContain("jotting-shell-edit__scroll");
    expect(jottingShell).toContain("jotting-shell-edit__paper");
    expect(jottingShell).toContain("jotting-shell-edit__overlay");
    expect(jottingShell).toContain("jotting-shell-edit__title-display");
    expect(jottingShell).not.toContain("jotting-editor-shell__interactive-layer");
    expect(jottingShell).not.toContain("jotting-editor-shell__card");
  });

  it("freezes collapse progress during keyboard use while keeping a single manual shell scroll container", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain(':scroll-y="!isEditShellScrollLocked && editCanShellScroll"');
    expect(jottingShell).toContain("const editCanShellScroll = computed(() =>");
    expect(jottingShell).toContain("const isEditShellScrollLocked = computed(() => keyboardVisible.value);");
    expect(jottingShell).toContain("const editUserScrollTop = ref(0);");
    expect(jottingShell).toContain("const editCollapseProgress = ref(0);");
    expect(jottingShell).toContain("onEditShellScroll");
    expect(jottingShell).toContain("const isProgrammaticEditBodyScroll = ref(false);");
    expect(jottingShell).toContain("const editScrollTopBinding = computed(() =>");
    expect(jottingShell).toContain("jotting-shell-edit__body");
    expect(jottingShell).not.toContain("jotting-shell-edit__body-scroll");
    expect(jottingShell).not.toContain(':scroll-y="shouldEnableBodyScroll"');
    expect(jottingShell).toContain("editUserScrollTop.value");
  });

  it("splits jotting read and edit mode into separate top-level branches", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain('v-if="mode === \'read\'"');
    expect(jottingShell).toContain("jotting-shell-read__scroll");
    expect(jottingShell).toContain("jotting-shell-read__overlay");
  });

  it("keeps read titles only in the overlay and not in the paper body", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("jotting-shell-read__title");
    expect(jottingShell).not.toContain("jotting-editor-shell__read-title");
  });

  it("keeps the expanded edit title visually larger than the body and swaps to a readonly collapsed title", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("jotting-shell-edit__title-input");
    expect(jottingShell).toContain("jotting-shell-edit__title-display");
    expect(jottingShell).toContain("const editTitleInputFontSize = computed(() => rpxToPx(48));");
    expect(jottingShell).toContain("const editCollapsedTitleFontSize = computed(() => rpxToPx(26));");
  });

  it("centers the collapsed title row against the topbar line height instead of raw font size", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("const collapsedTopbarTextLineHeight = computed(() => dateCollapsedFontSize.value * 1.14);");
    expect(jottingShell).toContain("const collapsedTopbarTextTop = computed(() => topbarTop.value + (topbarHeight.value - collapsedTopbarTextLineHeight.value) / 2);");
    expect(jottingShell).toContain("const collapsedTopbarTargetTop = computed(() => collapsedTopbarTextTop.value + expandedEyebrowHeight.value);");
    expect(jottingShell).toContain("to: collapsedTopbarTargetTop.value");
  });
});
