import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("dark mode surface parity", () => {
  it("defines shared semantic dark-mode variables in the app shell", () => {
    const appShell = readProjectFile("src/App.vue");

    expect(appShell).toContain("--noche-surface-elevated");
    expect(appShell).toContain("--noche-accent");
    expect(appShell).toContain("--noche-danger");
    expect(appShell).toContain(":root[data-theme=\"dark\"]");
  });

  it("routes core pages and shared sheets through theme variables instead of fixed light surfaces", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");
    const prelude = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const profileViewer = readProjectFile("src/features/profile/components/ProfileAlbumViewer.vue");
    const confirmDialog = readProjectFile("src/shared/ui/PaperConfirmDialog.vue");

    expect(homePage).toContain("var(--noche-surface-elevated)");
    expect(prelude).toContain("var(--noche-surface-soft)");
    expect(futureShell).toContain("var(--noche-paper-1)");
    expect(profileViewer).toContain("var(--noche-overlay-strong)");
    expect(confirmDialog).toContain("rgba(var(--noche-shadow-rgb), 0.18)");
  });
});
