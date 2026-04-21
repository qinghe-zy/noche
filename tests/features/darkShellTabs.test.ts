import { describe, expect, it } from "vitest";
import { DARK_SHELL_TABS, getDarkShellTabById } from "@/features/dark-shell/darkShellTabs";

describe("darkShellTabs", () => {
  it("exposes the chisu-v2 tab order and symbols", () => {
    expect(DARK_SHELL_TABS.map((tab) => tab.id)).toEqual([
      "today",
      "jotting",
      "future",
      "profile",
    ]);
    expect(DARK_SHELL_TABS.map((tab) => tab.symbol)).toEqual(["◎", "✒", "✉", "◫"]);
  });

  it("returns the profile tab definition by id", () => {
    expect(getDarkShellTabById("profile")).toMatchObject({
      id: "profile",
      symbol: "◫",
    });
  });
});
