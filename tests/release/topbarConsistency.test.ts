import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("topbar consistency", () => {
  it("ships a shared scaffold and safe topbar instead of re-implementing page chrome ad hoc", () => {
    const scaffold = readProjectFile("src/shared/ui/PageScaffold.vue");
    const safeTopbar = readProjectFile("src/shared/ui/SafeTopbar.vue");

    expect(scaffold).toContain("SafeTopbar");
    expect(scaffold).toContain("safe-area-inset-bottom");
    expect(safeTopbar).toContain("TopbarIconButton");
    expect(safeTopbar).toContain("var(--noche-topbar-block-height)");
  });

  it("keeps future editor topbar chrome light and borderless", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain("SafeTopbar");
    expect(futureShell).toContain("border: none;");
  });

  it("routes major pages through the shared scaffold rather than bespoke topbar wrappers", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const profileAlbumPage = readProjectFile("src/features/profile/pages/ProfileAlbumPage.vue");
    const dayArchivePage = readProjectFile("src/features/day-archive/pages/DayArchivePage.vue");

    expect(homePage).toContain("PageScaffold");
    expect(mailboxPage).toContain("PageScaffold");
    expect(calendarPage).toContain("PageScaffold");
    expect(profilePage).toContain("PageScaffold");
    expect(profileAlbumPage).toContain("PageScaffold");
    expect(dayArchivePage).toContain("PageScaffold");
  });

  it("keeps the home profile entry borderless and not implemented as the old framed button avatar", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__topnav-profile-entry");
    expect(homePage).not.toContain("button class=\"home-page__topnav-profile\"");
  });
});
