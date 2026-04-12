import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("page top inset layout", () => {
  it("publishes dynamic status-bar and fixed navbar css vars from the shared mobile layout system", () => {
    const layoutFile = readProjectFile("src/shared/layout/mobileLayout.ts");
    const safeAreaComposable = readProjectFile("src/shared/layout/useSafeAreaLayout.ts");
    const globalStyle = readProjectFile("src/uni.scss");

    expect(layoutFile).toContain("--noche-status-bar-height");
    expect(layoutFile).toContain("--noche-nav-bar-height");
    expect(layoutFile).toContain("--noche-page-top-inset");
    expect(layoutFile).toContain("--noche-content-min-height");
    expect(safeAreaComposable).toContain("useMobileLayout");
    expect(globalStyle).toContain("--noche-status-bar-height");
    expect(globalStyle).toContain("--noche-page-top-inset");
  });

  it("anchors the major page tops to the shared inset baseline instead of per-page magic numbers", () => {
    const files = [
      "src/features/home/pages/HomePage.vue",
      "src/features/editor/components/DiaryPreludePicker.vue",
      "src/features/editor/components/DiaryEditorShell.vue",
      "src/features/editor/components/JottingEditorShell.vue",
      "src/features/editor/components/FutureLetterEditorShell.vue",
      "src/features/mailbox/pages/MailboxPage.vue",
      "src/features/calendar/pages/CalendarPage.vue",
      "src/features/profile/pages/ProfilePage.vue",
      "src/features/profile/pages/ProfileAlbumPage.vue",
      "src/features/day-archive/pages/DayArchivePage.vue",
      "src/shared/ui/PageScaffold.vue",
      "src/shared/ui/SafeTopbar.vue",
    ];

    const joined = files.map((file) => readProjectFile(file)).join("\n");

    expect(joined).toContain("var(--noche-topbar-block-height)");
    expect(joined).toContain("var(--noche-safe-bottom)");
    expect(joined).toContain("var(--noche-content-min-height)");
  });
});
