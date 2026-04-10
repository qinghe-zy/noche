import { describe, expect, it } from "vitest";
import type { Entry } from "@/domain/entry/types";
import {
  formatMailboxDateLabel,
  formatMailboxExcerpt,
  formatMailboxTypeLabel,
} from "@/features/mailbox/mailboxDisplay";

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: overrides.id ?? "entry-1",
    type: overrides.type ?? "diary",
    status: overrides.status ?? "saved",
    title: overrides.title ?? null,
    content: overrides.content ?? "今天的风很轻，纸页翻得很慢。",
    recordDate: overrides.recordDate ?? "2026-04-10",
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-10T08:00:00.000Z",
    savedAt: overrides.savedAt ?? "2026-04-10T08:00:00.000Z",
    unlockDate: overrides.unlockDate ?? null,
    unlockedAt: overrides.unlockedAt ?? null,
    destroyedAt: overrides.destroyedAt ?? null,
  };
}

describe("mailbox display helpers", () => {
  it("formats entry type labels in project language", () => {
    expect(formatMailboxTypeLabel("diary")).toBe("日记");
    expect(formatMailboxTypeLabel("jotting")).toBe("随笔");
    expect(formatMailboxTypeLabel("future")).toBe("未来信");
  });

  it("formats past and pending future dates without english copy", () => {
    expect(
      formatMailboxDateLabel(
        makeEntry({
          type: "future",
          status: "unlocked",
          recordDate: "2026-04-08",
          unlockDate: "2026-04-10",
        }),
        "past",
      ),
    ).toBe("启封于 Apr 08, 2026");

    expect(
      formatMailboxDateLabel(
        makeEntry({
          type: "future",
          status: "sealed",
          recordDate: "2026-04-08",
          unlockDate: "2026-04-12",
        }),
        "future",
      ),
    ).toBe("将于 2026-04-12 开启");
  });

  it("formats sealed future excerpts without leaking content", () => {
    expect(
      formatMailboxExcerpt(
        makeEntry({
          type: "future",
          status: "sealed",
          unlockDate: "2026-04-12",
          content: "不应显示出来",
        }),
      ),
    ).toBe("这封未来信会在 2026-04-12 当天开启。");
  });
});
