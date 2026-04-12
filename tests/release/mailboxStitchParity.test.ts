import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("mailbox stitch parity", () => {
  it("keeps the paper and sealed stack scaffold from stitch", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("mailbox-page__paper-stack");
    expect(mailboxPage).toContain("mailbox-page__sealed-stack");
    expect(mailboxPage).toContain("mailbox-page__fab");
    expect(mailboxPage).toContain("PageScaffold");
  });

  it("uses shared topbar icons for mailbox navigation", () => {
    const mailboxPage = readProjectFile("src/features/mailbox/pages/MailboxPage.vue");

    expect(mailboxPage).toContain("TopbarIconButton");
    expect(mailboxPage).toContain("PageScaffold");
    expect(mailboxPage).toContain("topbar-bordered");
    expect(mailboxPage).toContain("min-height: var(--noche-content-min-height);");
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
});
