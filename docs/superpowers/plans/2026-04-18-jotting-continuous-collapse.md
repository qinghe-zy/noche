# Jotting Continuous Collapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild both jotting read and edit shells so the header collapses continuously, while edit mode keeps the caret stable when the keyboard opens.

**Architecture:** Split `JottingEditorShell.vue` into independent read/edit branches. Both branches use a full-screen shell `scroll-view`, fixed-height spacer, and fixed overlay header; read mode drives collapse directly from page scroll, while edit mode freezes outer collapse during keyboard use and routes caret-follow into a separate inner body scroll. Shared math helpers live in `jottingContinuousCollapse.ts`, and release tests guard the template structure and timing markers.

**Tech Stack:** Vue 3 `script setup`, uni-app `scroll-view`, TypeScript, Vitest string-guard release tests

---

## File Map

**Modify**

- `src/features/editor/components/JottingEditorShell.vue`
  - Split read and edit template branches
  - Add read-only refs/computed/measurement handlers
  - Keep existing edit-mode keyboard and caret logic intact
- `src/features/editor/jottingContinuousCollapse.ts`
  - Add `estimateJottingTextWidth`
  - Keep interpolation/progress helpers as the math home for read-mode collapse
- `tests/features/jottingContinuousCollapse.test.ts`
  - Add unit coverage for `estimateJottingTextWidth`
- `tests/release/jottingEditorLayoutParity.test.ts`
  - Keep existing edit-layout guards and add read-mode structure guards
- `tests/release/jottingEditorStitchParity.test.ts`
  - Guard that edit flow still keeps the existing stitch/title/image trigger wiring

**Create**

- `tests/release/jottingReadCollapseParity.test.ts`
  - Guard the new read-branch shell structure, overlay metrics, and continue-write flow markers

**Verify**

- `pnpm test:unit -- tests/features/jottingContinuousCollapse.test.ts tests/release/jottingEditorLayoutParity.test.ts tests/release/jottingEditorStitchParity.test.ts tests/release/jottingReadCollapseParity.test.ts`
- `pnpm type-check`

## Task 1: Lock the collapse math and width estimation

**Files:**
- Modify: `tests/features/jottingContinuousCollapse.test.ts`
- Modify: `src/features/editor/jottingContinuousCollapse.ts`

- [ ] **Step 1: Write the failing unit tests for text-width estimation**

```ts
it("estimates empty text as zero width", () => {
  expect(estimateJottingTextWidth("", 26)).toBe(0);
});

it("scales width estimation with font size", () => {
  expect(estimateJottingTextWidth("4月18日", 52)).toBeGreaterThan(
    estimateJottingTextWidth("4月18日", 26),
  );
});

it("gives Latin month abbreviations a stable finite width", () => {
  const width = estimateJottingTextWidth("Apr 18", 26);
  expect(width).toBeGreaterThan(0);
  expect(Number.isFinite(width)).toBe(true);
});
```

- [ ] **Step 2: Run the targeted unit test to verify it fails**

Run:

```bash
pnpm test:unit -- tests/features/jottingContinuousCollapse.test.ts
```

Expected:

```text
FAIL  tests/features/jottingContinuousCollapse.test.ts
ReferenceError or export error mentioning estimateJottingTextWidth
```

- [ ] **Step 3: Add the minimal `estimateJottingTextWidth` implementation**

```ts
export function estimateJottingTextWidth(text: string, fontSize: number): number {
  if (!text || !Number.isFinite(fontSize) || fontSize <= 0) {
    return 0;
  }

  let width = 0;

  for (const char of text) {
    if (/[\u4e00-\u9fff\u3040-\u30ff]/.test(char)) {
      width += fontSize;
      continue;
    }

    if (/[A-Z]/.test(char)) {
      width += fontSize * 0.68;
      continue;
    }

    if (/[a-z0-9]/.test(char)) {
      width += fontSize * 0.56;
      continue;
    }

    width += fontSize * 0.38;
  }

  return Math.max(width, 0);
}
```

- [ ] **Step 4: Re-run the unit test to verify it passes**

Run:

```bash
pnpm test:unit -- tests/features/jottingContinuousCollapse.test.ts
```

Expected:

```text
PASS  tests/features/jottingContinuousCollapse.test.ts
```

- [ ] **Step 5: Checkpoint**

Suggested commit message if this work is later moved into a git worktree:

```bash
git commit -m "test: cover jotting collapse width estimation"
```

## Task 2: Add release guards for the new read shell

**Files:**
- Modify: `tests/release/jottingEditorLayoutParity.test.ts`
- Create: `tests/release/jottingReadCollapseParity.test.ts`

- [ ] **Step 1: Write the failing release guards for read-mode branch separation**

```ts
it("splits jotting read and edit mode into separate top-level branches", () => {
  const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

  expect(jottingShell).toContain('v-if="mode === \\'read\\'"');
  expect(jottingShell).toContain('v-else');
  expect(jottingShell).toContain("jotting-shell-read__scroll");
  expect(jottingShell).toContain("jotting-shell-read__overlay");
});
```

```ts
it("keeps read titles only in the overlay and not in the paper body", () => {
  const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

  expect(jottingShell).toContain("jotting-shell-read__title");
  expect(jottingShell).not.toContain("jotting-editor-shell__read-title");
});
```

```ts
it("guards the continue-write return-to-top flow in read mode", () => {
  const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");

  expect(jottingShell).toContain("isTransitioningToEdit");
  expect(jottingShell).toContain("readScrollWithAnimation");
  expect(jottingShell).toContain("setTimeout(() => {");
  expect(jottingShell).toContain("emit(\"continue-write\")");
});
```

- [ ] **Step 2: Run the release guards to verify they fail before implementation**

Run:

```bash
pnpm test:unit -- tests/release/jottingEditorLayoutParity.test.ts tests/release/jottingReadCollapseParity.test.ts
```

Expected:

```text
FAIL  tests/release/jottingEditorLayoutParity.test.ts
FAIL  tests/release/jottingReadCollapseParity.test.ts
Assertions missing new read shell markers
```

- [ ] **Step 3: Keep the test language aligned with current file naming**

Use the existing helper pattern from release tests:

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}
```

- [ ] **Step 4: Re-run the release guards after the code changes land**

Run:

```bash
pnpm test:unit -- tests/release/jottingEditorLayoutParity.test.ts tests/release/jottingReadCollapseParity.test.ts
```

Expected:

```text
PASS  tests/release/jottingEditorLayoutParity.test.ts
PASS  tests/release/jottingReadCollapseParity.test.ts
```

- [ ] **Step 5: Checkpoint**

Suggested commit message:

```bash
git commit -m "test: guard jotting read collapse shell"
```

## Task 3: Split the shell into read/edit branches without disturbing edit mode

**Files:**
- Modify: `src/features/editor/components/JottingEditorShell.vue`
- Modify: `tests/release/jottingEditorStitchParity.test.ts`

- [ ] **Step 1: Make the edit branch explicit and keep the current edit subtree intact**

The new template shape should start like this:

```vue
<template>
  <view class="jotting-editor-shell" :class="themeClass">
    <template v-if="mode === 'read'">
      <!-- new read shell -->
    </template>

    <template v-else>
      <view class="jotting-editor-shell__fixed-layer">
        <view class="jotting-editor-shell__top-icons" :style="topbarStyle">
          <TopbarIconButton @tap="$emit('go-back')" />
          <view class="jotting-editor-shell__icon-button" @tap="$emit('formal-save')">
            <AppIcon name="check" class="jotting-editor-shell__icon-svg" />
          </view>
        </view>
      </view>

      <view class="jotting-editor-shell__interactive-layer" :style="interactiveLayerShellStyle">
        <!-- existing edit card/body/textarea subtree -->
      </view>
    </template>
  </view>
</template>
```

- [ ] **Step 2: Guard the stitch parity test so it still checks the edit wiring**

Add or keep expectations like:

```ts
expect(jottingShell).toContain("jotting-editor-shell__title-input");
expect(jottingShell).toContain("@input=\"$emit('title-input', $event)\"");
expect(jottingShell).toContain("jotting-editor-shell__meta-image-button");
```

Do not add read-mode expectations to this test; keep it focused on edit wiring.

- [ ] **Step 3: Run the edit-focused release test before touching read logic further**

Run:

```bash
pnpm test:unit -- tests/release/jottingEditorStitchParity.test.ts
```

Expected:

```text
PASS  tests/release/jottingEditorStitchParity.test.ts
```

- [ ] **Step 4: Preserve edit-only watchers and helpers behind mode guards where needed**

If a watcher now runs for both branches, guard it:

```ts
watch(
  () => [props.attachments.length, props.mode],
  () => {
    if (props.mode !== "edit") {
      return;
    }

    measureHeights();
  },
);
```

The goal here is not to redesign edit mode. The goal is to leave edit behavior unchanged while making room for the new read branch.

- [ ] **Step 5: Checkpoint**

Suggested commit message:

```bash
git commit -m "refactor: split jotting read and edit shell branches"
```

## Task 4: Implement the read overlay, spacer, and interpolation state

**Files:**
- Modify: `src/features/editor/components/JottingEditorShell.vue`

- [ ] **Step 1: Add read-only refs and computed state**

Add the new state near the existing refs:

```ts
const readScrollTop = ref(0);
const readScrollWithAnimation = ref(false);
const readAnimatedScrollTop = ref(0);
const measuredPaperHeight = ref(0);
const measuredDateWidth = ref(0);
const isTransitioningToEdit = ref(false);
```

Add read-only derived state:

```ts
const collapseDistance = computed(() => Math.max(expandedMetaHeight.value, 1));

const collapseProgress = computed(() =>
  Math.min(Math.max(readScrollTop.value / collapseDistance.value, 0), 1),
);

const readCanScroll = computed(() =>
  measuredPaperHeight.value > Math.max(visibleWindowHeight.value - spacerHeight.value, 0),
);
```

- [ ] **Step 2: Build the read template with fixed spacer and overlay**

The read branch should include this skeleton:

```vue
<template v-if="mode === 'read'">
  <view class="jotting-shell-read">
    <scroll-view
      class="jotting-shell-read__scroll"
      :scroll-y="readCanScroll && !isTransitioningToEdit"
      :scroll-top="readAnimatedScrollTop"
      :scroll-with-animation="readScrollWithAnimation"
      @scroll="onReadScroll"
    >
      <view class="jotting-shell-read__spacer" :style="readSpacerStyle" />

      <view class="jotting-shell-read__paper" :style="readPaperStyle">
        <text class="jotting-shell-read__meta">{{ readMeta }}</text>
        <view v-if="attachments.length" class="jotting-shell-read__attachments">
          <!-- existing attachment card markup adapted for read mode -->
        </view>
        <text class="jotting-shell-read__content literary-text" :style="writingTextStyle">{{ content }}</text>
      </view>

      <text class="jotting-shell-read__signature" :style="{ opacity: stampOpacity }">{{ signatureLine }}</text>
      <view class="jotting-shell-read__bottom-pad" />
    </scroll-view>

    <view class="jotting-shell-read__overlay">
      <view class="jotting-shell-read__overlay-bg" :style="readOverlayBackgroundStyle" />
      <view class="jotting-shell-read__topbar" :style="topbarStyle">
        <TopbarIconButton @tap="$emit('go-back')" />
        <view
          v-if="canContinueWrite"
          class="jotting-editor-shell__continue-button"
          @tap="handleContinueWriteTap"
        >
          {{ continueWriteLabel }}
        </view>
        <view v-else class="jotting-editor-shell__spacer"></view>
      </view>
      <text class="jotting-shell-read__eyebrow" :style="readEyebrowStyle">{{ eyebrowLabel }}</text>
      <text ref="readDateRef" class="jotting-shell-read__date" :style="readDateStyle">{{ headlineDate }}</text>
      <text v-if="readTitle" class="jotting-shell-read__title" :style="readTitleStyle">{{ readTitle }}</text>
    </view>
  </view>
</template>
```

- [ ] **Step 3: Add the style interpolations through computed objects**

Build computed style objects rather than inline formulas scattered in template:

```ts
const readDateStyle = computed(() => ({
  top: `${interpolateJottingMetric({ progress: collapseProgress.value, from: dateExpandedTop.value, to: dateCollapsedTop.value })}px`,
  left: `${interpolateJottingMetric({ progress: collapseProgress.value, from: dateExpandedLeft.value, to: dateCollapsedLeft.value })}px`,
  fontSize: `${interpolateJottingMetric({ progress: collapseProgress.value, from: rpxToPx(60), to: rpxToPx(26) })}px`,
}));
```

```ts
const readTitleStyle = computed(() => ({
  left: `${interpolateJottingMetric({ progress: collapseProgress.value, from: titleExpandedLeft.value, to: collapsedTitleLeft.value })}px`,
  maxHeight: `${interpolateJottingMetric({ progress: titleClipProgress.value, from: expandedTitleMaxHeight.value, to: collapsedTitleLineHeight.value })}px`,
}));
```

Keep the same pattern for eyebrow, overlay background, and paper appearance.

- [ ] **Step 4: Run the targeted release guards after the read shell lands**

Run:

```bash
pnpm test:unit -- tests/release/jottingEditorLayoutParity.test.ts tests/release/jottingReadCollapseParity.test.ts tests/release/jottingEditorStitchParity.test.ts
```

Expected:

```text
PASS  tests/release/jottingEditorLayoutParity.test.ts
PASS  tests/release/jottingReadCollapseParity.test.ts
PASS  tests/release/jottingEditorStitchParity.test.ts
```

- [ ] **Step 5: Checkpoint**

Suggested commit message:

```bash
git commit -m "feat: add jotting read overlay collapse shell"
```

## Task 5: Add DOM measurement and scroll gating

**Files:**
- Modify: `src/features/editor/components/JottingEditorShell.vue`

- [ ] **Step 1: Measure paper height for scroll enablement**

Add a read-only measurement helper:

```ts
function measurePaperHeight(): void {
  if (props.mode !== "read" || !instance?.proxy || typeof uni?.createSelectorQuery !== "function") {
    return;
  }

  nextTick(() => {
    uni.createSelectorQuery()
      .in(instance.proxy)
      .select(".jotting-shell-read__paper")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];
        measuredPaperHeight.value = typeof rect?.height === "number" ? Math.max(rect.height, 0) : 0;
      });
  });
}
```

- [ ] **Step 2: Measure real collapsed date width after mount**

```ts
function measureCollapsedDateWidth(): void {
  if (props.mode !== "read" || !instance?.proxy || typeof uni?.createSelectorQuery !== "function") {
    return;
  }

  nextTick(() => {
    uni.createSelectorQuery()
      .in(instance.proxy)
      .select(".jotting-shell-read__date")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];
        if (typeof rect?.width === "number" && rect.width > 0) {
          measuredDateWidth.value = rect.width;
        }
      });
  });
}
```

Update the local helper type to:

```ts
type QueryRect = { height?: number | null; top?: number | null; width?: number | null };
```

- [ ] **Step 3: Wire the read-mode watchers**

```ts
watch(
  () => [props.content, props.attachments.length, props.mode, screenWidth.value],
  () => {
    if (props.mode !== "read") {
      return;
    }

    measurePaperHeight();
    measureCollapsedDateWidth();
  },
);
```

```ts
onMounted(() => {
  if (props.mode === "read") {
    measuredDateWidth.value = estimateJottingTextWidth(props.headlineDate, rpxToPx(26));
    measurePaperHeight();
    measureCollapsedDateWidth();
  }
});
```

- [ ] **Step 4: Re-run the unit and release tests**

Run:

```bash
pnpm test:unit -- tests/features/jottingContinuousCollapse.test.ts tests/release/jottingEditorLayoutParity.test.ts tests/release/jottingReadCollapseParity.test.ts
```

Expected:

```text
PASS  tests/features/jottingContinuousCollapse.test.ts
PASS  tests/release/jottingEditorLayoutParity.test.ts
PASS  tests/release/jottingReadCollapseParity.test.ts
```

- [ ] **Step 5: Checkpoint**

Suggested commit message:

```bash
git commit -m "feat: gate jotting read scroll with measured paper height"
```

## Task 6: Finish the continue-write transition and styling polish

**Files:**
- Modify: `src/features/editor/components/JottingEditorShell.vue`

- [ ] **Step 1: Implement the return-to-top continue-write handler**

```ts
function handleContinueWriteTap(): void {
  if (!props.canContinueWrite || isTransitioningToEdit.value) {
    return;
  }

  if (collapseProgress.value <= 0.05) {
    emit("continue-write");
    return;
  }

  isTransitioningToEdit.value = true;
  readScrollWithAnimation.value = true;
  readAnimatedScrollTop.value = 0;

  setTimeout(() => {
    isTransitioningToEdit.value = false;
    readScrollWithAnimation.value = false;
    readScrollTop.value = 0;
    emit("continue-write");
  }, 250);
}
```

- [ ] **Step 2: Route paper-body taps into the same handler without stealing attachment taps**

Use `.stop` on attachment taps and keep the paper handler on the read content container:

```vue
<view class="jotting-shell-read__paper" :style="readPaperStyle" @tap="handleContinueWriteTap">
  <view
    v-for="attachment in attachments"
    :key="attachment.id"
    class="jotting-shell-read__attachment-card"
    @tap.stop="$emit('preview-attachment', attachment.id)"
  >
```

- [ ] **Step 3: Add the new read-only CSS block**

The final stylesheet should include dedicated read classes like:

```css
.jotting-shell-read {
  position: relative;
  height: 100%;
}

.jotting-shell-read__scroll {
  position: relative;
  z-index: 1;
  height: 100%;
}

.jotting-shell-read__overlay {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 10;
  pointer-events: none;
}

.jotting-shell-read__overlay-bg {
  position: absolute;
  inset: 0 0 auto 0;
  background: var(--noche-bg);
}

.jotting-shell-read__date,
.jotting-shell-read__title,
.jotting-shell-read__eyebrow {
  position: absolute;
}
```

Keep button rows `pointer-events: auto` so the back and continue-write controls stay clickable.

- [ ] **Step 4: Run the full targeted verification and type-check**

Run:

```bash
pnpm test:unit -- tests/features/jottingContinuousCollapse.test.ts tests/release/jottingEditorLayoutParity.test.ts tests/release/jottingEditorStitchParity.test.ts tests/release/jottingReadCollapseParity.test.ts
pnpm type-check
```

Expected:

```text
PASS  tests/features/jottingContinuousCollapse.test.ts
PASS  tests/release/jottingEditorLayoutParity.test.ts
PASS  tests/release/jottingEditorStitchParity.test.ts
PASS  tests/release/jottingReadCollapseParity.test.ts
vue-tsc exits with code 0
```

- [ ] **Step 5: Final checkpoint**

Suggested commit message:

```bash
git commit -m "feat: finish jotting continuous collapse read transition"
```

## Self-Review

### Spec coverage

- Single-node interpolated `date/title`: covered in Tasks 2, 4, and 6
- Fixed spacer + full-screen read scroll shell: covered in Task 4
- `paper` height measurement and `readCanScroll`: covered in Task 5
- Estimated and measured date width for collapsed title alignment: covered in Tasks 1 and 5
- Continue-write return-to-top transition: covered in Task 6
- Edit-mode non-regression: covered in Tasks 3, 4, and 6 verification steps

### Placeholder scan

- No `TODO/TBD`
- No “write tests later” steps
- Every code-change step includes concrete code
- Every verification step includes an exact command

### Type consistency

- Read-state names are consistent across tasks:
  - `readScrollTop`
  - `readScrollWithAnimation`
  - `readAnimatedScrollTop`
  - `measuredPaperHeight`
  - `measuredDateWidth`
  - `isTransitioningToEdit`
- Shared helper name is consistent:
  - `estimateJottingTextWidth`

## Notes for this workspace

- The current directory is not a git repository, so the checkpoint steps cannot be executed verbatim here.
- If this work is moved into a git worktree later, use the suggested commit messages at each checkpoint.
