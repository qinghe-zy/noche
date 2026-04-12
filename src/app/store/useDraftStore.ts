import { defineStore } from "pinia";
import type { Draft } from "@/domain/draft/types";
import type { Entry } from "@/domain/entry/types";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { buildDraftSlotKey } from "@/domain/draft/rules";
import type { CreateDraftInput } from "@/domain/services/draftService";
import { createDraft, markDraftBackgroundSaved } from "@/domain/services/draftService";
import { createEntryFromDraft } from "@/domain/services/entryService";
import { getEntryRepository } from "@/app/store/entryRepository";
import { useEntryStore } from "@/app/store/useEntryStore";
import type { Attachment } from "@/shared/types/attachment";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";
import { normalizeAttachments } from "@/domain/entry/rules";
import { collectManagedLocalAttachmentPaths, removeManagedLocalFiles } from "@/shared/utils/localFiles";
import { clearDraftShadow } from "@/features/editor/draftShadow";

let draftRepository: IDraftRepository = createMemoryDraftRepository();

export function setDraftRepository(repository: IDraftRepository): void {
  draftRepository = repository;
}

export function getDraftRepository(): IDraftRepository {
  return draftRepository;
}

interface SaveDraftPatch {
  title?: string;
  content?: string;
  unlockDate?: string | null;
  attachments?: Attachment[];
  diaryPreludeStatus?: DiaryPreludeStatus;
  diaryPrelude?: DiaryPreludeMeta | null;
}

interface DraftState {
  drafts: Record<string, Draft>;
  activeDraftKey: string | null;
  isLoading: boolean;
  error: string | null;
}

function areDraftAttachmentsEqual(
  left: Attachment[] | null | undefined,
  right: Attachment[] | null | undefined,
): boolean {
  return JSON.stringify(normalizeAttachments(left)) === JSON.stringify(normalizeAttachments(right));
}

function areDiaryPreludesEqual(
  left: DiaryPreludeMeta | null | undefined,
  right: DiaryPreludeMeta | null | undefined,
): boolean {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

export const useDraftStore = defineStore("draft", {
  state: (): DraftState => ({
    drafts: {},
    activeDraftKey: null,
    isLoading: false,
    error: null,
  }),
  getters: {
    activeDraft(state): Draft | null {
      if (!state.activeDraftKey) {
        return null;
      }

      return state.drafts[state.activeDraftKey] ?? null;
    },
  },
  actions: {
    upsertDraft(draft: Draft) {
      const diaryPrelude = cloneDiaryPrelude(draft.diaryPrelude);

      this.drafts[draft.slotKey] = {
        ...draft,
        diaryPreludeStatus: draft.type === "diary"
          ? normalizeDiaryPreludeStatus(draft.diaryPreludeStatus, {
              isNewDiaryDraft: false,
              prelude: diaryPrelude,
            })
          : "skipped",
        diaryPrelude,
      };
    },
    async peekDraft(input: CreateDraftInput): Promise<Draft | null> {
      this.error = null;

      const slotKey = buildDraftSlotKey(input.type, {
        recordDate: input.recordDate ?? null,
        linkedEntryId: input.linkedEntryId ?? null,
      });

      try {
        const draft = await draftRepository.getBySlotKey(slotKey);

        if (draft) {
          this.upsertDraft(draft);
        }

        return draft
          ? {
              ...draft,
              diaryPreludeStatus: draft.type === "diary"
                ? normalizeDiaryPreludeStatus(draft.diaryPreludeStatus, {
                    isNewDiaryDraft: false,
                    prelude: draft.diaryPrelude,
                  })
                : "skipped",
              diaryPrelude: cloneDiaryPrelude(draft.diaryPrelude),
            }
          : null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to inspect draft.";
        throw error;
      }
    },
    async openDraft(input: CreateDraftInput): Promise<Draft> {
      this.isLoading = true;
      this.error = null;

      const slotKey = buildDraftSlotKey(input.type, {
        recordDate: input.recordDate ?? null,
        linkedEntryId: input.linkedEntryId ?? null,
      });

      try {
        const existingDraft = await draftRepository.getBySlotKey(slotKey);
        const nextDraft = existingDraft
          ? {
              ...existingDraft,
              diaryPrelude: cloneDiaryPrelude(existingDraft.diaryPrelude),
              diaryPreludeStatus: existingDraft.type === "diary"
                ? normalizeDiaryPreludeStatus(existingDraft.diaryPreludeStatus, {
                    isNewDiaryDraft: false,
                    prelude: existingDraft.diaryPrelude,
                  })
                : "skipped",
            }
          : createDraft(input);

        await draftRepository.save(nextDraft);
        this.upsertDraft(nextDraft);
        this.setActiveDraftKey(slotKey);
        return nextDraft;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to open draft.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async saveActiveDraft(patch: SaveDraftPatch = {}): Promise<Draft | null> {
      if (!this.activeDraft) {
        return null;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const nextPrelude = cloneDiaryPrelude(
          patch.diaryPrelude === undefined ? this.activeDraft.diaryPrelude : patch.diaryPrelude,
        );
        const nextAttachments = patch.attachments ?? this.activeDraft.attachments ?? [];
        const nextUnlockDate = this.activeDraft.type === "future"
          ? patch.unlockDate ?? this.activeDraft.unlockDate ?? null
          : null;
        const nextDiaryPreludeStatus = this.activeDraft.type === "diary"
          ? normalizeDiaryPreludeStatus(
              patch.diaryPreludeStatus ?? this.activeDraft.diaryPreludeStatus,
              {
                isNewDiaryDraft: false,
                prelude: nextPrelude,
              },
            )
          : "skipped";

        if (
          (patch.title ?? this.activeDraft.title) === this.activeDraft.title
          && (patch.content ?? this.activeDraft.content) === this.activeDraft.content
          && nextUnlockDate === (this.activeDraft.type === "future" ? this.activeDraft.unlockDate ?? null : null)
          && areDraftAttachmentsEqual(nextAttachments, this.activeDraft.attachments)
          && nextDiaryPreludeStatus === this.activeDraft.diaryPreludeStatus
          && areDiaryPreludesEqual(nextPrelude, this.activeDraft.diaryPrelude)
        ) {
          return this.activeDraft;
        }

        const nextDraft = markDraftBackgroundSaved({
          ...this.activeDraft,
          title: patch.title ?? this.activeDraft.title,
          content: patch.content ?? this.activeDraft.content,
          unlockDate: nextUnlockDate,
          attachments: nextAttachments,
          diaryPreludeStatus: nextDiaryPreludeStatus,
          diaryPrelude: nextPrelude,
        });

        await draftRepository.save(nextDraft);
        this.upsertDraft(nextDraft);
        return nextDraft;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to save draft.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async removeDraft(slotKey: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const targetDraft = this.drafts[slotKey] ?? await draftRepository.getBySlotKey(slotKey);
        const managedPaths = collectManagedLocalAttachmentPaths(targetDraft?.attachments);

        await removeManagedLocalFiles(managedPaths);
        await draftRepository.deleteBySlotKey(slotKey);
        clearDraftShadow(slotKey);
        delete this.drafts[slotKey];
        if (this.activeDraftKey === slotKey) {
          this.activeDraftKey = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to remove draft.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async saveActiveDraftAsEntry(): Promise<Entry | null> {
      if (!this.activeDraft) {
        return null;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const draft = this.activeDraft;
        const entry = createEntryFromDraft(draft);
        const entryRepository = getEntryRepository();
        const previousLinkedEntry = draft.linkedEntryId
          ? await entryRepository.getById(draft.linkedEntryId)
          : null;

        await entryRepository.save(entry);

        try {
          await this.removeDraft(draft.slotKey);
        } catch (cleanupError) {
          if (previousLinkedEntry) {
            await entryRepository.save(previousLinkedEntry);
          } else {
            await entryRepository.deleteById(entry.id);
          }

          throw cleanupError;
        }

        useEntryStore().upsertEntry(entry);
        clearDraftShadow(draft.slotKey);
        return entry;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to save draft as entry.";
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    async restoreEntryAsActiveDraft(entry: Entry): Promise<Draft> {
      this.isLoading = true;
      this.error = null;

      try {
        const draft = createDraft({
          type: entry.type,
          recordDate: entry.type === "diary" ? entry.recordDate : entry.recordDate ?? undefined,
          linkedEntryId: entry.id,
        });
        const nextDraft: Draft = {
          ...draft,
          createdAt: entry.createdAt,
          title: entry.title ?? "",
          content: entry.content,
          recordDate: entry.recordDate,
          unlockDate: entry.type === "future" ? entry.unlockDate ?? null : null,
          attachments: (entry.attachments ?? []).map((attachment, index) => ({
            ...attachment,
            entryId: null,
            draftKey: draft.slotKey,
            sortOrder: index,
          })),
          diaryPreludeStatus: entry.type === "diary"
            ? normalizeDiaryPreludeStatus(entry.diaryPreludeStatus, {
                isNewDiaryDraft: false,
                prelude: entry.diaryPrelude,
              })
            : "skipped",
          diaryPrelude: cloneDiaryPrelude(entry.diaryPrelude),
        };

        await draftRepository.save(nextDraft);
        this.upsertDraft(nextDraft);
        this.setActiveDraftKey(nextDraft.slotKey);
        return nextDraft;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to restore entry into draft.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async resumeEntry(entryId: string): Promise<Draft | null> {
      this.isLoading = true;
      this.error = null;

      try {
        const entryStore = useEntryStore();
        const entry = await entryStore.fetchEntryById(entryId);

        if (!entry) {
          this.error = entryStore.error ?? "Entry not found.";
          return null;
        }

        if (entry.type === "future") {
          this.error = "Future letters cannot be resumed for editing.";
          return null;
        }

        return await this.restoreEntryAsActiveDraft(entry);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to resume entry.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    setActiveDraftKey(slotKey: string | null) {
      this.activeDraftKey = slotKey;
    },
  },
});
