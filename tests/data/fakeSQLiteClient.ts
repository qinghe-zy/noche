import type { SQLiteClient } from "@/data/db/sqlite";

interface SqlCall {
  sql: string;
  params?: unknown[];
}

export class FakeSQLiteClient implements SQLiteClient {
  readonly executed: SqlCall[] = [];
  readonly queried: SqlCall[] = [];
  readonly queryResults: unknown[][] = [];
  transactionCount = 0;

  async execute(sql: string, params?: unknown[]): Promise<void> {
    this.executed.push({ sql, params });
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    this.queried.push({ sql, params });
    return (this.queryResults.shift() ?? []) as T[];
  }

  async transaction<T>(runner: (client: SQLiteClient) => Promise<T>): Promise<T> {
    this.transactionCount += 1;
    return runner(this);
  }
}
