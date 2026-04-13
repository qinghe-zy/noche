import { describe, expect, it } from "vitest";
import {
  getDefaultMailboxSecondaryTab,
  getMailboxSecondaryOptions,
  resolveMailboxComposeType,
} from "@/features/mailbox/mailboxView";

describe("mailbox view helpers", () => {
  it("returns documentary and distant secondary options in both locales", () => {
    expect(getMailboxSecondaryOptions("documentary", "zh-CN")).toEqual([
      { value: "diary", label: "日记" },
      { value: "jotting", label: "随笔" },
    ]);

    expect(getMailboxSecondaryOptions("distant", "zh-CN")).toEqual([
      { value: "pending", label: "待启" },
      { value: "opened", label: "已启" },
    ]);

    expect(getMailboxSecondaryOptions("documentary", "en-US")).toEqual([
      { value: "diary", label: "Diary" },
      { value: "jotting", label: "Jotting" },
    ]);

    expect(getMailboxSecondaryOptions("distant", "en-US")).toEqual([
      { value: "pending", label: "Pending" },
      { value: "opened", label: "Opened" },
    ]);
  });

  it("returns the expected default secondary tab", () => {
    expect(getDefaultMailboxSecondaryTab("documentary")).toBe("diary");
    expect(getDefaultMailboxSecondaryTab("distant")).toBe("pending");
  });

  it("maps the current secondary tab to the correct compose type", () => {
    expect(resolveMailboxComposeType("diary")).toBe("diary");
    expect(resolveMailboxComposeType("jotting")).toBe("jotting");
    expect(resolveMailboxComposeType("opened")).toBe("future");
    expect(resolveMailboxComposeType("pending")).toBe("future");
  });
});
