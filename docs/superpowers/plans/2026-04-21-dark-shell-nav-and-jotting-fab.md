# Dark Shell Navigation And Jotting FAB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dark shell bottom navigation and the jotting floating action button to match the approved `stitch_menu` direction without changing behavior or affecting light mode.

**Architecture:** Keep all existing dark shell routing and local tab behavior in `DarkShellPage.vue`, but replace the current symbolic tab presentation with a more reference-aligned visual structure and active-state system. Keep the jotting compose action in `DarkWritingSection.vue`, but restyle its floating button into a gold square FAB while preserving the same `handleCompose` flow.

**Tech Stack:** Vue 3 SFCs, TypeScript, Uni-app, Vitest, scoped CSS in dark shell feature files

---

## File Map

- Modify: `src/features/dark-shell/pages/DarkShellPage.vue`
  - Replace the current bottom-tab visual structure, likely remove `ChisuSymbol` from the tab bar, and add a stronger active-state treatment.
- Modify: `src/features/dark-shell/components/DarkWritingSection.vue`
  - Restyle the floating compose button into a gold square FAB while preserving `handleCompose`.
- Modify: `src/features/dark-shell/darkShellTabs.ts`
  - Only if local metadata needs an icon key instead of the old symbol-only contract.
- Modify: `tests/release/darkShellStructure.test.ts`
  - Update release/source assertions for the new bottom-nav structure and jotting FAB treatment.
- Modify: `tests/features/darkShellTabs.test.ts`
  - Update only if tab metadata changes.

## Guardrail

Do not touch these files while implementing this plan:

- `src/features/calendar/pages/CalendarPage.vue`
- `tests/release/calendarInteractionBehavior.test.ts`
- `tests/release/calendarStitchParity.test.ts`

They currently contain separate in-progress calendar changes and must remain isolated from this task.

## Task 1: Update dark shell tests to define the new navigation and FAB contract

**Files:**
- Modify: `tests/release/darkShellStructure.test.ts`
- Modify: `tests/features/darkShellTabs.test.ts` (only if needed)

- [ ] **Step 1: Replace old bottom-nav visual assumptions with the new active-line and icon-wrapper contract**

```ts
it("renders a dedicated dark shell tab bar with icon wrappers and active top-line accent", () => {
  const shellPage = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");

  expect(shellPage).toContain("dark-shell__tab-icon");
  expect(shellPage).toContain("dark-shell__tab-icon-glyph");
  expect(shellPage).toContain("dark-shell__tab-active-line");
  expect(shellPage).not.toContain("dark-shell__tab-dot");
});
```

- [ ] **Step 2: Define the new jotting FAB contract around a gold square compose button**

```ts
it("keeps the jotting compose action but renders it as a dedicated square fab", () => {
  const writingSection = readFileSync("src/features/dark-shell/components/DarkWritingSection.vue", "utf8");

  expect(writingSection).toContain("dark-writing__fab");
  expect(writingSection).toContain("dark-writing__fab-icon");
  expect(writingSection).toContain("@tap=\"handleCompose\"");
  expect(writingSection).not.toContain("<ChisuSymbol symbol=\"✦\"");
});
```

- [ ] **Step 3: Update tab metadata expectations only if the tab contract changes**

```ts
it("keeps the dark shell tab order stable even if icon metadata changes", () => {
  expect(DARK_SHELL_TABS.map((tab) => tab.id)).toEqual([
    "today",
    "jotting",
    "future",
    "profile",
  ]);
});
```

- [ ] **Step 4: Run the focused tests to verify they fail before implementation**

Run:

```bash
pnpm exec vitest run --config vitest.config.mts tests/release/darkShellStructure.test.ts tests/features/darkShellTabs.test.ts
```

Expected: FAIL because `dark-shell__tab-icon`, `dark-shell__tab-active-line`, and `dark-writing__fab-icon` do not exist yet.

- [ ] **Step 5: Commit the red-test update**

```bash
git add tests/release/darkShellStructure.test.ts tests/features/darkShellTabs.test.ts
git commit -m "test: define dark shell nav and fab contract"
```

## Task 2: Rebuild the bottom navigation visual language in `DarkShellPage.vue`

**Files:**
- Modify: `src/features/dark-shell/pages/DarkShellPage.vue`
- Modify: `src/features/dark-shell/darkShellTabs.ts` (if needed)
- Test: `tests/release/darkShellStructure.test.ts`
- Test: `tests/features/darkShellTabs.test.ts`

- [ ] **Step 1: Introduce local icon metadata if symbols alone are no longer enough**

```ts
export interface DarkShellTab {
  id: DarkShellTabId;
  labelZh: string;
  labelEn: string;
  icon: "calendar" | "book" | "sparkle" | "profile";
}

export const DARK_SHELL_TABS: DarkShellTab[] = [
  { id: "today", labelZh: "首页", labelEn: "Home", icon: "calendar" },
  { id: "jotting", labelZh: "记录", labelEn: "Records", icon: "book" },
  { id: "future", labelZh: "未来", labelEn: "Future", icon: "sparkle" },
  { id: "profile", labelZh: "主页", labelEn: "Profile", icon: "profile" },
];
```

- [ ] **Step 2: Replace the tab bar markup with icon wrappers and a top-line active accent**

```vue
<view class="dark-shell__tabs">
  <button
    v-for="tab in tabs"
    :key="tab.id"
    class="dark-shell__tab"
    :class="{ 'dark-shell__tab--active': activeTab === tab.id }"
    @tap="handleTabTap(tab.id)"
  >
    <view v-if="activeTab === tab.id" class="dark-shell__tab-active-line"></view>
    <view class="dark-shell__tab-icon">
      <text class="dark-shell__tab-icon-glyph">{{ resolveTabGlyph(tab.icon) }}</text>
    </view>
    <text class="dark-shell__tab-label">{{ locale === 'en-US' ? tab.labelEn : tab.labelZh }}</text>
  </button>
</view>
```

- [ ] **Step 3: Add local icon resolution without changing tab behavior**

```ts
function resolveTabGlyph(icon: "calendar" | "book" | "sparkle" | "profile"): string {
  if (icon === "calendar") return "▣";
  if (icon === "book") return "▤";
  if (icon === "sparkle") return "✦";
  return "◉";
}
```

- [ ] **Step 4: Restyle the footer slab and active-state hierarchy**

```css
.dark-shell__tabs {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 0 0 calc(env(safe-area-inset-bottom, 0px) + 10px);
  background: rgba(29, 27, 25, 0.98);
}

.dark-shell__tab {
  position: relative;
  border: none;
  background: transparent;
  color: #c8bca9;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 0 10px;
}

.dark-shell__tab-active-line {
  position: absolute;
  top: 8px;
  width: 28px;
  height: 2px;
  background: #f5bd5f;
}

.dark-shell__tab--active {
  color: #f5bd5f;
}
```

- [ ] **Step 5: Run focused tests to verify bottom-nav behavior and metadata remain stable**

Run:

```bash
pnpm exec vitest run --config vitest.config.mts tests/release/darkShellStructure.test.ts tests/features/darkShellTabs.test.ts
```

Expected: PASS, confirming new tab visuals while tab order and ids remain unchanged.

- [ ] **Step 6: Commit the bottom navigation redesign**

```bash
git add src/features/dark-shell/pages/DarkShellPage.vue src/features/dark-shell/darkShellTabs.ts tests/release/darkShellStructure.test.ts tests/features/darkShellTabs.test.ts
git commit -m "feat: redesign dark shell bottom navigation"
```

## Task 3: Redesign the jotting FAB in `DarkWritingSection.vue`

**Files:**
- Modify: `src/features/dark-shell/components/DarkWritingSection.vue`
- Test: `tests/release/darkShellStructure.test.ts`

- [ ] **Step 1: Replace the old symbolic button contents with a dedicated icon wrapper**

```vue
<button class="dark-writing__fab" @tap="handleCompose">
  <view class="dark-writing__fab-icon">
    <text class="dark-writing__fab-icon-glyph">✎</text>
  </view>
</button>
```

- [ ] **Step 2: Restyle the FAB into a square gold compose control**

```css
.dark-writing__fab {
  position: fixed;
  right: 28px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 90px);
  width: 72px;
  height: 72px;
  border: none;
  border-radius: 0;
  background: #f5bd5f;
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-writing__fab-icon-glyph {
  font-size: 28px;
  line-height: 1;
  color: #432c00;
}
```

- [ ] **Step 3: Keep safe placement above the bottom navigation**

```css
.dark-writing__fab {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 96px);
}
```

- [ ] **Step 4: Run the focused release test for dark shell structure**

Run:

```bash
pnpm exec vitest run --config vitest.config.mts tests/release/darkShellStructure.test.ts
```

Expected: PASS, confirming the jotting FAB still exists and still uses `handleCompose`.

- [ ] **Step 5: Commit the FAB redesign**

```bash
git add src/features/dark-shell/components/DarkWritingSection.vue tests/release/darkShellStructure.test.ts
git commit -m "feat: restyle dark jotting compose fab"
```

## Task 4: Full verification without touching in-progress calendar changes

**Files:**
- Verify only the dark shell files and tests touched above

- [ ] **Step 1: Run the targeted dark shell release tests together**

Run:

```bash
pnpm exec vitest run --config vitest.config.mts tests/release/darkShellStructure.test.ts tests/features/darkShellTabs.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run project type-check**

Run:

```bash
pnpm type-check
```

Expected: PASS.

- [ ] **Step 3: Confirm calendar in-progress files were not modified by this task**

Run:

```bash
git diff --name-only -- src/features/calendar/pages/CalendarPage.vue tests/release/calendarInteractionBehavior.test.ts tests/release/calendarStitchParity.test.ts
```

Expected: no new diff introduced by this task beyond the user's pre-existing calendar work.

- [ ] **Step 4: Commit the completed dark shell visual update**

```bash
git add src/features/dark-shell/pages/DarkShellPage.vue src/features/dark-shell/components/DarkWritingSection.vue src/features/dark-shell/darkShellTabs.ts tests/release/darkShellStructure.test.ts tests/features/darkShellTabs.test.ts
git commit -m "feat: align dark shell nav and jotting fab with stitch menu"
```

## Self-Review

### Spec coverage

- Bottom nav visual redesign: covered in Task 2.
- Jotting FAB redesign: covered in Task 3.
- Preserve dark shell behavior: enforced in Tasks 2 and 3 through unchanged handlers.
- Limit scope to dark shell: enforced by the file map and the explicit guardrail.
- Avoid touching the in-progress calendar work: enforced in the guardrail and Task 4 verification.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” markers remain in execution steps.
- Each code-writing step includes concrete snippets.
- Each verification step includes an exact command and expected result.

### Type consistency

- `DarkShellTabId` stays unchanged.
- `handleTabTap` and `handleCompose` remain the behavioral entry points.
- `dark-shell__tab-active-line`, `dark-shell__tab-icon`, and `dark-writing__fab-icon` are used consistently across tests and implementation steps.
