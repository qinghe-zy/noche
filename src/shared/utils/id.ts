import { v4 as uuidv4 } from 'uuid';

/**
 * 生成条目 ID
 */
export function generateEntryId(): string {
  return uuidv4();
}

/**
 * createId: 别名，兼容 draftService / entryService 的已有导入
 */
export const createId = generateEntryId;
