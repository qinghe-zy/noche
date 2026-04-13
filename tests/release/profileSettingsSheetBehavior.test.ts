import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile settings sheet behavior", () => {
  it("uses an apply label on appearance sheets instead of a cancel label", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(profilePage).toContain(":cancel-text=\"sheetDismissText\"");
    expect(profilePage).toContain("copy.value.common.apply");
    expect(i18n).toContain('apply: "应用"');
    expect(i18n).toContain('apply: "Apply"');
  });
});
