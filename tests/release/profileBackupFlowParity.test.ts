import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile backup flow parity", () => {
  it("keeps separate default-folder and manual-folder backup actions on the profile page", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain("export-default");
    expect(profilePage).toContain("export-private");
    expect(profilePage).toContain("export-custom");
    expect(profilePage).toContain("restore-default");
    expect(profilePage).toContain("restore-private");
    expect(profilePage).toContain("restore-custom");
    expect(profilePage).toContain("backup-folder");
  });
});
