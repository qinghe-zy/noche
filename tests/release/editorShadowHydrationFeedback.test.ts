import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("editor shadow hydration feedback", () => {
  it("restores shadow content silently instead of surfacing the saved hint on first open", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");
    const hydrationSection = editorPage.match(
      /async function hydrateDraftFromShadow\(\): Promise<void> \{[\s\S]*?\n\}\n\nasync function openEntryForRead/u,
    )?.[0] ?? "";

    expect(hydrationSection).toContain("await persistDraftNow();\n  resetFeedback();");
    expect(hydrationSection).not.toContain("await persistDraftNow();\n  markSaved();");
  });
});
