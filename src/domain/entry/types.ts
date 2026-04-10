/**
 * 条目类型字符串字面量
 */
export type EntryType = 'diary' | 'jotting' | 'future-letter';

/**
 * 未来信解锁状态字符串字面量
 */
export type FutureLetterStatus = 'locked' | 'unlockable' | 'opened';

/**
 * 核心条目实体
 * 时间字段统一使用 ISO 字符串，与 data 层 mapper 对齐
 */
export interface Entry {
  id: string;
  type: EntryType;
  title?: string;
  content: string;
  recordDate: string;         // YYYY-MM-DD，打开纸张时锁定
  createdAt: string;          // ISO string
  updatedAt: string;          // ISO string
  savedAt?: string;           // ISO string，正式保存时间

  // 未来信特有字段
  futureUnlockDate?: string | null; // YYYY-MM-DD
  futureStatus?: FutureLetterStatus | null;

  // 销毁标记
  destroyedAt?: string | null;
  isDestroyed?: boolean;
}
