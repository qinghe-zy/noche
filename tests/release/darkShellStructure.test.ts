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

    expect(archivePage).toContain("pageClass('main')");
    expect(archivePage).toContain("pageClass('write')");
    expect(archivePage).toContain("pageClass('success')");
    expect(archivePage).toContain("pageClass('memory')");
    expect(archivePage).toContain("archive-page__nav-btn--center");
  });

  it("wires the dark shell sections instead of the placeholder scaffold", () => {
    const shellPage = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");

    expect(shellPage).toContain("DarkTodaySection");
    expect(shellPage).toContain("DarkWritingSection");
    expect(shellPage).toContain("DarkFutureSection");
    expect(shellPage).toContain("DarkMailboxSection");
    expect(shellPage).toContain("mode=write");
  });

  it("passes the daily welcome copy into the dark today section", () => {
    const homePage = readFileSync("src/features/home/pages/HomePage.vue", "utf8");
    const shellPage = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");
    const todaySection = readFileSync("src/features/dark-shell/components/DarkTodaySection.vue", "utf8");

    expect(homePage).toContain(":welcome-content=\"activeWelcomeCard.content\"");
    expect(shellPage).toContain("welcomeContent");
    expect(todaySection).toContain("props.welcomeContent?.trim()");
  });

  it("keeps the recent jotting block in the dark today section", () => {
    const todaySection = readFileSync("src/features/dark-shell/components/DarkTodaySection.vue", "utf8");

    expect(todaySection).toContain("最近随笔");
    expect(todaySection).toContain("recentJottings");
    expect(todaySection).toContain("dark-today__entry");
  });

  it("does not wire long-press deletion into dark writing and mailbox lists yet", () => {
    const writingSection = readFileSync("src/features/dark-shell/components/DarkWritingSection.vue", "utf8");
    const mailboxSection = readFileSync("src/features/dark-shell/components/DarkMailboxSection.vue", "utf8");

    expect(writingSection).not.toContain("@longpress.stop=\"handleRequestDeleteEntry(entry)\"");
    expect(mailboxSection).not.toContain("@longpress.stop=\"handleRequestDeleteEntry(entry)\"");
    expect(writingSection).not.toContain("PaperConfirmDialog");
    expect(mailboxSection).not.toContain("PaperConfirmDialog");
    expect(writingSection).not.toContain("entryStore.destroyEntry");
    expect(mailboxSection).not.toContain("entryStore.destroyEntry");
  });
});
