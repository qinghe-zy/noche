import {
  SQLITE_DB_NAME,
  SQLITE_DB_PATH,
} from "@/data/db/schema";

export interface SQLiteClient {
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(runner: (client: SQLiteClient) => Promise<T>): Promise<T>;
}

export interface SQLiteClientOptions {
  name: string;
  path: string;
}

interface SQLiteErrorLike {
  code?: number;
  message?: string;
}

function isAppPlusSQLiteAvailable(): boolean {
  return typeof plus !== "undefined" && Boolean(plus.sqlite);
}

function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    return error;
  }

  const sqliteError = error as SQLiteErrorLike | undefined;
  return new Error(sqliteError?.message ?? fallback);
}

function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return `'${String(value).replace(/'/gu, "''")}'`;
}

function interpolateSql(sql: string, params: unknown[] = []): string {
  let index = 0;

  return sql.replace(/\?/gu, () => {
    const nextValue = params[index];
    index += 1;
    return escapeSqlValue(nextValue);
  });
}

async function waitForPlusReady(): Promise<void> {
  if (typeof plus !== "undefined") {
    return;
  }

  if (typeof document === "undefined" || typeof document.addEventListener !== "function") {
    throw new Error("plus runtime is unavailable.");
  }

  await new Promise<void>((resolve) => {
    document.addEventListener("plusready", () => resolve(), {
      once: true,
    });
  });
}

export function createSQLiteClient(
  options: Partial<SQLiteClientOptions> = {},
): SQLiteClient {
  const config: SQLiteClientOptions = {
    name: options.name ?? SQLITE_DB_NAME,
    path: options.path ?? SQLITE_DB_PATH,
  };
  let openPromise: Promise<void> | null = null;
  let transactionDepth = 0;

  async function ensureOpen(): Promise<void> {
    await waitForPlusReady();

    if (!isAppPlusSQLiteAvailable()) {
      throw new Error("SQLite runtime is unavailable in the current environment.");
    }

    const isOpen = plus.sqlite.isOpenDatabase({
      name: config.name,
      path: config.path,
    });

    if (isOpen) {
      return;
    }

    if (openPromise) {
      await openPromise;
      return;
    }

    openPromise = (async () => {
      const reopened = plus.sqlite.isOpenDatabase({
        name: config.name,
        path: config.path,
      });

      if (reopened) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        plus.sqlite.openDatabase({
          name: config.name,
          path: config.path,
          success: () => resolve(),
          fail: (error) => reject(toError(error, "Failed to open SQLite database.")),
        });
      });
    })();

    try {
      await openPromise;
    } catch (error) {
      openPromise = null;
      throw error;
    }

    openPromise = null;
  }

  async function executeRaw(sql: string): Promise<void> {
    await ensureOpen();

    await new Promise<void>((resolve, reject) => {
      plus.sqlite.executeSql({
        name: config.name,
        sql: [sql] as unknown as string[],
        success: () => resolve(),
        fail: (error) => reject(toError(error, "Failed to execute SQLite statement.")),
      });
    });
  }

  async function queryRaw<T>(sql: string): Promise<T[]> {
    await ensureOpen();

    return new Promise<T[]>((resolve, reject) => {
      plus.sqlite.selectSql({
        name: config.name,
        sql,
        success: (rows) => resolve((rows ?? []) as T[]),
        fail: (error) => reject(toError(error, "Failed to query SQLite rows.")),
      });
    });
  }

  async function runTransactionOperation(operation: "begin" | "commit" | "rollback"): Promise<void> {
    await ensureOpen();

    await new Promise<void>((resolve, reject) => {
      plus.sqlite.transaction({
        name: config.name,
        operation,
        success: () => resolve(),
        fail: (error) => reject(toError(error, `Failed to ${operation} SQLite transaction.`)),
      });
    });
  }

  return {
    async execute(sql: string, params: unknown[] = []): Promise<void> {
      await executeRaw(interpolateSql(sql, params));
    },
    async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      return queryRaw<T>(interpolateSql(sql, params));
    },
    async transaction<T>(runner: (client: SQLiteClient) => Promise<T>): Promise<T> {
      if (transactionDepth > 0) {
        transactionDepth += 1;

        try {
          return await runner(this);
        } finally {
          transactionDepth -= 1;
        }
      }

      transactionDepth = 1;
      await runTransactionOperation("begin");

      try {
        const result = await runner(this);
        await runTransactionOperation("commit");
        return result;
      } catch (error) {
        await runTransactionOperation("rollback");
        throw error;
      } finally {
        transactionDepth = 0;
      }
    },
  };
}
