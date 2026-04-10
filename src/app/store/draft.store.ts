import { defineStore } from 'pinia';
import type { DraftEntry } from '@/domain/draft/types';
import type { EntryType } from '@/domain/entry/types';

/**
 * 草稿槽位键生成工具
 */
export function getDraftSlotKey(type: EntryType, recordDate?: string): string {
  if (type === 'diary' && recordDate) {
    return `draft_diary_${recordDate}`;
  }
  if (type === 'future-letter') {
    return 'draft_future';
  }
  return 'draft_jotting';
}

export const useDraftStore = defineStore('draft', {
  state: () => ({
    activeDraft: null as DraftEntry | null,
    isAutoSaving: false,
  }),

  actions: {
    /**
     * 恢复对应槽位的草稿
     */
    restoreDraft(key: string): DraftEntry | null {
      // TODO: 从 uni.getStorageSync 或 SQLite 读取
      const raw = uni.getStorageSync(key);
      if (raw) {
        this.activeDraft = JSON.parse(raw) as DraftEntry;
        return this.activeDraft;
      }
      return null;
    },

    /**
     * 静默暂存当前草稿（debounce 由调用方控制）
     */
    silentSaveDraft(draft: DraftEntry) {
      this.isAutoSaving = true;
      try {
        uni.setStorageSync(draft.key, JSON.stringify(draft));
        this.activeDraft = draft;
      } finally {
        this.isAutoSaving = false;
      }
    },

    /**
     * 清空草稿槽
     */
    clearDraft(key: string) {
      uni.removeStorageSync(key);
      if (this.activeDraft?.key === key) {
        this.activeDraft = null;
      }
    },
  },
});
