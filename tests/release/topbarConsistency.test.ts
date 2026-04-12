import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("topbar consistency", () => {
  it("keeps future editor topbar chrome light and borderless", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain("TopbarIconButton");
    expect(futureShell).toContain(".editor-page__topbar-button { width: 72rpx; height: 72rpx;");
    expect(futureShell).toContain("border: none;");
  });

  it("uses shared topbar icon buttons for mailbox and calendar topbars", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");
    const profileHero = readProjectFile("src/features/profile/components/ProfileHero.vue");

    expect(mailboxPage).toContain("TopbarIconButton");
    expect(calendarPage).toContain("TopbarIconButton");
    expect(profileHero).toContain("TopbarIconButton");
    expect(mailboxPage).toContain("min-height: var(--noche-nav-bar-height);");
    expect(mailboxPage).toContain("padding: var(--noche-status-bar-height) var(--noche-topbar-padding-x) 0;");
    expect(calendarPage).toContain("min-height: var(--noche-nav-bar-height);");
    expect(calendarPage).toContain("padding: var(--noche-status-bar-height) var(--noche-topbar-padding-x) 0;");
    expect(profileHero).toContain("min-height: var(--noche-nav-bar-height);");
    expect(profileHero).toContain("padding: var(--noche-status-bar-height) var(--noche-page-padding-x) 0;");
  });

  it("keeps the home profile entry borderless and not implemented as the old framed button avatar", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__topnav-profile-entry");
    expect(homePage).not.toContain("button class=\"home-page__topnav-profile\"");
  });
});
