import { describe, expect, it } from "vitest";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";

describe("memory prefs repository", () => {
  it("gets and sets preference records by key", async () => {
    const repository = createMemoryPrefsRepository([
      { key: "theme", value: "dark" },
    ]);

    expect(await repository.get("theme")).toEqual({ key: "theme", value: "dark" });

    await repository.set({ key: "locale", value: "en-US" });

    expect(await repository.get("locale")).toEqual({ key: "locale", value: "en-US" });
  });
});
