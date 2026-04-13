import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile album square parity", () => {
  it("uses a dedicated square thumb frame instead of relying on runtime-specific aspect-ratio support", () => {
    const profileAlbum = readProjectFile("src/features/profile/components/ProfileMemoryAlbum.vue");

    expect(profileAlbum).toContain("profile-album__thumb");
    expect(profileAlbum).toContain("padding-top: 100%;");
    expect(profileAlbum).toContain("position: absolute;");
    expect(profileAlbum).not.toContain("aspect-ratio: 1;");
  });
});
