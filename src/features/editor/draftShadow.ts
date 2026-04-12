import type { Draft } from "@/domain/draft/types";
import { createUniJsonStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "noche.editor-draft-shadow.v1";

function readShadowMap(): Record<string, Draft> {
  const raw = createUniJsonStorage().getString(STORAGE_KEY);
  return raw ? JSON.parse(raw) as Record<string, Draft> : {};
}

function writeShadowMap(shadows: Record<string, Draft>): void {
  createUniJsonStorage().setString(STORAGE_KEY, JSON.stringify(shadows));
}

export function readDraftShadow(slotKey: string): Draft | null {
  return readShadowMap()[slotKey] ?? null;
}

export function writeDraftShadow(draft: Draft): void {
  const shadows = readShadowMap();
  shadows[draft.slotKey] = draft;
  writeShadowMap(shadows);
}

export function clearDraftShadow(slotKey: string): void {
  const shadows = readShadowMap();
  delete shadows[slotKey];
  writeShadowMap(shadows);
}
