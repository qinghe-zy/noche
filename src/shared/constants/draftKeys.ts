/**
 * 草稿槽位键常量
 * 对应 data_model.md 中的草稿分槽规则
 */
export const DRAFT_KEYS = {
  JOTTING: 'draft_jotting',
  FUTURE: 'draft_future',
  /** 日记草稿按日期分槽，使用工具函数生成 */
  diary: (date: string) => `draft_diary_${date}`,
} as const;
