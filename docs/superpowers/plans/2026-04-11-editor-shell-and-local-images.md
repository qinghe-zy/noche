# Editor Shell And Local Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split Editor into diary / jotting / future visual shells, add local-first image attachments, and keep shared draft/save/read semantics intact.

**Architecture:** Keep `src/features/editor/pages/EditorPage.vue` as the route-level orchestrator, then dispatch into `DiaryEditorShell`, `JottingEditorShell`, and `FutureLetterEditorShell`. Upgrade `Entry` and `Draft` to carry typed image attachments, persist them through local repositories, and keep empty-save/title rules in domain services so all shells share one save contract.

**Tech Stack:** Uni-app, Vue 3, TypeScript, Pinia, Vitest, uni local file APIs, uni storage-backed repositories

---

## File Map

- Modify: `D:\Project\noche\AGENTS.md`
- Modify: `D:\Project\noche\docs\spec\interaction_rules.md`
- Modify: `D:\Project\noche\docs\tech\ai_workflow.md`
- Modify: `D:\Project\noche\docs\tech\data_model.md`
- Modify: `D:\Project\noche\docs\tech\noche_codex_function_matrix_and_interaction_logic.md`
- Create: `D:\Project\noche\docs\handoffs\CHECKPOINT_34_editor_shell_split_and_local_image_scope.md`
- Create: `D:\Project\noche\src\shared\types\attachment.ts`
- Create: `D:\Project\noche\src\shared\utils\storage.ts`
- Create: `D:\Project\noche\src\data\repositories\storageDraftRepository.ts`
- Create: `D:\Project\noche\src\data\repositories\storageEntryRepository.ts`
- Create: `D:\Project\noche\src\data\repositories\storagePrefsRepository.ts`
- Create: `D:\Project\noche\src\features\editor\composables\useEditorImagePicker.ts`
- Create: `D:\Project\noche\src\features\editor\composables\useEditorImageAttachments.ts`
- Create: `D:\Project\noche\src\features\editor\components\DiaryEditorShell.vue`
- Create: `D:\Project\noche\src\features\editor\components\JottingEditorShell.vue`
- Create: `D:\Project\noche\src\features\editor\components\FutureLetterEditorShell.vue`
- Modify: `D:\Project\noche\src\domain\entry\types.ts`
- Modify: `D:\Project\noche\src\domain\draft\types.ts`
- Modify: `D:\Project\noche\src\domain\entry\rules.ts`
- Modify: `D:\Project\noche\src\domain\services\draftService.ts`
- Modify: `D:\Project\noche\src\domain\services\entryService.ts`
- Modify: `D:\Project\noche\src\app\providers\bootstrapAppRuntime.ts`
- Modify: `D:\Project\noche\src\app\store\useDraftStore.ts`
- Modify: `D:\Project\noche\src\features\editor\pages\EditorPage.vue`
- Modify: `D:\Project\noche\src\data\mappers\draftMapper.ts`
- Modify: `D:\Project\noche\src\data\mappers\entryMapper.ts`
- Modify: `D:\Project\noche\src\data\db\schema.ts`
- Test: `D:\Project\noche\tests\domain\entryService.test.ts`
- Test: `D:\Project\noche\tests\app\draftStore.test.ts`
- Test: `D:\Project\noche\tests\app\bootstrapAppRuntime.test.ts`
- Test: `D:\Project\noche\tests\release\editorStitchParity.test.ts`
- Create: `D:\Project\noche\tests\data\storageDraftRepository.test.ts`
- Create: `D:\Project\noche\tests\data\storageEntryRepository.test.ts`
- Create: `D:\Project\noche\tests\features\editorImageAttachments.test.ts`
- Create: `D:\Project\noche\tests\release\diaryEditorStitchParity.test.ts`
- Create: `D:\Project\noche\tests\release\jottingEditorStitchParity.test.ts`

## Task 1: Replace Truth-Source Docs

- [ ] Update repo rules and product docs so three editor shells plus local image attachments become the new source of truth.
- [ ] Record the new phase shift in `CHECKPOINT_34_editor_shell_split_and_local_image_scope.md`.

## Task 2: Lock Attachment Behavior With Failing Tests

- [ ] Extend `tests/domain/entryService.test.ts` with failing cases for:
  - text empty + image present can save
  - no text + no image cannot save
  - diary / jotting / future image-only title fallback
- [ ] Extend `tests/app/draftStore.test.ts` with failing cases for:
  - draft save persists attachments
  - draft restore resumes attachments
  - entry formal save carries attachments

## Task 3: Add Attachment Types And Persistence

- [ ] Create `src/shared/types/attachment.ts`.
- [ ] Upgrade `Entry` and `Draft` types to include `attachments`.
- [ ] Add storage-backed draft / entry / prefs repositories for local-first persistence.
- [ ] Switch default bootstrap runtime from in-memory demo repos to local storage-backed repos while preserving test injection.

## Task 4: Add Local Image Selection Utilities

- [ ] Implement `useEditorImagePicker.ts` using official uni image APIs.
- [ ] Use `uni.chooseImage` and persist chosen files locally.
- [ ] On platforms where `uni.saveFile` is unavailable, provide a local fallback that still survives app reload in the supported runtime.

## Task 5: Split Editor Into Three Shells

- [ ] Keep `EditorPage.vue` as orchestrator.
- [ ] Create `DiaryEditorShell.vue` using `docs/stitch/diary_editor`.
- [ ] Create `JottingEditorShell.vue` using `docs/stitch/minimalist_jotting_editor`.
- [ ] Extract current future editor surface into `FutureLetterEditorShell.vue`.
- [ ] Reuse Stitch image icon source code exactly for clickable image triggers.

## Task 6: Update Release Tests And Verify

- [ ] Keep future parity coverage.
- [ ] Add diary parity coverage.
- [ ] Add jotting parity coverage.
- [ ] Remove the old assumption that all three types share one stationery DOM.
- [ ] Run:
  - `pnpm test:unit`
  - `pnpm type-check`
  - `pnpm build:h5`
- [ ] Capture before / after screenshots and write the next checkpoint.
