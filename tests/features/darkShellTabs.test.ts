import { describe, expect, it } from "vitest";
import { DARK_SHELL_TABS, getDarkShellTabById } from "@/features/dark-shell/darkShellTabs";

describe("darkShellTabs", () => {
  it("keeps the dark shell tab order stable", () => {
    expect(DARK_SHELL_TABS.map((tab) => tab.id)).toEqual([
      "today",
      "jotting",
      "future",
      "profile",
    ]);
  });

  it("returns the profile tab definition by id even if icon metadata changes", () => {
    expect(getDarkShellTabById("profile")).toMatchObject({
      id: "profile",
    });
  });
});
