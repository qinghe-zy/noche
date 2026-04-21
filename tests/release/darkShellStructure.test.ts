import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dark shell structure", () => {
  it("keeps a dedicated dark symbol component and theme gate", () => {
    const homePage = readFileSync("src/features/home/pages/HomePage.vue", "utf8");
    const symbolComponent = readFileSync("src/features/dark-shell/components/ChisuSymbol.vue", "utf8");

    expect(homePage).toContain("DarkShellPage");
    expect(homePage).toContain("resolveThemeMode");
    expect(symbolComponent).toContain("◎");
    expect(symbolComponent).toContain("✉");
    expect(symbolComponent).toContain("▦");
  });

  it("renders archive page states and chisu-style iconography", () => {
    const archivePage = readFileSync("src/features/archive/pages/ArchivePage.vue", "utf8");

    expect(archivePage).toContain("view === 'main'");
    expect(archivePage).toContain("view === 'write'");
    expect(archivePage).toContain("view === 'success'");
    expect(archivePage).toContain("view === 'memory'");
    expect(archivePage).toContain("ChisuSymbol");
  });

  it("wires the dark shell sections instead of the placeholder scaffold", () => {
    const shellPage = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");

    expect(shellPage).toContain("DarkTodaySection");
    expect(shellPage).toContain("DarkWritingSection");
    expect(shellPage).toContain("DarkFutureSection");
    expect(shellPage).not.toContain("DarkMailboxSection");
    expect(shellPage).toContain("mode=write");
    expect(shellPage).toContain("dark-shell__tab-icon");
    expect(shellPage).toContain("dark-shell__tab-icon-image");
    expect(shellPage).toContain("buildGlyphDataUri");
    expect(shellPage).toContain("dark-shell__tab-active-line");
    expect(shellPage).not.toContain("dark-shell__tab-dot");
  });

  it("passes the daily welcome copy into the dark today section", () => {
    const homePage = readFileSync("src/features/home/pages/HomePage.vue", "utf8");
    const shellPage = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");
    const todaySection = readFileSync("src/features/dark-shell/components/DarkTodaySection.vue", "utf8");

    expect(homePage).toContain(":welcome-content=\"activeWelcomeCard.content\"");
    expect(shellPage).toContain("welcomeContent");
    expect(todaySection).toContain("props.welcomeContent?.trim()");
    expect(todaySection).not.toContain("profile-entry");
  });

  it("removes the recent jotting block from the dark today section", () => {
    const todaySection = readFileSync("src/features/dark-shell/components/DarkTodaySection.vue", "utf8");

    expect(todaySection).not.toContain("最近随笔");
    expect(todaySection).not.toContain("recentJottings");
    expect(todaySection).not.toContain("dark-today__entry");
  });

  it("wires long-press deletion into the dark writing list and moves calendar access into future", () => {
    const writingSection = readFileSync("src/features/dark-shell/components/DarkWritingSection.vue", "utf8");
    const futureSection = readFileSync("src/features/dark-shell/components/DarkFutureSection.vue", "utf8");
    const shellPage = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");

    expect(writingSection).toContain("@longpress.stop=\"handleRequestDeleteEntry(featuredEntry)\"");
    expect(writingSection).toContain("@longpress.stop=\"handleRequestDeleteEntry(entry)\"");
    expect(writingSection).toContain("PaperConfirmDialog");
    expect(writingSection).toContain("entryStore.destroyEntry");
    expect(futureSection).toContain("TopbarIconButton");
    expect(futureSection).toContain("icon-name=\"calendar\"");
    expect(futureSection).toContain("openCalendar");
    expect(shellPage).toContain("handleTabTap");
    expect(shellPage).toContain("tabId === \"profile\"");
    expect(writingSection).toContain("dark-writing__fab");
    expect(writingSection).toContain("dark-writing__fab-icon");
    expect(writingSection).toContain("dark-writing__fab-icon-image");
    expect(writingSection).toContain("fabIconSource");
    expect(writingSection).toContain("@tap=\"handleCompose\"");
    expect(writingSection).not.toContain("<ChisuSymbol symbol=\"✦\"");
  });
});
