import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("jotting editor stitch parity", () => {
  it("uses a dedicated jotting shell with the stitch image trigger source", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

    expect(jottingShell).toContain("jotting-editor-shell");
    expect(jottingShell).toContain("AppIcon name=\"image\"");
    expect(jottingShell).toContain("SafeTopbar");
  });
});
