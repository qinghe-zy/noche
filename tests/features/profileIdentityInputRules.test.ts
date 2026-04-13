import { describe, expect, it } from "vitest";
import {
  countDisplayNameCharacters,
  PROFILE_HOME_TITLE_MAX,
  isDisplayNameWithinLimit,
  isHomeTitleWithinLimit,
} from "@/features/profile/profileData";

describe("profile identity input rules", () => {
  it("counts display name characters by visible glyph instead of byte length", () => {
    expect(countDisplayNameCharacters("十个字昵称刚刚好")).toBe(8);
    expect(countDisplayNameCharacters("nickname12")).toBe(10);
    expect(countDisplayNameCharacters("  山海  ")).toBe(2);
  });

  it("treats names over ten visible characters as invalid", () => {
    expect(isDisplayNameWithinLimit("十个字昵称刚刚好")).toBe(true);
    expect(isDisplayNameWithinLimit("这是超过十个字的昵称呀")).toBe(false);
  });

  it("limits the custom home title to eight visible characters", () => {
    expect(PROFILE_HOME_TITLE_MAX).toBe(8);
    expect(isHomeTitleWithinLimit("见字如面")).toBe(true);
    expect(isHomeTitleWithinLimit("把今日安放进信封里")).toBe(false);
  });
});
