# Claude Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an extensible theme family system with `Claude` support, split theme family from light/dark mode, and redesign the app's major pages and shared UI to match the approved Claude-inspired visual language.

**Architecture:** Replace the current single-axis `theme` setting with `themeFamily + themeMode`, resolve all runtime styling through a semantic theme registry, and migrate pages/components away from hardcoded colors into shared tokens. Roll the redesign out in layers: settings/store first, theme tokens second, shared primitives third, then page-by-page visual adoption.

**Tech Stack:** Vue 3, Pinia, uni-app, TypeScript, Vitest, scoped CSS with global CSS variables

---

## File Structure Map

### Theme foundation

- Modify: `src/app/store/useSettingsStore.ts`
- Modify: `src/shared/theme.ts`
- Modify: `src/App.vue`
- Modify: `src/shared/i18n.ts`
- Modify: `src/features/profile/profileData.ts`
- Create: `src/shared/themeRegistry.ts`
- Create: `tests/shared/theme.test.ts`
- Modify: `tests/app/settingsStore.test.ts`
- Modify: `tests/release/settingsI18nBehavior.test.ts`

### Appearance settings UX

- Modify: `src/features/profile/pages/ProfilePage.vue`
- Modify: `src/features/profile/profileData.ts`
- Modify: `tests/release/profileSettingsSheetBehavior.test.ts`
- Create: `tests/release/profileThemeSettingsBehavior.test.ts`

### Shared themed primitives

- Modify: `src/shared/ui/TopbarIconButton.vue`
- Modify: `src/shared/ui/PaperOptionSheet.vue`
- Modify: `src/shared/ui/PaperInputDialog.vue`
- Modify: `src/shared/ui/PaperConfirmDialog.vue`

### Page redesign wave 1

- Modify: `src/features/home/pages/HomePage.vue`
- Modify: `src/features/profile/pages/ProfilePage.vue`
- Modify: `src/features/profile/pages/ProfileAlbumPage.vue`
- Modify: `src/features/profile/components/ProfileHero.vue`
- Modify: `src/features/profile/components/ProfileActionList.vue`
- Modify: `src/features/profile/components/ProfileMemoryAlbum.vue`
- Modify: `tests/release/homeStitchParity.test.ts`
- Modify: `tests/release/profilePageLocalFirst.test.ts`
- Modify: `tests/release/profileAlbumSquareParity.test.ts`

### Page redesign wave 2

- Modify: `src/features/mailbox/pages/MailboxPage.vue`
- Modify: `src/features/calendar/pages/CalendarPage.vue`
- Modify: `src/features/day-archive/pages/DayArchivePage.vue`
- Modify: `tests/release/mailboxStitchParity.test.ts`
- Modify: `tests/release/calendarStitchParity.test.ts`
- Modify: `tests/release/calendarDayArchiveSemanticParity.test.ts`

### Editor and showcase

- Modify: `src/features/editor/components/DiaryEditorShell.vue`
- Modify: `src/features/editor/components/JottingEditorShell.vue`
- Modify: `src/features/editor/components/FutureLetterEditorShell.vue`
- Modify: `src/features/home/pages/HomeCardShowcasePage.vue`
- Modify: `tests/release/editorStitchParity.test.ts`
- Modify: `tests/release/homeCardShowcaseParity.test.ts`

## Task 1: Rebuild Settings And Theme Resolution

**Files:**
- Create: `tests/shared/theme.test.ts`
- Modify: `tests/app/settingsStore.test.ts`
- Modify: `src/app/store/useSettingsStore.ts`
- Create: `src/shared/themeRegistry.ts`
- Modify: `src/shared/theme.ts`
- Modify: `src/App.vue`

- [ ] **Step 1: Write failing tests for the new settings model and theme resolution**

```ts
// tests/app/settingsStore.test.ts
it("migrates legacy theme into themeMode and defaults themeFamily to default", async () => {
  const repository = createMemoryPrefsRepository([
    { key: "theme", value: "dark" },
  ]);
  setPrefsRepository(repository);
  const store = useSettingsStore();

  await store.hydrate();

  expect(store.themeFamily).toBe("default");
  expect(store.themeMode).toBe("dark");
});

it("persists themeFamily and themeMode independently", async () => {
  const repository = createMemoryPrefsRepository();
  setPrefsRepository(repository);
  const store = useSettingsStore();

  await store.hydrate();
  store.setThemeFamily("claude");
  store.setThemeMode("light");

  await Promise.resolve();
  await Promise.resolve();

  expect(await repository.get("themeFamily")).toEqual({ key: "themeFamily", value: "claude" });
  expect(await repository.get("themeMode")).toEqual({ key: "themeMode", value: "light" });
});
```

```ts
// tests/shared/theme.test.ts
import { describe, expect, it } from "vitest";
import { resolveThemeKey, getThemeTokens } from "@/shared/theme";

describe("theme resolution", () => {
  it("resolves claude family with explicit dark mode", () => {
    expect(resolveThemeKey("claude", "dark", "light")).toBe("claude-dark");
  });

  it("uses system mode to derive the final key", () => {
    expect(resolveThemeKey("claude", "system", "dark")).toBe("claude-dark");
  });

  it("returns Claude token colors from the registry", () => {
    const tokens = getThemeTokens("claude-dark");
    expect(tokens["--app-bg"]).toBe("#141413");
    expect(tokens["--text-secondary"]).toBe("#b0aea5");
  });
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/app/settingsStore.test.ts tests/shared/theme.test.ts
```

Expected:

- `settingsStore.test.ts` fails because `themeFamily`, `themeMode`, and the new setters do not exist.
- `tests/shared/theme.test.ts` fails because `resolveThemeKey` / `getThemeTokens` do not exist yet.

- [ ] **Step 3: Add the new state fields and migration logic in the settings store**

```ts
// src/app/store/useSettingsStore.ts
export type ThemeFamily = "default" | "claude";
export type ThemeMode = "system" | "light" | "dark";

export interface SettingsState {
  themeFamily: ThemeFamily;
  themeMode: ThemeMode;
  locale: string;
  weekStartsOn: 0 | 1;
  privacyLockEnabled: boolean;
  writingPreset: "small" | "medium" | "large";
  futureLetterPaperLinesEnabled: boolean;
  albumDisplayCount: 12 | 24 | 0;
  homeTitleMode: HomeTitleMode;
  homeCustomTitle: string;
}

const SETTINGS_DEFAULTS: SettingsState = {
  themeFamily: "default",
  themeMode: "system",
  locale: "zh-CN",
  weekStartsOn: 1,
  privacyLockEnabled: false,
  writingPreset: "medium",
  futureLetterPaperLinesEnabled: true,
  albumDisplayCount: 24,
  homeTitleMode: "random",
  homeCustomTitle: "",
};

function isThemeFamily(value: string | null): value is ThemeFamily {
  return value === "default" || value === "claude";
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}
```

```ts
// hydrate() fragment
const [
  themeFamilyRecord,
  themeModeRecord,
  legacyThemeRecord,
  localeRecord,
  weekStartsOnRecord,
  privacyLockRecord,
  writingPresetRecord,
  futurePaperLinesRecord,
  albumDisplayCountRecord,
  homeTitleModeRecord,
  homeCustomTitleRecord,
  homeTitleRecord,
] = await Promise.all([
  repository.get("themeFamily"),
  repository.get("themeMode"),
  repository.get("theme"),
  repository.get("locale"),
  repository.get("weekStartsOn"),
  repository.get("privacyLockEnabled"),
  repository.get("writingPreset"),
  repository.get("futureLetterPaperLinesEnabled"),
  repository.get("albumDisplayCount"),
  repository.get("homeTitleMode"),
  repository.get("homeCustomTitle"),
  repository.get("homeTitle"),
]);

this.themeFamily = isThemeFamily(themeFamilyRecord?.value ?? null)
  ? themeFamilyRecord!.value as ThemeFamily
  : SETTINGS_DEFAULTS.themeFamily;
this.themeMode = isThemeMode(themeModeRecord?.value ?? null)
  ? themeModeRecord!.value as ThemeMode
  : (isThemeMode(legacyThemeRecord?.value ?? null)
    ? legacyThemeRecord!.value as ThemeMode
    : SETTINGS_DEFAULTS.themeMode);
```

```ts
// actions fragment
setThemeFamily(themeFamily: ThemeFamily) {
  this.themeFamily = themeFamily;
  void this.persistPreference("themeFamily", themeFamily);
}

setThemeMode(themeMode: ThemeMode) {
  this.themeMode = themeMode;
  void this.persistPreference("themeMode", themeMode);
}
```

- [ ] **Step 4: Add the theme registry and shared resolvers**

```ts
// src/shared/themeRegistry.ts
export type ResolvedThemeKey = "default-light" | "default-dark" | "claude-light" | "claude-dark";

export type ThemeTokens = Record<string, string>;

export const THEME_TOKENS: Record<ResolvedThemeKey, ThemeTokens> = {
  "default-light": {
    "--app-bg": "#fbf9f5",
    "--surface-primary": "rgba(252, 248, 241, 0.98)",
    "--surface-secondary": "#ffffff",
    "--text-primary": "#31332e",
    "--text-secondary": "rgba(99, 95, 85, 0.8)",
    "--border-subtle": "rgba(221, 212, 200, 0.72)",
    "--accent-brand": "#7f6b5a",
    "--shadow-ring": "0 0 0 1px rgba(221, 212, 200, 0.72)",
    "--font-heading": "\"Noto Serif SC\", \"Source Han Serif SC\", serif",
    "--font-body": "\"PingFang SC\", \"Noto Sans SC\", sans-serif",
  },
  "default-dark": {
    "--app-bg": "#171716",
    "--surface-primary": "rgba(30, 30, 29, 0.98)",
    "--surface-secondary": "#222220",
    "--text-primary": "#f1ede6",
    "--text-secondary": "rgba(224, 218, 208, 0.72)",
    "--border-subtle": "rgba(117, 110, 101, 0.48)",
    "--accent-brand": "#c8b39c",
    "--shadow-ring": "0 0 0 1px rgba(117, 110, 101, 0.48)",
    "--font-heading": "\"Noto Serif SC\", \"Source Han Serif SC\", serif",
    "--font-body": "\"PingFang SC\", \"Noto Sans SC\", sans-serif",
  },
  "claude-light": {
    "--app-bg": "#f5f4ed",
    "--surface-primary": "#faf9f5",
    "--surface-secondary": "#e8e6dc",
    "--text-primary": "#141413",
    "--text-secondary": "#5e5d59",
    "--border-subtle": "#f0eee6",
    "--accent-brand": "#c96442",
    "--accent-brand-soft": "#d97757",
    "--shadow-ring": "0 0 0 1px #d1cfc5",
    "--font-heading": "\"Source Han Serif SC\", \"Noto Serif SC\", \"Songti SC\", serif",
    "--font-body": "\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", sans-serif",
  },
  "claude-dark": {
    "--app-bg": "#141413",
    "--surface-primary": "#30302e",
    "--surface-secondary": "#1d1d1b",
    "--text-primary": "#faf9f5",
    "--text-secondary": "#b0aea5",
    "--border-subtle": "#30302e",
    "--accent-brand": "#c96442",
    "--accent-brand-soft": "#d97757",
    "--shadow-ring": "0 0 0 1px rgba(176, 174, 165, 0.18)",
    "--font-heading": "\"Source Han Serif SC\", \"Noto Serif SC\", \"Songti SC\", serif",
    "--font-body": "\"Source Han Sans SC\", \"Noto Sans SC\", \"PingFang SC\", sans-serif",
  },
};
```

```ts
// src/shared/theme.ts
import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { THEME_TOKENS, type ResolvedThemeKey } from "@/shared/themeRegistry";

export type ResolvedColorScheme = "light" | "dark";

export function resolveColorScheme(themeMode: "system" | "light" | "dark", systemTheme: ResolvedColorScheme): ResolvedColorScheme {
  return themeMode === "system" ? systemTheme : themeMode;
}

export function resolveThemeKey(
  themeFamily: "default" | "claude",
  themeMode: "system" | "light" | "dark",
  systemTheme: ResolvedColorScheme,
): ResolvedThemeKey {
  const colorScheme = resolveColorScheme(themeMode, systemTheme);
  return `${themeFamily}-${colorScheme}` as ResolvedThemeKey;
}

export function getThemeTokens(themeKey: ResolvedThemeKey) {
  return THEME_TOKENS[themeKey];
}

export function useResolvedThemeKey() {
  const settingsStore = useSettingsStore();
  return computed(() => resolveThemeKey(settingsStore.themeFamily, settingsStore.themeMode, resolveSystemTheme()));
}
```

- [ ] **Step 5: Apply resolved classes and CSS variables at the app root**

```vue
<!-- src/App.vue -->
<template>
  <view
    class="app-shell"
    :class="[resolvedThemeClass, resolvedTypographyClass]"
    :data-theme-family="settingsStore.themeFamily"
    :data-theme-key="resolvedThemeKey"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useResolvedThemeKey, useTypographyClass } from "@/shared/theme";
import { getThemeTokens } from "@/shared/theme";

const settingsStore = useSettingsStore();
const resolvedThemeKey = useResolvedThemeKey();
const resolvedTypographyClass = useTypographyClass();
const resolvedThemeClass = computed(() => `theme-${resolvedThemeKey.value}`);
</script>

<style>
:root,
.theme-default-light,
.theme-default-dark,
.theme-claude-light,
.theme-claude-dark {
  background: var(--app-bg);
  color: var(--text-primary);
}

.theme-claude-light,
.theme-claude-dark {
  --noche-bg: var(--app-bg);
  --noche-surface: var(--surface-primary);
  --noche-panel: var(--surface-secondary);
  --noche-text: var(--text-primary);
  --noche-muted: var(--text-secondary);
  --noche-border: var(--border-subtle);
}
</style>
```

- [ ] **Step 6: Run the focused tests again**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/app/settingsStore.test.ts tests/shared/theme.test.ts
```

Expected:

- PASS for both files.

- [ ] **Step 7: Commit**

```bash
git add tests/app/settingsStore.test.ts tests/shared/theme.test.ts src/app/store/useSettingsStore.ts src/shared/themeRegistry.ts src/shared/theme.ts src/App.vue
git commit -m "feat: add theme family and mode resolution"
```

## Task 2: Split Appearance Settings Into Theme Style And Mode

**Files:**
- Modify: `src/shared/i18n.ts`
- Modify: `src/features/profile/profileData.ts`
- Modify: `src/features/profile/pages/ProfilePage.vue`
- Modify: `tests/release/settingsI18nBehavior.test.ts`
- Modify: `tests/release/profileSettingsSheetBehavior.test.ts`
- Create: `tests/release/profileThemeSettingsBehavior.test.ts`

- [ ] **Step 1: Write failing release tests for the new Appearance settings structure**

```ts
// tests/release/profileThemeSettingsBehavior.test.ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile theme settings behavior", () => {
  it("separates theme style from theme mode in the appearance sheet", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain('key: "theme-family"');
    expect(profilePage).toContain('key: "theme-mode"');
    expect(profilePage).toContain('activeSheet.value = "appearance-theme-family"');
    expect(profilePage).toContain('activeSheet.value = "appearance-theme-mode"');
  });

  it("offers Claude as a localized theme family option", () => {
    const i18n = readProjectFile("src/shared/i18n.ts");
    expect(i18n).toContain('themeStyleTitle');
    expect(i18n).toContain('themeClaude');
  });
});
```

- [ ] **Step 2: Run the release tests to verify they fail**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/settingsI18nBehavior.test.ts tests/release/profileSettingsSheetBehavior.test.ts tests/release/profileThemeSettingsBehavior.test.ts
```

Expected:

- FAIL because the current profile page still exposes one `theme` branch and no `themeFamily/themeMode` UI.

- [ ] **Step 3: Add localized copy for theme style, Claude, and mode labels**

```ts
// src/shared/i18n.ts (fragment)
profile: {
  appearanceTitle: "外观设置",
  themeStyleTitle: "主题风格",
  themeModeTitle: "明暗模式",
}

settings: {
  themeDefault: "默认",
  themeClaude: "Claude",
  followSystem: "跟随系统",
  light: "浅色",
  dark: "深色",
}
```

```ts
// en-US fragment
profile: {
  appearanceTitle: "Appearance",
  themeStyleTitle: "Theme Style",
  themeModeTitle: "Mode",
}

settings: {
  themeDefault: "Default",
  themeClaude: "Claude",
  followSystem: "Follow system",
  light: "Light",
  dark: "Dark",
}
```

- [ ] **Step 4: Update profile labels and split the option sheet flow**

```ts
// src/features/profile/profileData.ts
export function formatProfileThemeFamilyLabel(themeFamily: "default" | "claude", locale = "zh-CN"): string {
  if (locale === "en-US") {
    return themeFamily === "claude" ? "Claude" : "Default";
  }

  return themeFamily === "claude" ? "Claude" : "默认";
}

export function formatProfileThemeModeLabel(themeMode: "system" | "light" | "dark", locale = "zh-CN"): string {
  if (locale === "en-US") {
    if (themeMode === "light") return "Light";
    if (themeMode === "dark") return "Dark";
    return "Follow system";
  }

  if (themeMode === "light") return "浅色";
  if (themeMode === "dark") return "深色";
  return "跟随系统";
}
```

```ts
// src/features/profile/pages/ProfilePage.vue (types fragment)
type ThemeFamilyOption = "default" | "claude";
type ThemeModeOption = "system" | "light" | "dark";

type ActiveSheet =
  | null
  | "appearance-root"
  | "appearance-theme-family"
  | "appearance-theme-mode"
  | "appearance-writing"
  | "appearance-home-title"
  | "appearance-album-count"
  | "appearance-future-lines"
  | "appearance-week"
  | "appearance-locale"
  | "backup-root"
  | "backup-restore"
  | "avatar-actions";
```

```ts
// appearance root options fragment
{
  key: "theme-family",
  title: `${copy.value.profile.themeStyleTitle}：${formatProfileThemeFamilyLabel(settingsStore.themeFamily, settingsStore.locale)}`,
  trailingIcon: "chevron-right",
},
{
  key: "theme-mode",
  title: `${copy.value.profile.themeModeTitle}：${formatProfileThemeModeLabel(settingsStore.themeMode, settingsStore.locale)}`,
  trailingIcon: "chevron-right",
},
```

```ts
// handleSheetSelect fragment
case "appearance-root":
  if (key === "theme-family") {
    activeSheet.value = "appearance-theme-family";
    return;
  }
  if (key === "theme-mode") {
    activeSheet.value = "appearance-theme-mode";
    return;
  }
  // existing branches stay

case "appearance-theme-family":
  settingsStore.setThemeFamily(key as ThemeFamilyOption);
  activeSheet.value = "appearance-root";
  return;

case "appearance-theme-mode":
  settingsStore.setThemeMode(key as ThemeModeOption);
  activeSheet.value = "appearance-root";
  return;
```

- [ ] **Step 5: Update the release tests to assert the new copy path**

```ts
// tests/release/settingsI18nBehavior.test.ts (fragment)
expect(profilePage).toContain("copy.value.profile.themeStyleTitle");
expect(profilePage).toContain("copy.value.profile.themeModeTitle");
expect(profilePage).toContain("copy.value.settings.themeDefault");
expect(profilePage).toContain("copy.value.settings.themeClaude");
expect(profilePage).toContain("copy.value.settings.followSystem");
expect(profilePage).toContain("copy.value.settings.light");
expect(profilePage).toContain("copy.value.settings.dark");
```

- [ ] **Step 6: Run the focused release tests again**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/settingsI18nBehavior.test.ts tests/release/profileSettingsSheetBehavior.test.ts tests/release/profileThemeSettingsBehavior.test.ts
```

Expected:

- PASS for all three files.

- [ ] **Step 7: Commit**

```bash
git add src/shared/i18n.ts src/features/profile/profileData.ts src/features/profile/pages/ProfilePage.vue tests/release/settingsI18nBehavior.test.ts tests/release/profileSettingsSheetBehavior.test.ts tests/release/profileThemeSettingsBehavior.test.ts
git commit -m "feat: split profile theme style and mode settings"
```

## Task 3: Theme The Shared Primitives

**Files:**
- Modify: `src/shared/ui/TopbarIconButton.vue`
- Modify: `src/shared/ui/PaperOptionSheet.vue`
- Modify: `src/shared/ui/PaperInputDialog.vue`
- Modify: `src/shared/ui/PaperConfirmDialog.vue`

- [ ] **Step 1: Add a small snapshot-style release test for shared themed primitives**

```ts
// tests/release/profileThemeSettingsBehavior.test.ts (append)
it("keeps shared sheets and topbar controls on theme tokens instead of raw color literals", () => {
  const topbarButton = readProjectFile("src/shared/ui/TopbarIconButton.vue");
  const optionSheet = readProjectFile("src/shared/ui/PaperOptionSheet.vue");
  const inputDialog = readProjectFile("src/shared/ui/PaperInputDialog.vue");
  const confirmDialog = readProjectFile("src/shared/ui/PaperConfirmDialog.vue");

  expect(topbarButton).toContain("var(--topbar-icon-color");
  expect(optionSheet).toContain("var(--surface-primary");
  expect(inputDialog).toContain("var(--surface-primary");
  expect(confirmDialog).toContain("var(--surface-primary");
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/profileThemeSettingsBehavior.test.ts
```

Expected:

- FAIL because those components still use current `--noche-*` values or raw rgba colors.

- [ ] **Step 3: Replace primitive styling with semantic theme tokens**

```vue
<!-- src/shared/ui/TopbarIconButton.vue -->
<style scoped>
.topbar-icon-button {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--topbar-icon-color, var(--text-secondary));
  border-radius: var(--radius-pill, 999px);
  transition: color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.topbar-icon-button:active {
  background: var(--surface-primary);
  box-shadow: var(--shadow-ring);
}
</style>
```

```vue
<!-- shared sheets/dialogs styling fragment -->
background: var(--surface-primary);
border: 1px solid var(--border-subtle);
box-shadow: var(--shadow-whisper);
color: var(--text-primary);
font-family: var(--font-body);
```

```css
.paper-option-sheet__title,
.paper-input-dialog__title,
.paper-confirm-dialog__title {
  font-family: var(--font-heading);
}

.paper-option-sheet__copy,
.paper-option-sheet__option-copy-text,
.paper-input-dialog__copy,
.paper-confirm-dialog__copy {
  color: var(--text-secondary);
}
```

- [ ] **Step 4: Run the primitive test again**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/profileThemeSettingsBehavior.test.ts
```

Expected:

- PASS with the new token usage.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/TopbarIconButton.vue src/shared/ui/PaperOptionSheet.vue src/shared/ui/PaperInputDialog.vue src/shared/ui/PaperConfirmDialog.vue tests/release/profileThemeSettingsBehavior.test.ts
git commit -m "feat: theme shared sheets and topbar controls"
```

## Task 4: Redesign Home, Profile, And Album For Claude

**Files:**
- Modify: `src/features/home/pages/HomePage.vue`
- Modify: `src/features/profile/pages/ProfilePage.vue`
- Modify: `src/features/profile/pages/ProfileAlbumPage.vue`
- Modify: `src/features/profile/components/ProfileHero.vue`
- Modify: `src/features/profile/components/ProfileActionList.vue`
- Modify: `src/features/profile/components/ProfileMemoryAlbum.vue`
- Modify: `tests/release/homeStitchParity.test.ts`
- Modify: `tests/release/profilePageLocalFirst.test.ts`
- Modify: `tests/release/profileAlbumSquareParity.test.ts`

- [ ] **Step 1: Add release assertions for Claude-oriented visual tokens and Chinese type stacks**

```ts
// tests/release/homeStitchParity.test.ts (append)
expect(homePage).toContain("var(--font-heading)");
expect(homePage).toContain("var(--accent-brand)");
expect(homePage).toContain("var(--surface-primary)");
```

```ts
// tests/release/profilePageLocalFirst.test.ts (append)
expect(profilePage).toContain("var(--font-heading)");
expect(profilePage).toContain("var(--surface-primary)");
expect(profilePage).toContain("var(--shadow-ring)");
```

```ts
// tests/release/profileAlbumSquareParity.test.ts (append)
expect(profileAlbumPage).toContain("var(--surface-primary)");
expect(profileAlbumPage).toContain("var(--border-subtle)");
```

- [ ] **Step 2: Run the release tests to verify they fail**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/homeStitchParity.test.ts tests/release/profilePageLocalFirst.test.ts tests/release/profileAlbumSquareParity.test.ts
```

Expected:

- FAIL because these pages still rely on page-local literals and mixed font stacks.

- [ ] **Step 3: Rebuild the page shells to use Claude tokens and stronger typography**

```css
/* HomePage.vue direction fragment */
.home-page {
  background:
    radial-gradient(circle at top left, rgba(201, 100, 66, 0.14), transparent 30%),
    var(--app-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
}

.home-page__hero-title,
.home-page__paper-heading,
.home-page__welcome-card-title {
  font-family: var(--font-heading);
  color: var(--text-primary);
}

.home-page__paper-premium,
.home-page__welcome-card-face-inner,
.home-page__jotting-modal {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-whisper);
  border-radius: var(--radius-panel);
}
```

```css
/* ProfilePage.vue direction fragment */
.profile-page {
  background:
    radial-gradient(circle at top left, rgba(201, 100, 66, 0.12), transparent 28%),
    var(--app-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
}

.profile-page__banner,
.profile-page__menu,
.profile-page__footer {
  color: var(--text-secondary);
}
```

```css
/* ProfileHero.vue direction fragment */
.profile-hero__title,
.profile-hero__display-name {
  font-family: var(--font-heading);
}

.profile-hero__cover,
.profile-hero__identity-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-ring);
}
```

- [ ] **Step 4: Update Chinese typography explicitly on these pages**

```css
.home-page__hero-title,
.profile-page__footer-text,
.profile-album-page__title {
  font-family: var(--font-heading);
}

.home-page__hero-subtitle,
.profile-page__banner-text,
.profile-album-page__meta {
  font-family: var(--font-body);
}
```

- [ ] **Step 5: Run the release tests again**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/homeStitchParity.test.ts tests/release/profilePageLocalFirst.test.ts tests/release/profileAlbumSquareParity.test.ts
```

Expected:

- PASS for the updated page files.

- [ ] **Step 6: Commit**

```bash
git add src/features/home/pages/HomePage.vue src/features/profile/pages/ProfilePage.vue src/features/profile/pages/ProfileAlbumPage.vue src/features/profile/components/ProfileHero.vue src/features/profile/components/ProfileActionList.vue src/features/profile/components/ProfileMemoryAlbum.vue tests/release/homeStitchParity.test.ts tests/release/profilePageLocalFirst.test.ts tests/release/profileAlbumSquareParity.test.ts
git commit -m "feat: redesign home and profile surfaces for claude theme"
```

## Task 5: Redesign Mailbox, Calendar, And Day Archive

**Files:**
- Modify: `src/features/mailbox/pages/MailboxPage.vue`
- Modify: `src/features/calendar/pages/CalendarPage.vue`
- Modify: `src/features/day-archive/pages/DayArchivePage.vue`
- Modify: `tests/release/mailboxStitchParity.test.ts`
- Modify: `tests/release/calendarStitchParity.test.ts`
- Modify: `tests/release/calendarDayArchiveSemanticParity.test.ts`

- [ ] **Step 1: Add release assertions for archive-oriented tokens**

```ts
// mailbox/calendar/day archive release tests (fragments)
expect(mailboxPage).toContain("var(--font-heading)");
expect(mailboxPage).toContain("var(--surface-primary)");
expect(calendarPage).toContain("var(--surface-primary)");
expect(calendarPage).toContain("var(--accent-brand)");
expect(dayArchivePage).toContain("var(--font-heading)");
expect(dayArchivePage).toContain("var(--surface-primary)");
```

- [ ] **Step 2: Run the release tests to verify they fail**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/mailboxStitchParity.test.ts tests/release/calendarStitchParity.test.ts tests/release/calendarDayArchiveSemanticParity.test.ts
```

Expected:

- FAIL because the pages still use page-local neutral styling and inconsistent typography.

- [ ] **Step 3: Restyle the archive pages with stronger editorial/archive structure**

```css
/* MailboxPage.vue fragment */
.mailbox-page {
  background: var(--app-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
}

.mailbox-page__topbar,
.mailbox-page__tab-group,
.mailbox-page__entry-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-ring);
}

.mailbox-page__entry-title {
  font-family: var(--font-heading);
}
```

```css
/* CalendarPage.vue fragment */
.calendar-page__paper-panel,
.calendar-page__day-mailbox-item {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
}

.calendar-page__hero-title,
.calendar-page__day-mailbox-title {
  font-family: var(--font-heading);
}

.calendar-page__day--selected .calendar-page__day-inner::before {
  background: radial-gradient(circle, color-mix(in srgb, var(--accent-brand) 18%, transparent) 0%, transparent 72%);
}
```

```css
/* DayArchivePage.vue fragment */
.day-archive-page {
  background: var(--app-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
}

.day-archive-page__title,
.day-archive-page__item-title {
  font-family: var(--font-heading);
}

.day-archive-page__state,
.day-archive-page__item {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-ring);
}
```

- [ ] **Step 4: Run the release tests again**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/mailboxStitchParity.test.ts tests/release/calendarStitchParity.test.ts tests/release/calendarDayArchiveSemanticParity.test.ts
```

Expected:

- PASS for all three files.

- [ ] **Step 5: Commit**

```bash
git add src/features/mailbox/pages/MailboxPage.vue src/features/calendar/pages/CalendarPage.vue src/features/day-archive/pages/DayArchivePage.vue tests/release/mailboxStitchParity.test.ts tests/release/calendarStitchParity.test.ts tests/release/calendarDayArchiveSemanticParity.test.ts
git commit -m "feat: redesign archive pages for claude theme"
```

## Task 6: Redesign The Editor And Finalize Regression Coverage

**Files:**
- Modify: `src/features/editor/components/DiaryEditorShell.vue`
- Modify: `src/features/editor/components/JottingEditorShell.vue`
- Modify: `src/features/editor/components/FutureLetterEditorShell.vue`
- Modify: `src/features/home/pages/HomeCardShowcasePage.vue`
- Modify: `tests/release/editorStitchParity.test.ts`
- Modify: `tests/release/homeCardShowcaseParity.test.ts`

- [ ] **Step 1: Add release assertions for Claude editor and showcase tokens**

```ts
// tests/release/editorStitchParity.test.ts (fragment)
expect(editorShell).toContain("var(--font-heading)");
expect(editorShell).toContain("var(--surface-primary)");
expect(editorShell).toContain("var(--text-secondary)");
```

```ts
// tests/release/homeCardShowcaseParity.test.ts (fragment)
expect(showcasePage).toContain("var(--accent-brand)");
expect(showcasePage).toContain("var(--surface-primary)");
```

- [ ] **Step 2: Run the editor/showcase release tests to verify they fail**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/editorStitchParity.test.ts tests/release/homeCardShowcaseParity.test.ts
```

Expected:

- FAIL because editor shells and showcase styling are not yet aligned to the new token system.

- [ ] **Step 3: Apply the Claude light/dark writing-room treatment**

```css
/* DiaryEditorShell.vue / JottingEditorShell.vue fragment */
.diary-editor-shell,
.jotting-editor-shell {
  background:
    radial-gradient(circle at top left, rgba(201, 100, 66, 0.12), transparent 26%),
    var(--app-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
}

.diary-editor-shell__title,
.jotting-editor-shell__title {
  font-family: var(--font-heading);
}
```

```css
/* FutureLetterEditorShell.vue fragment */
.theme-claude-dark.editor-page {
  background:
    radial-gradient(circle at top left, rgba(217, 119, 87, 0.12), transparent 28%),
    var(--app-bg);
}

.theme-claude-dark .editor-page__paper-surface {
  background: color-mix(in srgb, var(--surface-primary) 92%, transparent);
  border: 1px solid var(--border-subtle);
}

.theme-claude-dark .editor-page__topbar-button,
.theme-claude-dark .editor-page__textarea,
.theme-claude-dark .editor-page__read-content {
  color: var(--text-primary);
}

.theme-claude-dark .editor-page__meta-subtitle,
.theme-claude-dark .editor-page__placeholder {
  color: var(--text-secondary);
}
```

```css
/* HomeCardShowcasePage.vue fragment */
.home-card-showcase-page {
  background: var(--app-bg);
  color: var(--text-primary);
}

.home-card-showcase-page__group-title,
.home-card-showcase-page__card-title {
  font-family: var(--font-heading);
}
```

- [ ] **Step 4: Run the editor/showcase release tests again**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/release/editorStitchParity.test.ts tests/release/homeCardShowcaseParity.test.ts
```

Expected:

- PASS for both files.

- [ ] **Step 5: Run the final regression suite for the touched areas**

Run:

```bash
pnpm vitest run --config vitest.config.mts tests/app/settingsStore.test.ts tests/shared/theme.test.ts tests/release/settingsI18nBehavior.test.ts tests/release/profileSettingsSheetBehavior.test.ts tests/release/profileThemeSettingsBehavior.test.ts tests/release/homeStitchParity.test.ts tests/release/profilePageLocalFirst.test.ts tests/release/profileAlbumSquareParity.test.ts tests/release/mailboxStitchParity.test.ts tests/release/calendarStitchParity.test.ts tests/release/calendarDayArchiveSemanticParity.test.ts tests/release/editorStitchParity.test.ts tests/release/homeCardShowcaseParity.test.ts
pnpm type-check
```

Expected:

- all listed Vitest files PASS
- `pnpm type-check` exits successfully with no TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/features/editor/components/DiaryEditorShell.vue src/features/editor/components/JottingEditorShell.vue src/features/editor/components/FutureLetterEditorShell.vue src/features/home/pages/HomeCardShowcasePage.vue tests/release/editorStitchParity.test.ts tests/release/homeCardShowcaseParity.test.ts
git commit -m "feat: finalize claude editor and showcase redesign"
```

## Self-Review

### Spec coverage

- Theme family + mode separation: covered by Task 1 and Task 2
- Claude light/dark token system: covered by Task 1
- Chinese typography unification: covered by Task 1, Task 4, Task 5, and Task 6
- Shared component redesign: covered by Task 3
- Home/Profile/Profile Album redesign: covered by Task 4
- Mailbox/Calendar/Day Archive redesign: covered by Task 5
- Editor and showcase redesign: covered by Task 6
- Verification in all touched areas: covered by Task 6

### Placeholder scan

- No `TODO`, `TBD`, or "implement later" placeholders remain.
- Each task has concrete file paths, commands, and code fragments.

### Type consistency

- `themeFamily`, `themeMode`, `ResolvedColorScheme`, and `ResolvedThemeKey` use the same names across tasks.
- `setThemeFamily` and `setThemeMode` are the only new store mutators referenced later in the plan.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-19-claude-theme-system-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
