import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("home jotting conflict modal", () => {
  it("uses an in-app modal instead of the system action sheet", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).not.toContain("uni.showActionSheet");
    expect(homePage).toContain("home-page__jotting-modal");
    expect(homePage).toContain("handleContinueJottingDraft");
    expect(homePage).toContain("handleCreateAnotherJottingDraft");
    expect(homePage).toContain("saveActiveDraftAsEntry");
  });
});
