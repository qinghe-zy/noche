import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("app typography scale parity", () => {
  it("defines shared type-scale classes and wires key pages to the typography preset", () => {
    const appVue = readProjectFile("src/App.vue");
    const theme = readProjectFile("src/shared/theme.ts");
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");
    const dayArchivePage = readProjectFile("src/features/day-archive/pages/DayArchivePage.vue");

    expect(appVue).toContain(".type-scale-small");
    expect(appVue).toContain(".type-scale-large");
    expect(theme).toContain("resolveTypographyClass");
    expect(theme).toContain("useTypographyClass");
    expect(profilePage).toContain("useTypographyClass");
    expect(homePage).toContain("useTypographyClass");
    expect(mailboxPage).toContain("useTypographyClass");
    expect(calendarPage).toContain("useTypographyClass");
    expect(dayArchivePage).toContain("useTypographyClass");
  });

  it("pushes the typography scale all the way to remaining legacy shells and helper components", () => {
    const scaffoldPage = readProjectFile("src/pages/index/index.vue");
    const basePageShell = readProjectFile("src/shared/ui/BasePageShell.vue");
    const homeHero = readProjectFile("src/features/home/components/HomeHero.vue");
    const homeActionCard = readProjectFile("src/features/home/components/HomeActionCard.vue");

    expect(scaffoldPage).toContain(".type-scale-small");
    expect(basePageShell).toContain(".type-scale-small");
    expect(homeHero).toContain(".type-scale-small");
    expect(homeActionCard).toContain(".type-scale-small");
    expect(scaffoldPage).not.toContain("font-size: calc(");
    expect(basePageShell).not.toContain("font-size: calc(");
    expect(homeHero).not.toContain("font-size: calc(");
    expect(homeActionCard).not.toContain("font-size: calc(");
  });

  it("avoids runtime-unstable calc-plus-css-variable font sizing on shipped app surfaces", () => {
    const appSurfaces = [
      readProjectFile("src/features/home/pages/HomePage.vue"),
      readProjectFile("src/features/mailbox/pages/MailboxPage.vue"),
      readProjectFile("src/features/calendar/pages/CalendarPage.vue"),
      readProjectFile("src/features/profile/pages/ProfilePage.vue"),
      readProjectFile("src/features/profile/pages/ProfileAlbumPage.vue"),
      readProjectFile("src/shared/ui/PaperOptionSheet.vue"),
      readProjectFile("src/shared/ui/PaperInputDialog.vue"),
      readProjectFile("src/shared/ui/PaperConfirmDialog.vue"),
    ];

    for (const source of appSurfaces) {
      expect(source).not.toContain("font-size: calc(");
      expect(source).not.toContain("var(--noche-type-scale, 1)");
      expect(source).toContain(".type-scale-small");
      expect(source).toContain(".type-scale-large");
    }
  });
});
