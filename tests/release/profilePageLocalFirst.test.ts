import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile page local-first constraints", () => {
  it("does not keep prototype remote resources in profile surfaces", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).not.toContain("fonts.googleapis.com");
    expect(profilePage).not.toContain("tailwindcss.com");
    expect(profilePage).not.toContain("googleusercontent.com");
    expect(profilePage).not.toContain("http://");
    expect(profilePage).not.toContain("https://");
  });
});
