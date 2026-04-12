import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile backup guidance", () => {
  it("gives explicit export and restore instructions instead of showing only raw paths", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(profilePage).toContain("buildExportSuccessCopy");
    expect(profilePage).toContain("buildRestoreConfirmCopy");
    expect(profilePage).toContain("buildRestoreSuccessCopy");
    expect(i18n).toContain("从本地备份恢复");
    expect(i18n).toContain("Export the current data to local device storage");
  });
});
