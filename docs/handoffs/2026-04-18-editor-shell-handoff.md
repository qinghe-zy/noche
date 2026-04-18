# Editor Shell Handoff - 2026-04-18

## Current conclusion

This round continued the editor header compression work for `D:\Project\Eyotv2` and synchronized the resulting code into the GitHub repo `https://github.com/qinghe-zy/noche.git`.

The GitHub `main` branch was updated successfully with commit:

- `8bfe68e` - `sync Eyotv2 workspace`

## What was completed

### 1. Diary shell compression was aligned with jotting

Key files changed:

- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/DiaryPreludeHeaderMeta.vue`
- `tests/release/editorKeyboardViewportShells.test.ts`
- `tests/release/editorAttachmentDockParity.test.ts`
- `tests/release/diaryEditorStitchParity.test.ts`

Implemented behavior:

- Diary read mode now uses a collapsing header shell pattern aligned with jotting.
- Diary edit mode also uses the collapsing shell structure.
- Collapsed diary state keeps:
  - back button
  - date
  - title
  - weather / mood icons
  - image button
  - save button
- Collapsed diary state does not keep subtitle or time.
- Weather / mood icons were routed through `DiaryPreludeHeaderMeta` compact rendering and placed after the title.
- Image entry was moved to the top bar instead of being duplicated in the body area.

### 2. Keyboard-phase free scrolling bug in diary edit shell was fixed

Root cause identified:

- `DiaryEditorShell.vue` had `isEditShellScrollLocked = keyboardVisible`, but the outer edit shell still used:
  - `:scroll-y="editCanShellScroll"`
- That meant the shell could still be manually scrolled while the keyboard was visible.

Fix applied:

- Changed diary edit shell outer scroll binding to:
  - `:scroll-y="!isEditShellScrollLocked && editCanShellScroll"`

Verification:

- Added a release test expectation in `tests/release/editorKeyboardViewportShells.test.ts`
- Confirmed the new expectation failed before the fix and passed after the fix

## Verification completed

### In `D:\Project\Eyotv2`

Passed:

- `pnpm type-check`
- `pnpm test:unit`

Result at that point:

- `87` test files
- `319` tests passed

### In `D:\Project\noche` before pushing

Passed:

- `pnpm type-check`
- targeted editor-related tests:
  - `tests/features/jottingContinuousCollapse.test.ts`
  - `tests/release/diaryEditorStitchParity.test.ts`
  - `tests/release/editorAttachmentDockParity.test.ts`
  - `tests/release/editorKeyboardViewportShells.test.ts`
  - `tests/release/jottingEditorLayoutParity.test.ts`
  - `tests/release/jottingEditorStitchParity.test.ts`
  - `tests/release/jottingReadCollapseParity.test.ts`

Those targeted checks passed after conflict resolution during the push integration.

Notes:

- Full `pnpm test:unit` in `D:\Project\noche` was not green because that repo has additional expectations beyond `Eyotv2`.
- The push to GitHub was still completed by integrating onto remote `origin/main` and validating the editor-focused test slice.

## Important current bug still open

The user reported a new problem after the previous push:

- when entering edit mode, no matter where the user taps, the page first jumps to the top
- when the keyboard opens, the page should not visibly jump

This was analyzed but not yet implemented.

## Root-cause analysis for the still-open bug

Likely root causes were identified:

### 1. Forced focus-to-end path is still being used too broadly

Relevant file:

- `src/features/editor/pages/EditorPage.vue`

Current behavior:

- `handleFocusEndRequest()` always sets:
  - `contentSelectionCursor = content.length`
  - `cursorPosition = content.length`
  - then increments `focusEndRequestKey`

Problem:

- If a shell emits `focus-end-request` for general body taps, the user’s real tap intent gets overwritten by "move cursor to end".
- That can cause the shell to perform a programmatic scroll before native caret placement stabilizes.

### 2. Shell-level programmatic scroll can fire too early during keyboard opening

Relevant files:

- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/JottingEditorShell.vue`

Current pattern:

- `handleTextareaTap()` stores a tap anchor
- `handleTextareaFocus()` and keyboard watchers call `syncWritingScroll()`
- if keyboard opening and viewport measurement / caret state are not yet stable, a programmatic `scroll-top` update can happen too early

Observed effect:

- visible jump during keyboard open
- apparent first jump to top / default position before settling

## Recommended next implementation plan

### Step 1. Split "focus end" from "tap inside text"

Do not let all body taps emit `focus-end-request`.

Expected behavior:

- tapping actual text area:
  - keep native caret placement
  - do not force cursor to end
- tapping blank spacer at bottom:
  - still allow focus-to-end behavior

### Step 2. Narrow shell click bindings

In both:

- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/JottingEditorShell.vue`

Adjust structure so:

- text region uses textarea-native tap behavior
- blank spacer alone triggers `focus-end-request`

### Step 3. Guard the first keyboard-open scroll sync

When keyboard changes from hidden to visible:

- do not immediately force `syncWritingScroll()` unless:
  - caret position for this interaction is known
  - viewport measurement is ready

Goal:

- prevent visible first-frame jump

### Step 4. Audit jotting for the same issue

Even after the diary shell scroll lock fix, jotting should also be checked for:

- keyboard-phase outer-shell free scrolling
- body tap causing focus-to-end too broadly
- early programmatic scroll during focus

## Boundaries to keep

Do not change unless truly necessary:

- `DiaryPreludePicker.vue`
- domain layer
- copy / i18n text
- unrelated layout pages

Keep edits focused on:

- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/JottingEditorShell.vue`
- `src/features/editor/pages/EditorPage.vue`
- only the directly related tests

## Suggested TDD path for the next round

1. Add failing release / behavior tests for:
   - body tap should not always force focus end
   - keyboard-open should not rebase shell scroll to a default/top position
2. Make diary pass first
3. Mirror the fix into jotting
4. Run:
   - `pnpm type-check`
   - `pnpm test:unit`

## Next-chat starter prompt

Use the prompt below in the next conversation to continue from this point without redoing the whole analysis.
