# HANDOFF 08 - Codex to Gemini - Editor UI

## Goal

Implement the first real editor page under `src/features/editor/**` so the app has a minimal runnable `editor / draft / save / read` loop.

## Write Boundary

- Only edit `src/features/editor/**`
- Do not touch `src/domain/**`
- Do not touch `src/data/**`
- Do not touch `src/app/store/**`
- Do not touch root config, package.json, routes outside editor feature

## Stable Interfaces

- Route:
  - page path already exists: `features/editor/pages/EditorPage`
  - query param: `type=diary | jotting | future`
- Draft store:
  - `const draftStore = useDraftStore()`
  - `await draftStore.openDraft({ type, recordDate? })`
  - `await draftStore.saveActiveDraft({ title, content, unlockDate? })`
  - `await draftStore.removeDraft(slotKey)`
  - `draftStore.activeDraft`
  - `draftStore.isLoading`
  - `draftStore.error`
- Entry save:
  - `const entryStore = useEntryStore()`
  - `const entry = createEntryFromDraft(draftStore.activeDraft!)`
  - `await entryStore.saveEntry(entry)`

## Functional Outcomes

- Page must work for `diary`, `jotting`, and `future`
- On page load, open the correct draft slot from the route type
- User can edit title/content
- For `future`, user can set `unlockDate`
- Editing should persist draft through `saveActiveDraft`
- User can formally save the draft into an entry
- After formal save, the page should enter a clear readable state in the same page
- It is fine if the read state is simple; no mailbox/calendar work is needed

## Constraints

- Keep it pure CSS, no SCSS
- No new dependencies
- No emoji icons
- Prefer a bold, intentional page, but do not overbuild
- Closed loop first, polish second

## Avoid

- Do not redesign stores or domain models
- Do not add unrelated pages or cross-feature abstractions
- Do not block on perfect autosave logic; simple explicit persistence is acceptable
