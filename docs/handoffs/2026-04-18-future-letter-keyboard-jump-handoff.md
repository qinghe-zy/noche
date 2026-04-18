# Future Letter Keyboard Jump Handoff - 2026-04-18

## Current conclusion

This round focused on the future-letter editor in `D:\Project\Eyotv2`, specifically the bug where tapping into the body and opening the keyboard can jump the page back to the first line.

Progress was made, but the issue was **not yet confirmed resolved by user validation**. Several likely causes were removed, and the codebase is in a cleaner, more unified state than before.

## What was completed

### 1. Shared deferred keyboard viewport sync logic was extracted

New shared helper:

- `src/features/editor/composables/useDeferredKeyboardViewportSync.ts`

What it does:

- centralizes the "wait until keyboard viewport measurement is ready, then run sync" behavior
- is now used by:
  - `src/features/editor/components/DiaryEditorShell.vue`
  - `src/features/editor/components/JottingEditorShell.vue`
  - `src/features/editor/components/FutureLetterEditorShell.vue`

Intent:

- reduce drift between the three editors
- keep diary / jotting stable while narrowing future-letter-specific issues

### 2. Future-letter shell was moved away from permanently controlled scroll-top behavior

Key file:

- `src/features/editor/components/FutureLetterEditorShell.vue`

Implemented behavior:

- future letter now uses:
  - `writingScrollTop` as the current real scroll state
  - `programmaticWritingScrollTop` only for temporary programmatic corrections
  - `writingScrollTopBinding` as the actual `:scroll-top` binding
- added `@scroll="handleWritingScroll"` so real scroll state is continuously tracked
- added temporary programmatic scroll guard state:
  - `isProgrammaticWritingScroll`
  - `programmaticWritingScrollTop`
  - `setProgrammaticWritingScrollTop()`

Intent:

- avoid the previous "manual scroll stop -> reactive writeback -> light jitter" loop
- match the diary / jotting pattern more closely

### 3. Future-letter keyboard-visible watcher was softened

Earlier, future letter had a more aggressive path during keyboard open:

- it forced programmatic sync during `keyboardVisible -> true`

That was changed so it no longer uses the previous forced path on keyboard-open.

Additional protective change:

- before requesting keyboard viewport sync on `visible === true`, future letter now temporarily pins the current scroll position:
  - `setProgrammaticWritingScrollTop(writingScrollTop.value);`

Intent:

- prevent the scroll-view from losing its current position during the keyboard-open resize phase

### 4. Future-letter old interactive height animation path was removed

Key file:

- `src/features/editor/components/FutureLetterEditorShell.vue`

Removed / changed:

- removed template binding:
  - `:style="interactiveLayerStyle"`
- removed computed:
  - `interactiveLayerStyle`
- changed CSS for:
  - `.editor-page__interactive-layer`

Current CSS direction:

- stable flex-based remaining area
- no dynamic height animation at that layer

Reason:

- this layer was still behaving unlike diary / jotting
- keyboard-open could trigger a resize / transition path before scroll state stabilized

### 5. Diary no longer auto-opens the keyboard on entering edit mode or continue-write

Key file:

- `src/features/editor/pages/EditorPage.vue`

Current behavior:

- `requestBodyFocusIfNeeded()` now returns early for:
  - `future`
  - `jotting`
  - `diary`

Result:

- diary entering edit mode no longer auto-focuses the body
- diary continue-write no longer auto-focuses the body

## Current bug still open

The user still reported:

- future-letter editor can still jump back to the first line when the keyboard is opened from the body

Important nuance:

- this appears to happen specifically during keyboard popup
- not just from normal manual scroll
- not just from blank-spacer focus-end behavior

## Root-cause analysis completed so far

The following hypotheses were tested and partially eliminated:

### Eliminated / reduced suspects

1. **Over-broad focus-end behavior**
   - future letter already limited focus-end to blank spacer only
   - this was not the main cause of the keyboard-open jump

2. **Aggressive forced sync during keyboard-open**
   - future letter previously used a more aggressive `force: true` path
   - this was removed / softened
   - user still reported the jump

3. **Permanently controlled `scroll-top` causing light jitter**
   - future letter was moved to temporary programmatic binding only
   - this addressed the light jitter symptom
   - but did not fully eliminate the keyboard-open jump

4. **Old interactive-layer dynamic height animation**
   - this was removed so the future-letter shell more closely matches diary's stable structure
   - after this change, the issue still had not been confirmed resolved

### Most likely remaining investigation area

The next likely place to inspect is the **interaction between keyboard popup timing and the future-letter shell's own `textarea` / `scroll-view` measurement cycle**, especially:

- `handleFocus()`
- `watch(() => props.cursorPosition, ...)`
- `watch(() => props.keyboardVisible, ...)`
- `measureLayout()`
- `flushPendingKeyboardViewportSync()`
- the exact order in which:
  - real scroll position
  - cursor position
  - measured viewport height
  - programmatic `scroll-top`
  are updated during keyboard popup

In other words:

- the structural suspects were largely removed
- the remaining likely cause is **timing/order-of-operations during keyboard-open**

## Files touched in this round

Primary implementation files:

- `src/features/editor/composables/useDeferredKeyboardViewportSync.ts`
- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/JottingEditorShell.vue`
- `src/features/editor/components/FutureLetterEditorShell.vue`
- `src/features/editor/pages/EditorPage.vue`

Tests updated / added:

- `tests/features/deferredKeyboardViewportSync.test.ts`
- `tests/release/editorKeyboardViewportShells.test.ts`
- `tests/release/futureEditorScrollAnimation.test.ts`
- `tests/release/jottingEditorStitchParity.test.ts`

## Verification completed

Passed in `D:\Project\Eyotv2` after the latest changes:

- `pnpm type-check`
- `pnpm test:unit`

Latest result:

- `88` test files passed
- `322` tests passed

## Boundaries / intent to preserve

Please preserve:

- diary and jotting current behavior
- diary no longer auto-opening keyboard on initial edit / continue-write
- future letter keeping native caret taps for body text
- only blank spacer using `focus-end-request`

Avoid:

- unrelated refactors
- domain-layer changes
- copy / i18n changes
- re-expanding future-letter-specific experimental logic unless clearly justified

## Best next step for the new chat

Do **not** restart from generic analysis.

Start from the current remaining hypothesis:

- inspect the timing/order of `keyboardVisible`, `cursorPosition`, `measureLayout`, `flushPendingKeyboardViewportSync`, and `scroll-top` writes in `FutureLetterEditorShell.vue`
- add a tight failing test first
- then do the smallest possible fix

## Suggested new-chat starter prompt

Use the prompt below in the next conversation:

> 继续处理 `D:\\Project\\Eyotv2` 的未来信编辑器键盘弹起回到首行问题。  
> 先读取并遵守：  
> - `D:\\Project\\Eyotv2\\docs\\handoffs\\2026-04-18-future-letter-keyboard-jump-handoff.md`  
> - 仓库内 `AGENTS.md`  
> - 默认启用 `karpathy-guidelines`  
> - 用 TDD 方式工作：先补失败态测试，再改代码  
>   
> 当前要求：  
> 1. 不要重做已经完成的通用分析，直接从 handoff 里的“remaining investigation area”继续。  
> 2. 优先排查 `src/features/editor/components/FutureLetterEditorShell.vue` 在键盘 popup 时的时序问题：  
>    - `handleFocus()`  
>    - `watch(() => props.cursorPosition, ...)`  
>    - `watch(() => props.keyboardVisible, ...)`  
>    - `measureLayout()`  
>    - `flushPendingKeyboardViewportSync()`  
> 3. 目标是修掉“未来信编辑页点击正文唤出键盘会回到首行”的问题。  
> 4. 不要改变 diary / jotting 当前逻辑。  
> 5. diary 仍然必须保持：进入编辑页和点继续写时不自动弹键盘。  
> 6. 每完成一个关键阶段简短汇报。  
> 7. 完成后必须跑：  
>    - `pnpm type-check`  
>    - `pnpm test:unit`
