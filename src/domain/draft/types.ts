import type { EntryType } from '../entry/types';
import type { DiaryPreludeMeta } from "@/domain/diaryPrelude/types";
import type { Attachment } from "@/shared/types/attachment";

/**
 * 草稿类型（与 EntryType 对齐）
 */
export type DraftType = EntryType;

/**
 * 草稿实体
 * 与 draftService.ts 已有接口保持兼容：
 * - id: string
 * - slotKey: string
 * - linkedEntryId: string | null
 * - createdAt / updatedAt: ISO string
 * - lastBackgroundSavedAt: string | null
 */
export interface Draft {
  id: string;
  type: DraftType;
  title: string;
  content: string;
  recordDate: string | null;    // YYYY-MM-DD，日记草稿必须有
  slotKey: string;              // 草稿槽位唯一键
  linkedEntryId: string | null; // 对应正式条目 ID（续写时填）
  createdAt: string;            // ISO string
  updatedAt: string;            // ISO string
  lastBackgroundSavedAt: string | null; // ISO string
  // 未来信特有
  unlockDate?: string | null;
  attachments?: Attachment[];
  diaryPrelude?: DiaryPreludeMeta | null;
}

/**
 * DraftEntry: 兼容 draft.store.ts 的轻量接口（用于 uni.Storage 暂存）
 */
export interface DraftEntry {
  key: string;               // 草稿槽位唯一键
  type: DraftType;
  content: string;
  recordDate: string;        // YYYY-MM-DD
  updatedAt: number;         // 时间戳（Storage 轻量版用 number）
  title?: string;
  linkedEntryId?: string;
  cursorPosition?: number;
  unlockDate?: string;
  diaryPrelude?: DiaryPreludeMeta | null;
  mode?: 'edit' | 'read';
  lastBackgroundSavedAt?: number;
}
