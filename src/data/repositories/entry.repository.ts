import type { Entry, EntryType } from '../../domain/entry/types';

/**
 * 条目仓储接口
 */
export interface IEntryRepository {
  /**
   * 保存或更新条目
   */
  save(entry: Entry): Promise<void>;

  /**
   * 按 ID 获取条目
   */
  getById(id: string): Promise<Entry | null>;

  /**
   * 分页或全量按日期获取条目
   * @param recordDate YYYY-MM-DD
   */
  getByDate(recordDate: string): Promise<Entry[]>;

  /**
   * 获取所有未删除的条目（用于搜索或全文列表）
   */
  getAllActive(): Promise<Entry[]>;

  /**
   * 获取特定类型的条目
   */
  getByType(type: EntryType): Promise<Entry[]>;

  /**
   * 逻辑删除条目
   */
  deleteById(id: string): Promise<void>;

  /**
   * 获取日历点标记数据（返回有记录的日期列表）
   */
  getCalendarMarkedDates(): Promise<string[]>;
}
