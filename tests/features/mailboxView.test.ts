import { describe, expect, it } from "vitest";
import {
  getDefaultMailboxSecondaryTab,
  getMailboxSecondaryOptions,
  resolveMailboxComposeType,
} from "@/features/mailbox/mailboxView";

describe("mailbox view helpers", () => {
  it("returns documentary and distant secondary options", () => {
    expect(getMailboxSecondaryOptions("documentary")).toEqual([
      { value: "diary", label: "日记" },
      { value: "jotting", label: "随笔" },
    ]);

    expect(getMailboxSecondaryOptions("distant")).toEqual([
      { value: "pending", label: "待启" },
      { value: "opened", label: "已启" },
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
