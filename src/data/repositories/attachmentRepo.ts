import { TABLES } from "@/data/db/schema";
import type { SQLiteClient } from "@/data/db/sqlite";

export interface AttachmentRecord {
  id: string;
  type: string;
  entry_id: string | null;
  draft_slot_key: string | null;
  local_uri: string;
  sort_order: number;
  created_at: string;
  width: number | null;
  height: number | null;
}

export interface ProfileAlbumItemRecord {
  entry_id: string;
  attachment_id: string;
  type: string;
  record_date: string;
  created_at: string;
  local_uri: string;
  sort_order: number;
  width: number | null;
  height: number | null;
}

function buildInClause(values: string[]): { clause: string; params: string[] } {
  const placeholders = values.map(() => "?").join(", ");
  return {
    clause: `(${placeholders})`,
    params: values,
  };
}

export interface AttachmentRepo {
  findByEntryIds(entryIds: string[]): Promise<AttachmentRecord[]>;
  findByDraftSlotKey(slotKey: string): Promise<AttachmentRecord[]>;
  replaceForEntry(entryId: string, attachments: AttachmentRecord[]): Promise<void>;
  replaceForDraft(slotKey: string, attachments: AttachmentRecord[]): Promise<void>;
  deleteByEntryId(entryId: string): Promise<void>;
  deleteByDraftSlotKey(slotKey: string): Promise<void>;
  listProfileAlbumItems(limit?: number): Promise<ProfileAlbumItemRecord[]>;
}

export function createAttachmentRepo(client: SQLiteClient): AttachmentRepo {
  return {
    async findByEntryIds(entryIds) {
      if (entryIds.length === 0) {
        return [];
      }

      const { clause, params } = buildInClause(entryIds);
      return client.query<AttachmentRecord>(
        `SELECT *
         FROM ${TABLES.attachments}
         WHERE entry_id IN ${clause}
         ORDER BY entry_id ASC, sort_order ASC`,
        params,
      );
    },

    async findByDraftSlotKey(slotKey) {
      return client.query<AttachmentRecord>(
        `SELECT *
         FROM ${TABLES.attachments}
         WHERE draft_slot_key = ?
         ORDER BY sort_order ASC`,
        [slotKey],
      );
    },

    async replaceForEntry(entryId, attachments) {
      await client.execute(`DELETE FROM ${TABLES.attachments} WHERE entry_id = ?`, [entryId]);

      for (const attachment of attachments) {
        await client.execute(
          `INSERT OR REPLACE INTO ${TABLES.attachments} (
            id,
            type,
            entry_id,
            draft_slot_key,
            local_uri,
            sort_order,
            created_at,
            width,
            height
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachment.id,
            attachment.type,
            entryId,
            null,
            attachment.local_uri,
            attachment.sort_order,
            attachment.created_at,
            attachment.width,
            attachment.height,
          ],
        );
      }
    },

    async replaceForDraft(slotKey, attachments) {
      await client.execute(`DELETE FROM ${TABLES.attachments} WHERE draft_slot_key = ?`, [slotKey]);

      for (const attachment of attachments) {
        await client.execute(
          `INSERT OR REPLACE INTO ${TABLES.attachments} (
            id,
            type,
            entry_id,
            draft_slot_key,
            local_uri,
            sort_order,
            created_at,
            width,
            height
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachment.id,
            attachment.type,
            null,
            slotKey,
            attachment.local_uri,
            attachment.sort_order,
            attachment.created_at,
            attachment.width,
            attachment.height,
          ],
        );
      }
    },

    async deleteByEntryId(entryId) {
      await client.execute(`DELETE FROM ${TABLES.attachments} WHERE entry_id = ?`, [entryId]);
    },

    async deleteByDraftSlotKey(slotKey) {
      await client.execute(`DELETE FROM ${TABLES.attachments} WHERE draft_slot_key = ?`, [slotKey]);
    },

    async listProfileAlbumItems(limit) {
      const limitClause = typeof limit === "number" ? " LIMIT ?" : "";
      const params = typeof limit === "number" ? [limit] : [];

      return client.query<ProfileAlbumItemRecord>(
        `SELECT
           entry.id AS entry_id,
           attachment.id AS attachment_id,
           entry.type AS type,
           entry.record_date AS record_date,
           entry.created_at AS created_at,
           attachment.local_uri AS local_uri,
           attachment.sort_order AS sort_order,
           attachment.width AS width,
           attachment.height AS height
         FROM ${TABLES.attachments} attachment
         INNER JOIN ${TABLES.entries} entry
           ON entry.id = attachment.entry_id
         WHERE entry.destroyed_at IS NULL
           AND (
             entry.type IN ('diary', 'jotting')
             OR (entry.type = 'future' AND entry.status = 'unlocked')
           )
         ORDER BY entry.record_date DESC, entry.created_at DESC, attachment.sort_order ASC${limitClause}`,
        params,
      );
    },
  };
}
