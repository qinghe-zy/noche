/**
 * 数据库连接与执行接口
 * 当前骨架阶段：为后续 SQLite 接入预留接口，不实现真实逻辑
 */
export interface IDatabase {
  /**
   * 执行 SQL 语句（写入）
   */
  execute(sql: string, params?: unknown[]): Promise<void>;

  /**
   * 执行查询（读取），返回行列表
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * 事务执行
   */
  transaction(fn: (db: IDatabase) => Promise<void>): Promise<void>;

  /**
   * 是否已连接
   */
  isConnected(): boolean;
}

/**
 * 占位实现（NoOp），确保编译通过
 */
export class NoopDatabase implements IDatabase {
  async execute(_sql: string, _params?: unknown[]): Promise<void> {
    console.warn('[NoopDatabase] execute called. SQLite not yet connected.');
  }

  async query<T>(_sql: string, _params?: unknown[]): Promise<T[]> {
    console.warn('[NoopDatabase] query called. SQLite not yet connected.');
    return [];
  }

  async transaction(_fn: (db: IDatabase) => Promise<void>): Promise<void> {
    console.warn('[NoopDatabase] transaction called. SQLite not yet connected.');
  }

  isConnected(): boolean {
    return false;
  }
}
