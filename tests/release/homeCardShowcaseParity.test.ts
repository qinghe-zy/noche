import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("home card showcase parity", () => {
  it("registers a dedicated showcase page route instead of reusing mailbox or profile", () => {
    const routes = readProjectFile("src/shared/constants/routes.ts");
    const pages = readProjectFile("src/pages.json");

    expect(routes).toContain('homeCardShowcase: "features/home/pages/HomeCardShowcasePage"');
    expect(pages).toContain('"path": "features/home/pages/HomeCardShowcasePage"');
  });

  it("renders the showcase as grouped paper lists with an immersive detail layer", () => {
    const page = readProjectFile("src/features/home/pages/HomeCardShowcasePage.vue");

    expect(page).toContain("home-card-showcase-page__group");
    expect(page).toContain("home-card-showcase-page__paper-item");
    expect(page).toContain("@longpress=");
    expect(page).toContain("home-card-showcase-page__detail-mask");
    expect(page).toContain("home-card-showcase-page__detail-card");
    expect(page).toContain("PaperConfirmDialog");
    expect(page).toContain("removeHomeWelcomeCardCollected");
    expect(page).toContain("readHomeWelcomeCardCollection");
    expect(page).toContain("today_quote");
    expect(page).toContain("mood_response");
    expect(page).toContain("weather_season");
    expect(page).toContain("playful_draw");
    expect(page).toContain("action_prompt");
  });

  it("uses the shared topbar inset rhythm instead of a custom taller return bar", () => {
    const page = readProjectFile("src/features/home/pages/HomeCardShowcasePage.vue");

    expect(page).toContain("useEditorKeyboardViewport");
    expect(page).toContain("topbarBottomSpacing");
    expect(page).toContain("paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`");
    expect(page).toContain("paddingBottom: `${topbarBottomSpacing.value}px`");
    expect(page).not.toContain("home-card-showcase-page__count");
  });
});
