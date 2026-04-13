import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("page scroll rules", () => {
  it("disables page-level scrolling for fixed-page home, editor, mailbox, and calendar routes", () => {
    const pages = JSON.parse(readFileSync(resolve(process.cwd(), "src/pages.json"), "utf8")) as {
      pages: Array<{ path: string; style?: { disableScroll?: boolean } }>;
    };

    const disabledPaths = new Set(
      pages.pages.filter((page) => page.style?.disableScroll).map((page) => page.path),
    );

    expect(disabledPaths).toEqual(new Set([
      "features/home/pages/HomePage",
      "features/editor/pages/EditorPage",
      "features/mailbox/pages/MailboxPage",
      "features/calendar/pages/CalendarPage",
    ]));
  });
});
