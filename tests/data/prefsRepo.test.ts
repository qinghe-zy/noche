import { describe, expect, it } from "vitest";
import { createPrefsRepo } from "@/data/repositories/prefsRepo";
import { FakeSQLiteClient } from "./fakeSQLiteClient";

describe("prefsRepo", () => {
  it("gets and upserts preferences by key", async () => {
    const client = new FakeSQLiteClient();
    client.queryResults.push([{ key: "theme", value: "dark" }]);
    const repo = createPrefsRepo(client);

    const record = await repo.get("theme");
    await repo.set({ key: "theme", value: "light" });

    expect(record).toEqual({ key: "theme", value: "dark" });
    expect(client.executed[0]).toMatchObject({
      sql: expect.stringContaining("ON CONFLICT(key) DO UPDATE"),
      params: ["theme", "light"],
    });
  });
});
