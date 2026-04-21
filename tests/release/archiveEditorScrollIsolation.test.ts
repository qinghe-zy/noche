import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("archive editor scroll isolation", () => {
  it("keeps archive page views from enabling page-level overflow scrolling and leaves the home entry borderless", () => {
    const archivePage = readProjectFile("src/features/archive/pages/ArchivePage.vue");
    const homeEntryBlockStart = archivePage.indexOf(".archive-page__home-entry {");
    const homeEntryBlockEnd = archivePage.indexOf(".archive-page__header {");
    const homeEntryBlock = archivePage.slice(homeEntryBlockStart, homeEntryBlockEnd);

    expect(archivePage).toContain(".archive-page__write-fixed-layer");
    expect(archivePage).toContain(".archive-page__write-scroll");
    expect(archivePage).not.toContain("overflow-y: auto;");
    expect(homeEntryBlock).not.toContain("border: 1px solid var(--color-line-strong);");
  });

  it("keeps the archive submit action directly wired and visually above the writing scroll layer", () => {
    const archivePage = readProjectFile("src/features/archive/pages/ArchivePage.vue");

    expect(archivePage).toContain("@touchstart.stop.prevent=\"handleSubmit\"");
    expect(archivePage).toContain("@tap=\"handleSubmit\"");
    expect(archivePage).toContain("@click=\"handleSubmit\"");
    expect(archivePage).toContain("hold-keyboard");
    expect(archivePage).toContain("view.value = \"main\"");
    expect(archivePage).toContain(".archive-page__write-interactive-layer");
    expect(archivePage).toContain("z-index: 1;");
    expect(archivePage).toContain(".archive-page__write-footer");
    expect(archivePage).toContain("z-index: 3;");
  });

  it("uses an undefined scroll-top sentinel so textarea re-renders do not coerce the writing scroll back to the first line", () => {
    const archivePage = readProjectFile("src/features/archive/pages/ArchivePage.vue");

    expect(archivePage).toContain("const programmaticWriteScrollTop = ref<number | undefined>(undefined);");
    expect(archivePage).not.toContain("const programmaticWriteScrollTop = ref<number | null>(null);");
    expect(archivePage).not.toContain("programmaticWriteScrollTop.value = null;");
  });

  it("preserves the current writing scroll when content growth races ahead of cursor updates", () => {
    const archivePage = readProjectFile("src/features/archive/pages/ArchivePage.vue");

    expect(archivePage).toContain("minScrollTop?: number;");
    expect(archivePage).toContain("const previousScrollTop = writeScrollTop.value;");
    expect(archivePage).toContain("minScrollTop: previousScrollTop");
  });

  it("wires archive cards to long-press deletion with confirmation before removing entries", () => {
    const archivePage = readProjectFile("src/features/archive/pages/ArchivePage.vue");

    expect(archivePage).toContain("@longpress.stop=\"handleRequestDeleteToday\"");
    expect(archivePage).toContain("@longpress.stop=\"handleRequestDeleteArchiveEntry(featuredArchiveEntry)\"");
    expect(archivePage).toContain("@longpress.stop=\"handleRequestDeleteArchiveEntry(entry)\"");
    expect(archivePage).toContain("uni.showModal");
    expect(archivePage).toContain("archiveStore.deleteArchiveEntry(entry.date)");
  });
});
