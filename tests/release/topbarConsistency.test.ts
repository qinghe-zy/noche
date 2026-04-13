import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("topbar consistency", () => {
  it("keeps future editor topbar chrome light and updates shared action targets to the new 88rpx system", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const topbarButton = readProjectFile("src/shared/ui/TopbarIconButton.vue");

    expect(futureShell).toContain("TopbarIconButton");
    expect(futureShell).toContain(".editor-page__topbar-button { width: 88rpx; height: 88rpx;");
    expect(futureShell).toContain("border: none;");
    expect(topbarButton).toContain("width: 88rpx;");
    expect(topbarButton).toContain("height: 88rpx;");
    expect(topbarButton).toContain("width: 44rpx;");
    expect(topbarButton).toContain("height: 44rpx;");
  });

  it("uses shared topbar icon buttons for mailbox and calendar topbars with the unified top inset formula", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");
    const profileHero = readProjectFile("src/features/profile/components/ProfileHero.vue");

    expect(mailboxPage).toContain("TopbarIconButton");
    expect(calendarPage).toContain("TopbarIconButton");
    expect(profileHero).toContain("TopbarIconButton");
    expect(mailboxPage).toContain("statusBarHeight.value + rpxToPx(32)");
    expect(calendarPage).toContain("statusBarHeight.value + rpxToPx(32)");
    expect(profileHero).toContain("padding: 40rpx 24rpx 0;");
  });

  it("pulls shared topbar spacing from the viewport helper instead of keeping legacy 40rpx padding blocks", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(mailboxPage).toContain("topbarBottomSpacing");
    expect(calendarPage).toContain("topbarBottomSpacing");
    expect(mailboxPage).not.toContain("padding: 40rpx 32rpx 24rpx;");
    expect(calendarPage).not.toContain("padding: 40rpx 32rpx 24rpx;");
    expect(calendarPage).toContain("calendar-page__topbar-button {\n  width: 88rpx;");
  });

  it("keeps the home profile entry borderless and not implemented as the old framed button avatar", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__topnav-profile-entry");
    expect(homePage).not.toContain("button class=\"home-page__topnav-profile\"");
  });
});
