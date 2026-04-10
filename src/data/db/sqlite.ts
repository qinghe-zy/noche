export interface SQLiteClient {
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(runner: (client: SQLiteClient) => Promise<T>): Promise<T>;
}

export function createSQLiteClient(): SQLiteClient {
  return {
    async execute() {
      throw new Error("SQLite client is not wired yet.");
    },
    async query<T>() {
      return [] as T[];
    },
    async transaction<T>(runner: (client: SQLiteClient) => Promise<T>) {
      return runner(this);
    },
  };
}
