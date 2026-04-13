import { afterEach, describe, expect, it, vi } from "vitest";
import { createSQLiteClient } from "@/data/db/sqlite";

describe("createSQLiteClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reopens the sqlite database after an external close", async () => {
    const sqliteState = {
      isOpen: false,
    };
    const openDatabase = vi.fn(({ success }: { success?: () => void }) => {
      sqliteState.isOpen = true;
      success?.();
    });
    const closeDatabase = vi.fn(({ success }: { success?: () => void }) => {
      sqliteState.isOpen = false;
      success?.();
    });
    const executeSql = vi.fn(({
      success,
      fail,
    }: {
      success?: () => void;
      fail?: (error: { message: string }) => void;
    }) => {
      if (!sqliteState.isOpen) {
        fail?.({ message: "Not Open" });
        return;
      }

      success?.();
    });

    vi.stubGlobal("plus", {
      sqlite: {
        isOpenDatabase: vi.fn(() => sqliteState.isOpen),
        openDatabase,
        closeDatabase,
        executeSql,
        selectSql: vi.fn(),
        transaction: vi.fn(),
      },
    });

    const client = createSQLiteClient();

    await expect(client.execute("CREATE TABLE IF NOT EXISTS t (id INTEGER)")).resolves.toBeUndefined();
    expect(openDatabase).toHaveBeenCalledTimes(1);

    closeDatabase({});

    await expect(client.execute("INSERT INTO t VALUES (1)")).resolves.toBeUndefined();
    expect(openDatabase).toHaveBeenCalledTimes(2);
    expect(executeSql).toHaveBeenCalledTimes(2);
  });
});
