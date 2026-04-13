import type { Entry, EntryType } from '../../domain/entry/types';

export interface EntryProfileStats {
  recordedDays: number;
  totalWords: number;
  diaryCount: number;
}

export interface EntryMailboxCollections {
  documentaryDiaries: Entry[];
  documentaryJottings: Entry[];
  distantOpenedFutures: Entry[];
  distantPendingFutures: Entry[];
}

export interface EntryAlbumItem {
  id: string;
  entryId: string;
  attachmentId: string;
  type: EntryType;
  recordDate: string;
  createdAt: string;
  localUri: string;
  sortOrder: number;
  width: number | null;
  height: number | null;
}

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
  deleteById(id: string, options?: { cleanupHook?: () => Promise<void> | void }): Promise<void>;

  /**
   * 获取日历点标记数据（返回有记录的日期列表）
   */
  getCalendarMarkedDates(): Promise<string[]>;

  /**
   * 获取个人主页轻统计
   */
  getProfileStats(): Promise<EntryProfileStats>;

  /**
   * 获取日历某一天应该展示的内容：
   * - diary / jotting 按 recordDate
   * - future 按 unlockDate
   */
  getCalendarPreviewEntries(recordDate: string): Promise<Entry[]>;

  /**
   * 获取需要在当前日期解锁的 future 条目
   */
  getUnlockableFutureEntries(recordDate: string): Promise<Entry[]>;

  /**
   * 获取信箱分组结果，避免上层先全量拉取再二次拆分
   */
  getMailboxCollections(): Promise<EntryMailboxCollections>;

  /**
   * 获取个人页图片相册条目
   */
  getProfileAlbumItems(limit?: number): Promise<EntryAlbumItem[]>;
}
