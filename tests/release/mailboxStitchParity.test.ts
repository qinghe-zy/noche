import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("mailbox stitch parity", () => {
  it("keeps the paper and sealed stack scaffold from stitch", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("mailbox-page__paper-stack");
    expect(mailboxPage).toContain("mailbox-page__sealed-stack");
    expect(mailboxPage).toContain("mailbox-page__fab");
    expect(mailboxPage).toContain("mailbox-page__topbar");
  });

  it("uses shared topbar icons for mailbox navigation", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("TopbarIconButton");
    expect(mailboxPage).toContain("statusBarHeight.value + rpxToPx(32)");
    expect(mailboxPage).not.toContain(">edit_square<");
    expect(mailboxPage).not.toContain(">auto_stories<");
  });

  it("adds past-entry category filters in the requested order", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("纪实");
    expect(mailboxPage).toContain("寄远");
    expect(mailboxPage).toContain("mailbox-page__switcher--secondary");
    expect(mailboxPage).toContain("随笔");
    expect(mailboxPage).toContain("日记");
    expect(mailboxPage).toContain("已启");
    expect(mailboxPage).toContain("待启");
  });

  it("uses the shared paper confirm dialog for locked future letters", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("PaperConfirmDialog");
    expect(mailboxPage).not.toContain("uni.showModal({");
  });

  it("renders diary prelude icons on mailbox cards when weather or mood exists", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("DiaryPreludeGlyph");
    expect(mailboxPage).toContain("mailbox-page__entry-prelude");
  });

  it("unlocks mailbox content scrolling as soon as the active category has more than one entry", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("const shouldScrollContent = computed(() => activeSection.value.entries.length > 1);");
    expect(mailboxPage).toContain("contentContainerTag");
  });

  it("keeps the compose button floating over the page instead of reserving a white footer strip", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).not.toContain("<view class=\"mailbox-page__footer\"");
    expect(mailboxPage).toContain("contentBodyStyle");
    expect(mailboxPage).toContain("z-index: 30;");
    expect(mailboxPage).toContain("padding: 4px 24px 0;");
  });

  it("adds long-press delete handling on mailbox cards through the paper confirm dialog", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("@longpress=\"handleEntryLongPress(entry)\"");
    expect(mailboxPage).toContain("isDeleteDialogOpen");
    expect(mailboxPage).toContain("deleteDialogActions");
    expect(mailboxPage).toContain("handleDeleteDialogAction");
  });

  it("starts moving mailbox surfaces onto semantic tokens and heading/body font stacks", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("var(--surface-primary");
    expect(mailboxPage).toContain("var(--font-heading)");
    expect(mailboxPage).toContain("var(--font-body)");
  });
});
