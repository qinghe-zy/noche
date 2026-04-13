import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor shadow hydration feedback", () => {
  it("restores shadow content silently instead of surfacing the saved hint on first open", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(editorPage).toContain("await persistDraftNow();\n  resetFeedback();");
    expect(editorPage).not.toContain("await persistDraftNow();\n  markSaved();");
  });
});
