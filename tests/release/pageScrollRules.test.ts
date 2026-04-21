import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("page scroll rules", () => {
  it("disables page-level scrolling for fixed-page home, editor, mailbox, calendar, and archive routes", () => {
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
      "features/archive/pages/ArchivePage",
    ]));
  });

  it("keeps archive using the same native keyboard resize mode as the editor page", () => {
    const pages = JSON.parse(readFileSync(resolve(process.cwd(), "src/pages.json"), "utf8")) as {
      pages: Array<{
        path: string;
        style?: {
          ["app-plus"]?: {
            softinputMode?: string;
          };
        };
      }>;
    };

    const archivePage = pages.pages.find((page) => page.path === "features/archive/pages/ArchivePage");
    const editorPage = pages.pages.find((page) => page.path === "features/editor/pages/EditorPage");

    expect(editorPage?.style?.["app-plus"]?.softinputMode).toBe("adjustResize");
    expect(archivePage?.style?.["app-plus"]?.softinputMode).toBe("adjustResize");
  });
});
