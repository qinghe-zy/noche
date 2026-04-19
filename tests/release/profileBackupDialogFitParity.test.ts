import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile backup dialog fit parity", () => {
  it("keeps confirm and option sheets within the viewport with internal scrolling", () => {
    const confirmDialog = readProjectFile("src/shared/ui/PaperConfirmDialog.vue");
    const optionSheet = readProjectFile("src/shared/ui/PaperOptionSheet.vue");

    expect(confirmDialog).toContain("max-height: calc(100vh - 56px);");
    expect(confirmDialog).toContain("overflow-y: auto;");
    expect(confirmDialog).toContain("display: flex;");
    expect(optionSheet).toContain("max-height: calc(100vh - 56px);");
    expect(optionSheet).toContain("overflow-y: auto;");
    expect(optionSheet).toContain("display: flex;");
  });
});
