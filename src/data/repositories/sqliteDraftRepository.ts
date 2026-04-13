import type { SQLiteClient } from "@/data/db/sqlite";
import {
  mapAttachmentRecordToEntryAttachment,
  mapAttachmentToEntryRecord,
} from "@/data/mappers/attachmentMapper";
import { mapDraftToRecord, mapRecordToDraft } from "@/data/mappers/draftMapper";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import { createAttachmentRepo } from "@/data/repositories/attachmentRepo";
import { createDraftRepo, type DraftRecord } from "@/data/repositories/draftRepo";
import type { Draft } from "@/domain/draft/types";

async function mapDraftsWithAttachments(
  records: DraftRecord[],
  client: SQLiteClient,
): Promise<Draft[]> {
  const attachmentRepo = createAttachmentRepo(client);
  const drafts: Draft[] = [];

  for (const record of records) {
    const attachments = await attachmentRepo.findByDraftSlotKey(record.slot_key);
    const draft = mapRecordToDraft(record);
    drafts.push({
      ...draft,
      attachments: attachments.length
        ? attachments.map(mapAttachmentRecordToEntryAttachment)
        : draft.attachments,
    });
  }

  return drafts;
}

export function createSQLiteDraftRepository(client: SQLiteClient): IDraftRepository {
  const repo = createDraftRepo(client);

  return {
    async save(draft: Draft): Promise<void> {
      const record = mapDraftToRecord(draft);
      const attachmentRecords = (draft.attachments ?? []).map(mapAttachmentToEntryRecord);

      await client.transaction(async (transactionClient) => {
        const transactionRepo = createDraftRepo(transactionClient);
        const transactionAttachmentRepo = createAttachmentRepo(transactionClient);

        await transactionRepo.upsert(record);
        await transactionAttachmentRepo.replaceForDraft(draft.slotKey, attachmentRecords);
      });
    },

    async getBySlotKey(slotKey: string): Promise<Draft | null> {
      const record = await repo.findBySlotKey(slotKey);

      if (!record) {
        return null;
      }

      const drafts = await mapDraftsWithAttachments([record], client);
      return drafts[0] ?? null;
    },

    async getAll(): Promise<Draft[]> {
      const records = await repo.list();
      return mapDraftsWithAttachments(records, client);
    },

    async deleteBySlotKey(slotKey: string): Promise<void> {
      await client.transaction(async (transactionClient) => {
        const transactionRepo = createDraftRepo(transactionClient);
        const transactionAttachmentRepo = createAttachmentRepo(transactionClient);

        await transactionRepo.deleteBySlotKey(slotKey);
        await transactionAttachmentRepo.deleteByDraftSlotKey(slotKey);
      });
    },
  };
}
