import type { Draft } from "@/domain/draft/types";

export interface IDraftRepository {
  save(draft: Draft): Promise<void>;
  getBySlotKey(slotKey: string): Promise<Draft | null>;
  getAll(): Promise<Draft[]>;
  deleteBySlotKey(slotKey: string): Promise<void>;
}
