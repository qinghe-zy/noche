import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("home welcome card parity", () => {
  it("adds a dedicated first-open welcome card layer on the home page", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__welcome-card-mask");
    expect(homePage).toContain("home-page__welcome-card");
    expect(homePage).toContain("home-page__welcome-card-glyph");
    expect(homePage).toContain("home-page__welcome-card-stack");
    expect(homePage).toContain("home-page__welcome-card-face");
    expect(homePage).not.toContain("home-page__welcome-card-shadow");
    expect(homePage).not.toContain("home-page__welcome-card-back--one");
    expect(homePage).not.toContain("home-page__welcome-card-back--two");
    expect(homePage).toContain("welcomeCardStage");
    expect(homePage).toContain("handleDismissWelcomeCard");
  });

  it("keeps the popup card on a simplified title-to-content state machine", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain('type HomeWelcomeCardStage = "hidden" | "entering" | "stack" | "expanded" | "collecting" | "dismissing"');
    expect(homePage).toContain("home-page__welcome-card--entering");
    expect(homePage).toContain("home-page__welcome-card--stack");
    expect(homePage).toContain("home-page__welcome-card--expanded");
    expect(homePage).toContain("home-page__welcome-card--collecting");
    expect(homePage).toContain("home-page__welcome-card--dismissing");
    expect(homePage).toContain('v-if="!isWelcomeCardReadingPhase"');
    expect(homePage).toContain("isWelcomeCardReadingPhase");
    expect(homePage).toContain("handleWelcomeCardTap");
  });

  it("lets the popup card be collected and then dismissed back to the home page", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("handleCollectWelcomeCard");
    expect(homePage).toContain("markHomeWelcomeCardCollected");
    expect(homePage).toContain("markHomeWelcomeCardResolved");
    expect(homePage).toContain("welcomeCardCollectLabel");
    expect(homePage).toContain("welcomeCardDismissLabel");
    expect(homePage).toContain("home-page__welcome-card-actions");
  });

  it("adds a top-left mini card-stack showcase entry that acts as the collect animation target", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__topnav-showcase-entry");
    expect(homePage).toContain("home-page__showcase-stack");
    expect(homePage).not.toContain("home-page__showcase-count");
    expect(homePage).toContain("handleNavigate('homeCardShowcase')");
    expect(homePage).toContain("home-page__topnav-inner");
  });

  it("styles the popup card like a larger ceremonial greeting card with balanced action tags", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("width: min(100%, 408px);");
    expect(homePage).toContain("height: 500px;");
    expect(homePage).toContain("width: 332px;");
    expect(homePage).toContain("height: 404px;");
    expect(homePage).toContain("border-radius: 38px;");
    expect(homePage).toContain("linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0))");
    expect(homePage).toContain("flex: 1 1 0;");
    expect(homePage).toContain("height: 62px;");
    expect(homePage).toContain("border-radius: 24px;");
  });

  it("gives the action tags small ceremonial label details instead of plain capsule buttons", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain(".home-page__welcome-card-pill::before");
    expect(homePage).toContain("top: 12px;");
    expect(homePage).toContain("width: 12px;");
    expect(homePage).toContain("height: 12px;");
    expect(homePage).toContain(".home-page__welcome-card-pill::after");
    expect(homePage).toContain("inset: 6px;");
    expect(homePage).toContain("border-radius: 18px;");
  });

  it("wraps the expanded action tags in a shared ribbon band so the footer feels like a card insert", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain(".home-page__welcome-card-actions {");
    expect(homePage).toContain("padding: 10px 10px 8px;");
    expect(homePage).toContain("border-radius: 30px;");
    expect(homePage).toContain("background:");
    expect(homePage).toContain("linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0))");
    expect(homePage).toContain("rgba(233, 225, 214, 0.42);");
    expect(homePage).toContain("border: 1px solid rgba(214, 204, 191, 0.32);");
  });

  it("separates cover-like title layout from the reading layout so the card feels more ceremonial", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__welcome-card-header--title");
    expect(homePage).toContain("home-page__welcome-card-header--reading");
    expect(homePage).toContain("home-page__welcome-card-eyebrow--title");
    expect(homePage).toContain("home-page__welcome-card-eyebrow--reading");
    expect(homePage).toContain("home-page__welcome-card-body--title");
    expect(homePage).toContain("home-page__welcome-card-body--reading");
    expect(homePage).toContain("home-page__welcome-card-title--cover");
    expect(homePage).toContain("home-page__welcome-card-content--reading");
    expect(homePage).toContain("justify-content: center;");
    expect(homePage).toContain("align-items: center;");
    expect(homePage).toContain("text-align: left;");
    expect(homePage).toContain("font-size: 96px;");
    expect(homePage).toContain("max-width: 220px;");
    expect(homePage).toContain("align-self: flex-start;");
  });

  it("updates the effective type-scale overrides so the cover title actually changes on device", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain(".type-scale-small .home-page__welcome-card-title { font-size: 46px; }");
    expect(homePage).toContain(".type-scale-large .home-page__welcome-card-title { font-size: 56px; }");
    expect(homePage).toContain(".type-scale-small .home-page__welcome-card-content { font-size: 14px; }");
    expect(homePage).toContain(".type-scale-large .home-page__welcome-card-content { font-size: 16px; }");
  });
});
