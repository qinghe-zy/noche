import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSQLiteClient } from "@/data/db/sqlite";

describe("sqlite client reopen behavior", () => {
  let isOpen = false;
  let openDatabase = vi.fn();
  let selectSql = vi.fn();
  let executeSql = vi.fn();
  let transaction = vi.fn();

  beforeEach(() => {
    isOpen = false;
    openDatabase = vi.fn(({ success }: { success?: () => void }) => {
      isOpen = true;
      success?.();
    });
    selectSql = vi.fn(({ success, fail }: { success?: (rows: unknown[]) => void; fail?: (error: unknown) => void }) => {
      if (!isOpen) {
        fail?.({ message: "Not Open" });
        return;
      }

      success?.([]);
    });
    executeSql = vi.fn(({ success, fail }: { success?: () => void; fail?: (error: unknown) => void }) => {
      if (!isOpen) {
        fail?.({ message: "Not Open" });
        return;
      }

      success?.();
    });
    transaction = vi.fn(({ success }: { success?: () => void }) => {
      success?.();
    });

    vi.stubGlobal("plus", {
      sqlite: {
        isOpenDatabase: () => isOpen,
        openDatabase,
        selectSql,
        executeSql,
        transaction,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reopens the database after an external close before the next query", async () => {
    const client = createSQLiteClient({
      name: "noche-test",
      path: "_doc/noche-test.db",
    });

    await client.query("SELECT 1");
    expect(openDatabase).toHaveBeenCalledTimes(1);

    isOpen = false;
    await client.query("SELECT 1");

    expect(openDatabase).toHaveBeenCalledTimes(2);
    expect(selectSql).toHaveBeenCalledTimes(2);
  });
});
