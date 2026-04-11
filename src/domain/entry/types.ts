/**
 * 条目类型字符串字面量
 */
import type { Attachment } from "@/shared/types/attachment";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";

export type EntryType = 'diary' | 'jotting' | 'future';

/**
 * 条目状态字符串字面量
 */
export type EntryStatus = 'saved' | 'sealed' | 'unlocked';

/**
 * 核心条目实体
 * 时间字段统一使用 ISO 字符串，与 data 层 mapper 对齐
 */
export interface Entry {
  id: string;
  type: EntryType;
  status: EntryStatus;
  title: string | null;
  content: string;
  recordDate: string;         // YYYY-MM-DD，打开纸张时锁定
  createdAt: string;          // ISO string
  updatedAt: string;          // ISO string
  savedAt: string | null;     // ISO string，正式保存时间
  unlockDate: string | null;  // YYYY-MM-DD，未来信使用
  unlockedAt: string | null;  // ISO string，未来信解锁记录时间

  // 销毁标记
  destroyedAt: string | null;
  isDestroyed?: boolean;
  attachments?: Attachment[];
  diaryPreludeStatus: DiaryPreludeStatus;
  diaryPrelude?: DiaryPreludeMeta | null;
}
