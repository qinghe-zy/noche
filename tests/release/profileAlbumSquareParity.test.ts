import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("profile album square parity", () => {
  it("uses a dedicated square thumb frame instead of relying on runtime-specific aspect-ratio support", () => {
    const profileAlbum = readProjectFile("src/features/profile/components/ProfileMemoryAlbum.vue");

    expect(profileAlbum).toContain("profile-album__thumb");
    expect(profileAlbum).toContain("padding-top: 100%;");
    expect(profileAlbum).toContain("position: absolute;");
    expect(profileAlbum).not.toContain("aspect-ratio: 1;");
  });

  it("keeps album surfaces on semantic tokens for the Claude redesign", () => {
    const profileAlbum = readProjectFile("src/features/profile/components/ProfileMemoryAlbum.vue");
    const profileAlbumPage = readProjectFile("src/features/profile/pages/ProfileAlbumPage.vue");

    expect(profileAlbum).toContain("var(--surface-primary");
    expect(profileAlbum).toContain("var(--border-subtle");
    expect(profileAlbumPage).toContain("var(--font-heading)");
  });
});
