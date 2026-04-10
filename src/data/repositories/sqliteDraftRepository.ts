import type { SQLiteClient } from "@/data/db/sqlite";
import { mapDraftToRecord, mapRecordToDraft } from "@/data/mappers/draftMapper";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import { createDraftRepo } from "@/data/repositories/draftRepo";
import type { Draft } from "@/domain/draft/types";

export function createSQLiteDraftRepository(client: SQLiteClient): IDraftRepository {
  const repo = createDraftRepo(client);

  return {
    async save(draft: Draft): Promise<void> {
      await repo.upsert(mapDraftToRecord(draft));
    },
    async getBySlotKey(slotKey: string): Promise<Draft | null> {
      const record = await repo.findBySlotKey(slotKey);
      return record ? mapRecordToDraft(record) : null;
    },
    async getAll(): Promise<Draft[]> {
      const records = await repo.list();
      return records.map(mapRecordToDraft);
    },
    async deleteBySlotKey(slotKey: string): Promise<void> {
      await repo.deleteBySlotKey(slotKey);
    },
  };
}
