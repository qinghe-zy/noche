# HANDOFF 07 - Codex to Gemini: Home UI

## Context

- Project: noche
- Current phase: first UI implementation after core model and entry store loop
- Suggested target directory for Gemini: `src/features/home/**`
- Do not modify in this pass:
  - `src/domain/**`
  - `src/data/**`
  - `src/app/store/**`
  - root config files
  - `docs/tech/**`

## Stable Inputs

- Routes are defined in `src/pages.json`.
- Home page entry file: `src/features/home/pages/HomePage.vue`.
- Canonical tech rules:
  - `docs/tech/architecture.md`
  - `docs/tech/data_model.md`
  - `docs/tech/ai_workflow.md`
- Entry model:
  - `EntryType`: `diary | jotting | future`
  - `EntryStatus`: `saved | sealed | unlocked`
  - Future unlock field: `unlockDate`
- Draft slots:
  - `draft_diary_YYYY-MM-DD`
  - `draft_jotting`
  - `draft_future`
- Store available for future wiring:
  - `useEntryStore`
  - actions: `saveEntry`, `fetchEntriesByDate`, `destroyEntry`
  - getter: `entryList`

## What Gemini Should Do

- Implement the first real Home page UI in `src/features/home/pages/HomePage.vue`.
- It should feel like the entry point to a quiet private writing app.
- Include clear navigation affordances for:
  - today diary / today letter paper
  - jotting
  - future letter
  - mailbox
  - profile
- Keep the UI creative and polished; do not wait for Codex to prescribe exact visual layout.

## Hard Constraints

- Do not change core business rules.
- Do not change domain/data/store code.
- Do not add new dependencies without handing back to Codex.
- Do not implement real persistence in the page.
- Avoid bottom navigation on Home.
- Avoid turning Home into a feed or dashboard.

## Output Expected

- Modified Home page files only, unless Gemini creates small Home-local components under `src/features/home/components/**`.
- Brief note of files changed and any assumptions.

## Codex Follow-up

- Review Gemini diff.
- Run:
  - `pnpm test:unit`
  - `pnpm type-check`
  - `pnpm build:h5`
- Adjust only integration or compile issues, preserving Gemini's visual direction where possible.
