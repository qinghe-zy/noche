# Dark Mode Archive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `chisu-v2.jsx` inspired dark-mode shell with integrated Today/Jotting/Future/Mailbox pages, plus an independent Archive feature for daily AI-generated questions and private answers, without disturbing the existing light-mode experience.

**Architecture:** Keep the current route surface for light mode, but branch dark mode into a dedicated shell component tree rendered from the home route. Add Archive as an independent feature with its own domain, repository, store, and route, and wire all dark-mode entry points to existing editor/calendar detail routes instead of copying the JSX demo's local state machine. Introduce a dark-only symbol/icon layer so `chisu-v2.jsx` symbols and active states can be reproduced without contaminating the existing shared icon system.

**Tech Stack:** Vue 3, UniApp, Pinia, TypeScript, Vitest, existing Storage + SQLite repository pattern

---

## Scope Check

This spec touches multiple surfaces, but they are one coherent vertical slice:

- one theme-gated dark shell,
- one new Archive domain,
- and one set of page-level dark UX changes that depend on both.

This is still reasonable as a single implementation plan as long as tasks land in this order:

1. shell/theme infrastructure,
2. Archive domain/persistence,
3. Archive page,
4. dark Today/Jotting/Future/Mailbox views,
5. regression verification.

## File Structure

### New files

- `src/features/dark-shell/darkShellTabs.ts`
  - Dark shell tab ids, labels, and symbol definitions.
- `src/features/dark-shell/components/ChisuSymbol.vue`
  - Dark-only symbol/icon renderer for `◎`, `✒`, `✉`, `◫`, `▦`, `✦`.
- `src/features/dark-shell/pages/DarkShellPage.vue`
  - Main dark-mode shell with bottom tabs and top-level section switching.
- `src/features/dark-shell/components/DarkTodaySection.vue`
  - Today page UI and Archive entry point.
- `src/features/dark-shell/components/DarkWritingSection.vue`
  - Combined jotting/diary list hub with left/right large title switch.
- `src/features/dark-shell/components/DarkFutureSection.vue`
  - Future page intro block and future-letter list.
- `src/features/dark-shell/components/DarkMailboxSection.vue`
  - Unified mailbox list and calendar shortcut.
- `src/features/dark-shell/darkMailboxView.ts`
  - Mailbox list shaping helpers for the unified dark mailbox.
- `src/features/archive/types.ts`
  - Archive entity and question/provider types.
- `src/features/archive/archiveQuestions.ts`
  - Question resolution logic, cache rules, and fallback catalog.
- `src/features/archive/archiveFallbackCatalog.ts`
  - Local question fallback set.
- `src/features/archive/archiveDisplay.ts`
  - Formatting helpers for Archive views.
- `src/features/archive/pages/ArchivePage.vue`
  - Main/write/success/memory Archive view state machine.
- `src/data/repositories/archive.repository.ts`
  - Archive repository interface.
- `src/data/repositories/storageArchiveRepository.ts`
  - Storage-backed Archive repository.
- `src/data/repositories/sqliteArchiveRepository.ts`
  - SQLite-backed Archive repository.
- `src/app/store/archiveRepository.ts`
  - Archive repository getter/setter.
- `src/app/store/useArchiveStore.ts`
  - Pinia store for Archive question loading, answering, and listing.
- `tests/features/darkShellTabs.test.ts`
  - Symbol and tab definition guard.
- `tests/features/archiveQuestions.test.ts`
  - Question resolution/cache/fallback tests.
- `tests/features/archiveDisplay.test.ts`
  - Archive formatting tests.
- `tests/data/storageArchiveRepository.test.ts`
  - Storage Archive repository tests.
- `tests/data/sqliteArchiveRepository.test.ts`
  - SQLite Archive repository tests.
- `tests/app/archiveStore.test.ts`
  - Archive store behavior tests.
- `tests/features/darkMailboxView.test.ts`
  - Unified mailbox grouping tests.
- `tests/release/darkShellStructure.test.ts`
  - Release-level structure/parity checks for dark shell and icon use.

### Modified files

- `src/features/home/pages/HomePage.vue`
  - Theme-gated entry: preserve current light view, render dark shell when resolved theme is dark.
- `src/shared/theme.ts`
  - Reuse resolved theme helpers in the shell gate if needed.
- `src/shared/constants/routes.ts`
  - Add Archive route constant.
- `src/pages.json`
  - Add Archive page route.
- `src/shared/i18n.ts`
  - Add Archive copy and any dark-shell-specific labels that do not already exist.
- `src/app/providers/configurePersistenceAdapters.ts`
  - Wire Archive repository setter if a generic persistence injection point is used.
- `src/app/providers/bootstrapAppRuntime.ts`
  - Initialize Storage/SQLite Archive repository alongside entries/drafts/preferences.
- `src/data/db/schema.ts`
  - Add Archive table and bump version.
- `src/data/db/migrations.ts`
  - Add migration for Archive table.
- `src/features/calendar/pages/CalendarPage.vue`
  - Dark-only visual adjustments toward `chisu-v2.jsx` style while keeping logic intact.
- `src/app/store/useMailboxStore.ts`
  - Add unified list getter or refresh target for dark mailbox.
- `tests/app/bootstrapAppRuntime.test.ts`
  - Verify Archive repository bootstrap path.
- `tests/release/homeStitchParity.test.ts`
  - Update if necessary for new theme-gated dark shell.
- `tests/release/mailboxStitchParity.test.ts`
  - Update for unified dark mailbox.
- `tests/release/calendarStitchParity.test.ts`
  - Update dark visual assertions if needed.

## Task 1: Establish Dark Shell Gate And Symbol System

**Files:**
- Create: `src/features/dark-shell/darkShellTabs.ts`
- Create: `src/features/dark-shell/components/ChisuSymbol.vue`
- Create: `tests/features/darkShellTabs.test.ts`
- Create: `tests/release/darkShellStructure.test.ts`
- Modify: `src/features/home/pages/HomePage.vue`

- [ ] **Step 1: Write the failing tab/symbol tests**

```ts
// tests/features/darkShellTabs.test.ts
import { describe, expect, it } from "vitest";
import { DARK_SHELL_TABS, getDarkShellTabById } from "@/features/dark-shell/darkShellTabs";

describe("darkShellTabs", () => {
  it("exposes the chisu-v2 tab order and symbols", () => {
    expect(DARK_SHELL_TABS.map((tab) => tab.id)).toEqual([
      "today",
      "jotting",
      "future",
      "mailbox",
    ]);
    expect(DARK_SHELL_TABS.map((tab) => tab.symbol)).toEqual(["◎", "✒", "✉", "◫"]);
  });

  it("returns the mailbox tab definition by id", () => {
    expect(getDarkShellTabById("mailbox")).toMatchObject({
      id: "mailbox",
      symbol: "◫",
    });
  });
});
```

```ts
// tests/release/darkShellStructure.test.ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("dark shell structure", () => {
  it("keeps a dedicated dark symbol component and theme gate", () => {
    const homePage = readFileSync("src/features/home/pages/HomePage.vue", "utf8");
    const symbolComponent = readFileSync("src/features/dark-shell/components/ChisuSymbol.vue", "utf8");

    expect(homePage).toContain("DarkShellPage");
    expect(homePage).toContain("resolveThemeClass");
    expect(symbolComponent).toContain("◎");
    expect(symbolComponent).toContain("✉");
    expect(symbolComponent).toContain("▦");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test:unit -- tests/features/darkShellTabs.test.ts tests/release/darkShellStructure.test.ts
```

Expected: FAIL with module/file not found errors for `darkShellTabs`, `ChisuSymbol.vue`, or missing dark shell references in `HomePage.vue`.

- [ ] **Step 3: Write the tab definition module**

```ts
// src/features/dark-shell/darkShellTabs.ts
export type DarkShellTabId = "today" | "jotting" | "future" | "mailbox";

export interface DarkShellTab {
  id: DarkShellTabId;
  labelZh: string;
  labelEn: string;
  symbol: string;
}

export const DARK_SHELL_TABS: DarkShellTab[] = [
  { id: "today", labelZh: "今日", labelEn: "Today", symbol: "◎" },
  { id: "jotting", labelZh: "随笔", labelEn: "Jotting", symbol: "✒" },
  { id: "future", labelZh: "致未来", labelEn: "Future", symbol: "✉" },
  { id: "mailbox", labelZh: "邮箱", labelEn: "Mailbox", symbol: "◫" },
];

export function getDarkShellTabById(id: DarkShellTabId): DarkShellTab {
  return DARK_SHELL_TABS.find((tab) => tab.id === id) ?? DARK_SHELL_TABS[0];
}
```

- [ ] **Step 4: Write the dedicated symbol component**

```vue
<!-- src/features/dark-shell/components/ChisuSymbol.vue -->
<template>
  <text class="chisu-symbol" :class="[`chisu-symbol--${tone}`]">{{ resolvedSymbol }}</text>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  symbol: "◎" | "✒" | "✉" | "◫" | "▦" | "✦";
  tone?: "active" | "muted" | "accent";
}>(), {
  tone: "muted",
});

const resolvedSymbol = props.symbol;
</script>

<style scoped>
.chisu-symbol { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
.chisu-symbol--active { color: var(--paper, var(--noche-text)); opacity: 1; }
.chisu-symbol--muted { color: var(--muted, var(--noche-muted)); opacity: 0.72; }
.chisu-symbol--accent { color: var(--red, #A83228); opacity: 1; }
</style>
```

- [ ] **Step 5: Theme-gate the home route to a dark shell component**

```vue
<!-- src/features/home/pages/HomePage.vue -->
<template>
  <DarkShellPage v-if="isDarkMode" />
  <view v-else class="home-page" :class="[themeClass, typographyClass]">
    <!-- existing light-mode HomePage content unchanged -->
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { resolveThemeMode, useThemeClass, useTypographyClass } from "@/shared/theme";
import DarkShellPage from "@/features/dark-shell/pages/DarkShellPage.vue";

const isDarkMode = computed(() => resolveThemeMode(settingsStore.theme) === "dark");
</script>
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```bash
pnpm test:unit -- tests/features/darkShellTabs.test.ts tests/release/darkShellStructure.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add tests/features/darkShellTabs.test.ts tests/release/darkShellStructure.test.ts src/features/dark-shell/darkShellTabs.ts src/features/dark-shell/components/ChisuSymbol.vue src/features/home/pages/HomePage.vue
git commit -m "feat: add dark shell theme gate and symbol system"
```

### Task 2: Add Archive Question Resolution Logic

**Files:**
- Create: `src/features/archive/types.ts`
- Create: `src/features/archive/archiveFallbackCatalog.ts`
- Create: `src/features/archive/archiveQuestions.ts`
- Test: `tests/features/archiveQuestions.test.ts`

- [ ] **Step 1: Write the failing Archive question tests**

```ts
// tests/features/archiveQuestions.test.ts
import { describe, expect, it, vi } from "vitest";
import {
  createArchiveQuestionResolver,
  hashArchiveDate,
  type ArchiveQuestionProvider,
} from "@/features/archive/archiveQuestions";

describe("archiveQuestions", () => {
  it("uses the remote provider when it returns a question", async () => {
    const provider: ArchiveQuestionProvider = {
      async getQuestion(date) {
        return { date, question: "今天你最想留下什么？", source: "remote" };
      },
    };
    const resolver = createArchiveQuestionResolver(provider);

    await expect(resolver.resolve("2026-04-21")).resolves.toEqual({
      date: "2026-04-21",
      question: "今天你最想留下什么？",
      source: "remote",
    });
  });

  it("falls back to the local catalog when the remote provider returns null", async () => {
    const provider: ArchiveQuestionProvider = { getQuestion: vi.fn().mockResolvedValue(null) };
    const resolver = createArchiveQuestionResolver(provider);

    const result = await resolver.resolve("2026-04-21");

    expect(result.date).toBe("2026-04-21");
    expect(result.source).toBe("fallback");
    expect(result.question.length).toBeGreaterThan(0);
  });

  it("keeps the fallback selection stable for the same date", () => {
    expect(hashArchiveDate("2026-04-21")).toBe(hashArchiveDate("2026-04-21"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test:unit -- tests/features/archiveQuestions.test.ts
```

Expected: FAIL with missing module errors for `archiveQuestions`.

- [ ] **Step 3: Add Archive question types and fallback catalog**

```ts
// src/features/archive/types.ts
export type ArchiveQuestionSource = "remote" | "fallback";

export interface ArchiveQuestion {
  date: string;
  question: string;
  source: ArchiveQuestionSource;
  createdAt: string;
}

export interface ArchiveEntry {
  id: string;
  date: string;
  question: string;
  answer: string;
  questionSource: ArchiveQuestionSource;
  createdAt: string;
  updatedAt: string;
  answeredAt: string | null;
}
```

```ts
// src/features/archive/archiveFallbackCatalog.ts
export const ARCHIVE_FALLBACK_QUESTIONS = [
  "你生命中哪一段沉默，其实说了很多？",
  "最近什么事情让你感到出乎意料的快乐？",
  "你今天最想把哪件事存进未来？",
  "如果一年后的你看到今天，会先注意到什么？",
  "今天你最想被谁理解？",
];
```

- [ ] **Step 4: Implement the resolver**

```ts
// src/features/archive/archiveQuestions.ts
import { ARCHIVE_FALLBACK_QUESTIONS } from "@/features/archive/archiveFallbackCatalog";
import type { ArchiveQuestion } from "@/features/archive/types";
import { nowIso } from "@/shared/utils/date";

export interface ArchiveQuestionProvider {
  getQuestion(date: string): Promise<Pick<ArchiveQuestion, "date" | "question" | "source"> | null>;
}

export function hashArchiveDate(date: string): number {
  return date.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function getFallbackQuestion(date: string): ArchiveQuestion {
  const index = hashArchiveDate(date) % ARCHIVE_FALLBACK_QUESTIONS.length;
  return {
    date,
    question: ARCHIVE_FALLBACK_QUESTIONS[index] ?? ARCHIVE_FALLBACK_QUESTIONS[0],
    source: "fallback",
    createdAt: nowIso(),
  };
}

export function createArchiveQuestionResolver(provider: ArchiveQuestionProvider) {
  return {
    async resolve(date: string): Promise<ArchiveQuestion> {
      const remoteQuestion = await provider.getQuestion(date);
      if (remoteQuestion?.question?.trim()) {
        return {
          date,
          question: remoteQuestion.question.trim(),
          source: "remote",
          createdAt: nowIso(),
        };
      }
      return getFallbackQuestion(date);
    },
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
pnpm test:unit -- tests/features/archiveQuestions.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tests/features/archiveQuestions.test.ts src/features/archive/types.ts src/features/archive/archiveFallbackCatalog.ts src/features/archive/archiveQuestions.ts
git commit -m "feat: add archive question resolution"
```

### Task 3: Add Archive Repository Contracts And Persistence

**Files:**
- Create: `src/data/repositories/archive.repository.ts`
- Create: `src/data/repositories/storageArchiveRepository.ts`
- Create: `src/data/repositories/sqliteArchiveRepository.ts`
- Create: `src/app/store/archiveRepository.ts`
- Modify: `src/app/providers/configurePersistenceAdapters.ts`
- Modify: `src/app/providers/bootstrapAppRuntime.ts`
- Modify: `src/data/db/schema.ts`
- Modify: `src/data/db/migrations.ts`
- Test: `tests/data/storageArchiveRepository.test.ts`
- Test: `tests/data/sqliteArchiveRepository.test.ts`
- Test: `tests/app/bootstrapAppRuntime.test.ts`

- [ ] **Step 1: Write the failing repository tests**

```ts
// tests/data/storageArchiveRepository.test.ts
import { describe, expect, it } from "vitest";
import { createMemoryJsonStorage } from "@/shared/utils/storage";
import { createStorageArchiveRepository } from "@/data/repositories/storageArchiveRepository";

describe("storageArchiveRepository", () => {
  it("persists a resolved question and an answer", async () => {
    const storage = createMemoryJsonStorage();
    const repository = createStorageArchiveRepository(storage);

    await repository.saveQuestion({
      date: "2026-04-21",
      question: "今天你最想留下什么？",
      source: "fallback",
      createdAt: "2026-04-21T08:00:00.000Z",
    });
    await repository.answerToday("2026-04-21", "我想留下今天的平静。");

    const entry = await repository.getByDate("2026-04-21");
    expect(entry).toMatchObject({
      date: "2026-04-21",
      question: "今天你最想留下什么？",
      answer: "我想留下今天的平静。",
    });
  });
});
```

```ts
// tests/data/sqliteArchiveRepository.test.ts
import { describe, expect, it } from "vitest";
import { createFakeSQLiteClient } from "@/tests/data/fakeSQLiteClient";
import { ensureLatestSQLiteSchema } from "@/data/db/migrations";
import { createSQLiteArchiveRepository } from "@/data/repositories/sqliteArchiveRepository";

describe("sqliteArchiveRepository", () => {
  it("creates and reads archive rows after schema migration", async () => {
    const client = createFakeSQLiteClient();
    await ensureLatestSQLiteSchema(client);
    const repository = createSQLiteArchiveRepository(client);

    await repository.saveQuestion({
      date: "2026-04-21",
      question: "你想把什么交给一年后的自己？",
      source: "remote",
      createdAt: "2026-04-21T08:00:00.000Z",
    });

    expect(await repository.getQuestionByDate("2026-04-21")).toMatchObject({
      date: "2026-04-21",
      source: "remote",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test:unit -- tests/data/storageArchiveRepository.test.ts tests/data/sqliteArchiveRepository.test.ts
```

Expected: FAIL with missing repository modules and missing schema support.

- [ ] **Step 3: Add the repository interface and store getter/setter**

```ts
// src/data/repositories/archive.repository.ts
import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";

export interface IArchiveRepository {
  saveQuestion(question: ArchiveQuestion): Promise<void>;
  getQuestionByDate(date: string): Promise<ArchiveQuestion | null>;
  answerToday(date: string, answer: string): Promise<ArchiveEntry>;
  getByDate(date: string): Promise<ArchiveEntry | null>;
  listAnswered(): Promise<ArchiveEntry[]>;
  getOneYearAgo(date: string): Promise<ArchiveEntry | null>;
}
```

```ts
// src/app/store/archiveRepository.ts
import type { IArchiveRepository } from "@/data/repositories/archive.repository";

let archiveRepository: IArchiveRepository | null = null;

export function setArchiveRepository(repository: IArchiveRepository): void {
  archiveRepository = repository;
}

export function getArchiveRepository(): IArchiveRepository {
  if (!archiveRepository) {
    throw new Error("Archive repository has not been configured.");
  }
  return archiveRepository;
}
```

- [ ] **Step 4: Implement the Storage repository**

```ts
// src/data/repositories/storageArchiveRepository.ts
import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";
import { createId } from "@/shared/utils/id";
import { nowIso } from "@/shared/utils/date";
import type { JsonStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "noche.archive.v1";

interface ArchiveState {
  questions: Record<string, ArchiveQuestion>;
  entries: Record<string, ArchiveEntry>;
}

function readState(storage: JsonStorage): ArchiveState {
  const raw = storage.getString(STORAGE_KEY);
  return raw ? JSON.parse(raw) as ArchiveState : { questions: {}, entries: {} };
}

function writeState(storage: JsonStorage, state: ArchiveState): void {
  storage.setString(STORAGE_KEY, JSON.stringify(state));
}

export function createStorageArchiveRepository(storage: JsonStorage): IArchiveRepository {
  return {
    async saveQuestion(question) {
      const state = readState(storage);
      if (!state.questions[question.date]) {
        state.questions[question.date] = question;
        writeState(storage, state);
      }
    },
    async getQuestionByDate(date) {
      return readState(storage).questions[date] ?? null;
    },
    async answerToday(date, answer) {
      const state = readState(storage);
      const question = state.questions[date];
      if (!question) {
        throw new Error(`Missing archive question for ${date}.`);
      }
      const existingEntry = state.entries[date];
      const nextEntry: ArchiveEntry = {
        id: existingEntry?.id ?? createId(),
        date,
        question: question.question,
        answer,
        questionSource: question.source,
        createdAt: existingEntry?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
        answeredAt: nowIso(),
      };
      state.entries[date] = nextEntry;
      writeState(storage, state);
      return nextEntry;
    },
    async getByDate(date) {
      return readState(storage).entries[date] ?? null;
    },
    async listAnswered() {
      return Object.values(readState(storage).entries).sort((a, b) => b.date.localeCompare(a.date));
    },
    async getOneYearAgo(date) {
      const target = `${String(Number(date.slice(0, 4)) - 1)}${date.slice(4)}`;
      return readState(storage).entries[target] ?? null;
    },
  };
}
```

- [ ] **Step 5: Add schema, migration, and SQLite repository**

```ts
// src/data/db/schema.ts
export const TABLES = {
  entries: "entries",
  drafts: "drafts",
  preferences: "preferences",
  attachments: "attachments",
  profileStatsCache: "profile_stats_cache",
  recordDateCounters: "record_date_counters",
  archiveQuestions: "archive_questions",
  archiveEntries: "archive_entries",
} as const;

export const LATEST_DB_VERSION = 4;

export const ARCHIVE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS ${TABLES.archiveQuestions} (
    date TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.archiveEntries} (
    date TEXT PRIMARY KEY,
    id TEXT NOT NULL UNIQUE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    question_source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    answered_at TEXT
  );`,
];
```

```ts
// src/data/db/migrations.ts
if (currentVersion < 4) {
  await runStatements(client, ARCHIVE_SCHEMA_STATEMENTS);
  await setUserVersion(client, 4);
}
```

```ts
// src/data/repositories/sqliteArchiveRepository.ts
import type { SQLiteClient } from "@/data/db/sqlite";
import { TABLES } from "@/data/db/schema";
import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";
import { createId } from "@/shared/utils/id";
import { nowIso } from "@/shared/utils/date";

export function createSQLiteArchiveRepository(client: SQLiteClient): IArchiveRepository {
  return {
    async saveQuestion(question) {
      await client.execute(
        `INSERT OR IGNORE INTO ${TABLES.archiveQuestions} (date, question, source, created_at) VALUES (?, ?, ?, ?)`,
        [question.date, question.question, question.source, question.createdAt],
      );
    },
    async getQuestionByDate(date) {
      const rows = await client.query<ArchiveQuestion>(
        `SELECT date, question, source, created_at as createdAt FROM ${TABLES.archiveQuestions} WHERE date = ?`,
        [date],
      );
      return rows[0] ?? null;
    },
    async answerToday(date, answer) {
      const question = await this.getQuestionByDate(date);
      if (!question) throw new Error(`Missing archive question for ${date}.`);
      const entry: ArchiveEntry = {
        id: createId(),
        date,
        question: question.question,
        answer,
        questionSource: question.source,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        answeredAt: nowIso(),
      };
      await client.execute(
        `INSERT OR REPLACE INTO ${TABLES.archiveEntries}
         (date, id, question, answer, question_source, created_at, updated_at, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [entry.date, entry.id, entry.question, entry.answer, entry.questionSource, entry.createdAt, entry.updatedAt, entry.answeredAt],
      );
      return entry;
    },
    async getByDate(date) {
      const rows = await client.query<ArchiveEntry>(
        `SELECT date, id, question, answer, question_source as questionSource, created_at as createdAt, updated_at as updatedAt, answered_at as answeredAt
         FROM ${TABLES.archiveEntries} WHERE date = ?`,
        [date],
      );
      return rows[0] ?? null;
    },
    async listAnswered() {
      return client.query<ArchiveEntry>(
        `SELECT date, id, question, answer, question_source as questionSource, created_at as createdAt, updated_at as updatedAt, answered_at as answeredAt
         FROM ${TABLES.archiveEntries} ORDER BY date DESC`,
      );
    },
    async getOneYearAgo(date) {
      const target = `${String(Number(date.slice(0, 4)) - 1)}${date.slice(4)}`;
      return this.getByDate(target);
    },
  };
}
```

- [ ] **Step 6: Bootstrap the repository**

```ts
// src/app/providers/configurePersistenceAdapters.ts
import { setArchiveRepository } from "@/app/store/archiveRepository";

interface PersistenceAdapters {
  draftRepository?: IDraftRepository;
  entryRepository?: IEntryRepository;
  prefsRepository?: PrefsRepo;
  archiveRepository?: IArchiveRepository;
}

if (adapters.archiveRepository) {
  setArchiveRepository(adapters.archiveRepository);
}
```

```ts
// src/app/providers/bootstrapAppRuntime.ts
import { createStorageArchiveRepository } from "@/data/repositories/storageArchiveRepository";
import { createSQLiteArchiveRepository } from "@/data/repositories/sqliteArchiveRepository";

const storageArchiveRepository = createStorageArchiveRepository(storage);
let archiveRepository = adapters.archiveRepository ?? storageArchiveRepository;

if (!adapters.archiveRepository && shouldUseSQLitePersistence()) {
  const sqliteArchiveRepository = createSQLiteArchiveRepository(client);
  archiveRepository = sqliteArchiveRepository;
}

configurePersistenceAdapters({
  draftRepository,
  entryRepository,
  prefsRepository,
  archiveRepository,
});
```

- [ ] **Step 7: Run tests to verify they pass**

Run:

```bash
pnpm test:unit -- tests/data/storageArchiveRepository.test.ts tests/data/sqliteArchiveRepository.test.ts tests/app/bootstrapAppRuntime.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/data/repositories/archive.repository.ts src/data/repositories/storageArchiveRepository.ts src/data/repositories/sqliteArchiveRepository.ts src/app/store/archiveRepository.ts src/app/providers/configurePersistenceAdapters.ts src/app/providers/bootstrapAppRuntime.ts src/data/db/schema.ts src/data/db/migrations.ts tests/data/storageArchiveRepository.test.ts tests/data/sqliteArchiveRepository.test.ts tests/app/bootstrapAppRuntime.test.ts
git commit -m "feat: add archive persistence"
```

### Task 4: Add Archive Store And Route

**Files:**
- Create: `src/app/store/useArchiveStore.ts`
- Create: `src/features/archive/archiveDisplay.ts`
- Modify: `src/shared/constants/routes.ts`
- Modify: `src/pages.json`
- Modify: `src/shared/i18n.ts`
- Test: `tests/app/archiveStore.test.ts`
- Test: `tests/features/archiveDisplay.test.ts`

- [ ] **Step 1: Write the failing store/display tests**

```ts
// tests/app/archiveStore.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryJsonStorage } from "@/shared/utils/storage";
import { createStorageArchiveRepository } from "@/data/repositories/storageArchiveRepository";
import { setArchiveRepository } from "@/app/store/archiveRepository";
import { useArchiveStore } from "@/app/store/useArchiveStore";

describe("archive store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setArchiveRepository(createStorageArchiveRepository(createMemoryJsonStorage()));
  });

  it("loads today's question and answers it once", async () => {
    const store = useArchiveStore();
    await store.resolveTodayQuestion("2026-04-21");
    expect(store.todayQuestion?.question.length).toBeGreaterThan(0);

    await store.answerToday("今天想留下安静。");

    expect(store.todayEntry?.answer).toBe("今天想留下安静。");
    expect(store.hasAnsweredToday).toBe(true);
  });
});
```

```ts
// tests/features/archiveDisplay.test.ts
import { describe, expect, it } from "vitest";
import { formatArchiveHistoryDate } from "@/features/archive/archiveDisplay";

describe("archiveDisplay", () => {
  it("formats history date for zh-CN", () => {
    expect(formatArchiveHistoryDate("2026-04-21", "zh-CN")).toBe("04.21");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test:unit -- tests/app/archiveStore.test.ts tests/features/archiveDisplay.test.ts
```

Expected: FAIL with missing store or helper modules.

- [ ] **Step 3: Implement the Archive store**

```ts
// src/app/store/useArchiveStore.ts
import { defineStore } from "pinia";
import { getArchiveRepository } from "@/app/store/archiveRepository";
import { createArchiveQuestionResolver, type ArchiveQuestionProvider } from "@/features/archive/archiveQuestions";
import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";

const defaultProvider: ArchiveQuestionProvider = {
  async getQuestion() {
    return null;
  },
};

export const useArchiveStore = defineStore("archive", {
  state: () => ({
    todayDate: "",
    todayQuestion: null as ArchiveQuestion | null,
    todayEntry: null as ArchiveEntry | null,
    history: [] as ArchiveEntry[],
    oneYearAgoEntry: null as ArchiveEntry | null,
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    hasAnsweredToday(state): boolean {
      return Boolean(state.todayEntry?.answeredAt);
    },
  },
  actions: {
    async resolveTodayQuestion(date: string) {
      this.isLoading = true;
      this.error = null;
      this.todayDate = date;
      try {
        const repository = getArchiveRepository();
        const existingEntry = await repository.getByDate(date);
        this.todayEntry = existingEntry;
        if (existingEntry) {
          this.todayQuestion = {
            date,
            question: existingEntry.question,
            source: existingEntry.questionSource,
            createdAt: existingEntry.createdAt,
          };
        } else {
          const existingQuestion = await repository.getQuestionByDate(date);
          const resolver = createArchiveQuestionResolver(defaultProvider);
          const question = existingQuestion ?? await resolver.resolve(date);
          await repository.saveQuestion(question);
          this.todayQuestion = question;
        }
        this.history = await repository.listAnswered();
        this.oneYearAgoEntry = await repository.getOneYearAgo(date);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to resolve archive question.";
      } finally {
        this.isLoading = false;
      }
    },
    async answerToday(answer: string) {
      if (!this.todayDate) throw new Error("Missing today date.");
      this.isLoading = true;
      this.error = null;
      try {
        this.todayEntry = await getArchiveRepository().answerToday(this.todayDate, answer);
        this.history = await getArchiveRepository().listAnswered();
        this.oneYearAgoEntry = await getArchiveRepository().getOneYearAgo(this.todayDate);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to answer archive question.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
```

- [ ] **Step 4: Add Archive display helpers and route wiring**

```ts
// src/features/archive/archiveDisplay.ts
import { formatDate } from "@/shared/utils/date";

export function formatArchiveHistoryDate(date: string, locale = "zh-CN"): string {
  return formatDate(date, locale === "en-US" ? "MM/DD" : "MM.DD");
}
```

```ts
// src/shared/constants/routes.ts
export const ROUTES = {
  home: "features/home/pages/HomePage",
  homeCardShowcase: "features/home/pages/HomeCardShowcasePage",
  editor: "features/editor/pages/EditorPage",
  mailbox: "features/mailbox/pages/MailboxPage",
  calendar: "features/calendar/pages/CalendarPage",
  dayArchive: "features/day-archive/pages/DayArchivePage",
  profile: "features/profile/pages/ProfilePage",
  profileAlbum: "features/profile/pages/ProfileAlbumPage",
  archive: "features/archive/pages/ArchivePage",
} as const;
```

```json
// src/pages.json (add page entry)
{
  "path": "features/archive/pages/ArchivePage",
  "style": {
    "navigationStyle": "custom",
    "disableScroll": true
  }
}
```

- [ ] **Step 5: Add Archive i18n copy**

```ts
// src/shared/i18n.ts
archive: {
  title: "五分钟档案馆",
  eyebrow: "私人档案馆",
  today: "今日档案",
  oneYearAgo: "一年前的今天",
  history: "往期档案",
  answerPlaceholder: "把这一刻留给未来的自己……",
  save: "归档",
  saved: "已归档。",
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```bash
pnpm test:unit -- tests/app/archiveStore.test.ts tests/features/archiveDisplay.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/store/useArchiveStore.ts src/features/archive/archiveDisplay.ts src/shared/constants/routes.ts src/pages.json src/shared/i18n.ts tests/app/archiveStore.test.ts tests/features/archiveDisplay.test.ts
git commit -m "feat: add archive store and routing"
```

### Task 5: Build Archive Page Views

**Files:**
- Create: `src/features/archive/pages/ArchivePage.vue`
- Test: `tests/release/darkShellStructure.test.ts`

- [ ] **Step 1: Write the failing Archive page structure test**

```ts
// tests/release/darkShellStructure.test.ts (append)
it("renders archive page states and chisu-style iconography", () => {
  const archivePage = readFileSync("src/features/archive/pages/ArchivePage.vue", "utf8");
  expect(archivePage).toContain("view === 'main'");
  expect(archivePage).toContain("view === 'write'");
  expect(archivePage).toContain("view === 'success'");
  expect(archivePage).toContain("view === 'memory'");
  expect(archivePage).toContain("ChisuSymbol");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test:unit -- tests/release/darkShellStructure.test.ts
```

Expected: FAIL because `ArchivePage.vue` does not exist.

- [ ] **Step 3: Implement the Archive page**

```vue
<!-- src/features/archive/pages/ArchivePage.vue -->
<template>
  <view class="archive-page theme-dark">
    <view v-if="view === 'main'" class="archive-page__main">
      <text class="archive-page__eyebrow">{{ copy.archive.eyebrow }}</text>
      <text class="archive-page__title">{{ copy.archive.title }}</text>
      <view class="archive-page__today-card" @tap="handleOpenToday">
        <text class="archive-page__today-question">「{{ archiveStore.todayQuestion?.question }}」</text>
        <text class="archive-page__today-action">
          {{ archiveStore.hasAnsweredToday ? copy.archive.saved : "点击作答" }}
        </text>
      </view>
      <view v-if="archiveStore.oneYearAgoEntry" class="archive-page__memory-card" @tap="handleOpenMemory(archiveStore.oneYearAgoEntry)">
        <text>{{ copy.archive.oneYearAgo }}</text>
        <text>「{{ archiveStore.oneYearAgoEntry.question }}」</text>
      </view>
    </view>

    <view v-else-if="view === 'write'" class="archive-page__write">
      <text class="archive-page__write-question">「{{ archiveStore.todayQuestion?.question }}」</text>
      <textarea v-model="draftAnswer" class="archive-page__write-area" :maxlength="500" />
      <text class="archive-page__write-count">{{ draftAnswer.length }} / 500</text>
      <button class="archive-page__submit" @tap="handleSubmit">{{ copy.archive.save }}</button>
    </view>
  </view>
</template>
```

- [ ] **Step 4: Add the view-state and submit logic**

```ts
// src/features/archive/pages/ArchivePage.vue <script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useArchiveStore } from "@/app/store/useArchiveStore";
import { formatDate } from "@/shared/utils/date";
import { t } from "@/shared/i18n";

type ArchivePageView = "main" | "write" | "success" | "memory";

const archiveStore = useArchiveStore();
const copy = computed(() => t("zh-CN"));
const view = ref<ArchivePageView>("main");
const draftAnswer = ref("");

function handleOpenToday() {
  view.value = archiveStore.hasAnsweredToday ? "main" : "write";
}

async function handleSubmit() {
  await archiveStore.answerToday(draftAnswer.value.trim());
  view.value = "success";
}

onLoad(async () => {
  await archiveStore.resolveTodayQuestion(formatDate(new Date(), "YYYY-MM-DD"));
});
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
pnpm test:unit -- tests/release/darkShellStructure.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/archive/pages/ArchivePage.vue tests/release/darkShellStructure.test.ts
git commit -m "feat: add archive page states"
```

### Task 6: Build Dark Shell Page And Today Section

**Files:**
- Create: `src/features/dark-shell/pages/DarkShellPage.vue`
- Create: `src/features/dark-shell/components/DarkTodaySection.vue`
- Modify: `src/shared/i18n.ts`
- Test: `tests/release/homeStitchParity.test.ts`

- [ ] **Step 1: Write the failing dark Today shell test**

```ts
// tests/release/homeStitchParity.test.ts (append)
it("renders the dark shell today page with archive card and recent jotting list", () => {
  const shell = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");
  const today = readFileSync("src/features/dark-shell/components/DarkTodaySection.vue", "utf8");

  expect(shell).toContain("DarkTodaySection");
  expect(shell).toContain("DARK_SHELL_TABS");
  expect(today).toContain("今日一问");
  expect(today).toContain("最近随笔");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test:unit -- tests/release/homeStitchParity.test.ts
```

Expected: FAIL because the dark shell files do not exist.

- [ ] **Step 3: Implement the shell scaffold**

```vue
<!-- src/features/dark-shell/pages/DarkShellPage.vue -->
<template>
  <view class="dark-shell theme-dark">
    <DarkTodaySection v-if="activeTab === 'today'" @open-archive="handleOpenArchive" />
    <DarkWritingSection v-else-if="activeTab === 'jotting'" />
    <DarkFutureSection v-else-if="activeTab === 'future'" />
    <DarkMailboxSection v-else />

    <view class="dark-shell__tabs">
      <button v-for="tab in tabs" :key="tab.id" class="dark-shell__tab" @tap="activeTab = tab.id">
        <ChisuSymbol :symbol="tab.symbol" :tone="activeTab === tab.id ? 'active' : 'muted'" />
        <text>{{ locale === 'en-US' ? tab.labelEn : tab.labelZh }}</text>
      </button>
    </view>
  </view>
</template>
```

```ts
// src/features/dark-shell/pages/DarkShellPage.vue <script setup>
import { computed, ref } from "vue";
import { ROUTES } from "@/shared/constants/routes";
import { DARK_SHELL_TABS, type DarkShellTabId } from "@/features/dark-shell/darkShellTabs";
import { useSettingsStore } from "@/app/store/useSettingsStore";

const settingsStore = useSettingsStore();
const locale = computed(() => settingsStore.locale);
const tabs = DARK_SHELL_TABS;
const activeTab = ref<DarkShellTabId>("today");

function handleOpenArchive() {
  uni.navigateTo({ url: `/${ROUTES.archive}` });
}
```

- [ ] **Step 4: Implement the Today section**

```vue
<!-- src/features/dark-shell/components/DarkTodaySection.vue -->
<template>
  <view class="dark-today">
    <text class="dark-today__date">{{ displayDate }}</text>
    <text class="dark-today__title">{{ homeHeroTitle }}</text>
    <text class="dark-today__subtitle">{{ subtitle }}</text>

    <view class="dark-today__section-head">
      <text class="dark-today__section-label">今日一问 · 五分钟档案馆</text>
    </view>
    <view class="dark-today__question-card" @tap="$emit('open-archive')">
      <text class="dark-today__question">{{ todayQuestion }}</text>
      <view class="dark-today__question-foot">
        <text>点击作答</text>
        <text>{{ streakText }}</text>
      </view>
    </view>

    <view class="dark-today__stats">
      <view v-for="item in stats" :key="item.label" class="dark-today__stat">
        <text class="dark-today__stat-value">{{ item.value }}</text>
        <text class="dark-today__stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="dark-today__section-head">
      <text class="dark-today__section-label">最近随笔</text>
    </view>
  </view>
</template>
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
pnpm test:unit -- tests/release/homeStitchParity.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/dark-shell/pages/DarkShellPage.vue src/features/dark-shell/components/DarkTodaySection.vue tests/release/homeStitchParity.test.ts
git commit -m "feat: add dark shell today page"
```

### Task 7: Build Dark Writing, Future, And Mailbox Sections

**Files:**
- Create: `src/features/dark-shell/components/DarkWritingSection.vue`
- Create: `src/features/dark-shell/components/DarkFutureSection.vue`
- Create: `src/features/dark-shell/components/DarkMailboxSection.vue`
- Create: `src/features/dark-shell/darkMailboxView.ts`
- Modify: `src/app/store/useMailboxStore.ts`
- Test: `tests/features/darkMailboxView.test.ts`
- Test: `tests/release/mailboxStitchParity.test.ts`

- [ ] **Step 1: Write the failing dark mailbox and section tests**

```ts
// tests/features/darkMailboxView.test.ts
import { describe, expect, it } from "vitest";
import { buildDarkMailboxList } from "@/features/dark-shell/darkMailboxView";

describe("darkMailboxView", () => {
  it("merges mailbox collections into a single date-sorted list", () => {
    const result = buildDarkMailboxList({
      documentaryDiaries: [{ id: "d1", recordDate: "2026-04-20", savedAt: "2026-04-20T08:00:00.000Z" }],
      documentaryJottings: [],
      distantOpenedFutures: [{ id: "f1", recordDate: "2026-04-19", savedAt: "2026-04-19T08:00:00.000Z" }],
      distantPendingFutures: [],
    } as any);

    expect(result.map((item) => item.id)).toEqual(["d1", "f1"]);
  });
});
```

```ts
// tests/release/mailboxStitchParity.test.ts (append)
it("uses the unified dark mailbox list and removes segmented switches", () => {
  const mailboxSection = readFileSync("src/features/dark-shell/components/DarkMailboxSection.vue", "utf8");
  expect(mailboxSection).toContain("buildDarkMailboxList");
  expect(mailboxSection).not.toContain("tab-group--primary");
  expect(mailboxSection).toContain("▦");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test:unit -- tests/features/darkMailboxView.test.ts tests/release/mailboxStitchParity.test.ts
```

Expected: FAIL with missing dark mailbox files.

- [ ] **Step 3: Implement the dark writing section**

```vue
<!-- src/features/dark-shell/components/DarkWritingSection.vue -->
<template>
  <view class="dark-writing">
    <view class="dark-writing__head">
      <text class="dark-writing__eyebrow">{{ eyebrow }}</text>
      <view class="dark-writing__title-row">
        <text class="dark-writing__title" :class="{ 'dark-writing__title--active': activeMode === 'jotting' }" @tap="activeMode = 'jotting'">随 笔</text>
        <text class="dark-writing__title" :class="{ 'dark-writing__title--active': activeMode === 'diary' }" @tap="activeMode = 'diary'">日 记</text>
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 4: Implement the dark future and mailbox sections**

```vue
<!-- src/features/dark-shell/components/DarkFutureSection.vue -->
<template>
  <view class="dark-future">
    <text class="dark-future__eyebrow">Letters to Future Self</text>
    <text class="dark-future__title">致未来</text>
    <view class="dark-future__intro" @tap="openFutureEditor">
      <ChisuSymbol symbol="✉" tone="muted" />
      <text class="dark-future__intro-title">写给以后的你</text>
      <text class="dark-future__intro-copy">信件将在你指定的日期悄悄出现在邮箱里</text>
    </view>
  </view>
</template>
```

```ts
// src/features/dark-shell/darkMailboxView.ts
import type { EntryMailboxCollections } from "@/data/repositories/entry.repository";
import type { Entry } from "@/domain/entry/types";

export function buildDarkMailboxList(collections: EntryMailboxCollections): Entry[] {
  return [
    ...collections.distantOpenedFutures,
    ...collections.distantPendingFutures,
    ...collections.documentaryDiaries,
    ...collections.documentaryJottings,
  ].sort((a, b) => (b.savedAt ?? b.createdAt).localeCompare(a.savedAt ?? a.createdAt));
}
```

```vue
<!-- src/features/dark-shell/components/DarkMailboxSection.vue -->
<template>
  <view class="dark-mailbox">
    <view class="dark-mailbox__head">
      <text class="dark-mailbox__eyebrow">Mailbox</text>
      <text class="dark-mailbox__title">邮 箱</text>
      <button class="dark-mailbox__calendar" @tap="openCalendar"><ChisuSymbol symbol="▦" tone="muted" /></button>
    </view>
    <view v-for="entry in mergedEntries" :key="entry.id" class="dark-mailbox__item" @tap="openEntry(entry)">
      <text class="dark-mailbox__from">{{ resolveMailboxSource(entry) }}</text>
      <text class="dark-mailbox__subject">{{ entry.title }}</text>
      <text class="dark-mailbox__preview">{{ entry.content }}</text>
    </view>
  </view>
</template>
```

- [ ] **Step 5: Add unified mailbox data access to the store**

```ts
// src/app/store/useMailboxStore.ts
getters: {
  mergedEntries(state): Entry[] {
    return [
      ...state.distantOpenedFutures,
      ...state.distantPendingFutures,
      ...state.documentaryDiaries,
      ...state.documentaryJottings,
    ];
  },
},
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```bash
pnpm test:unit -- tests/features/darkMailboxView.test.ts tests/release/mailboxStitchParity.test.ts tests/app/mailboxStore.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/dark-shell/components/DarkWritingSection.vue src/features/dark-shell/components/DarkFutureSection.vue src/features/dark-shell/components/DarkMailboxSection.vue src/features/dark-shell/darkMailboxView.ts src/app/store/useMailboxStore.ts tests/features/darkMailboxView.test.ts tests/release/mailboxStitchParity.test.ts tests/app/mailboxStore.test.ts
git commit -m "feat: add dark writing future and mailbox sections"
```

### Task 8: Apply Dark Calendar Styling And Final Integration

**Files:**
- Modify: `src/features/calendar/pages/CalendarPage.vue`
- Modify: `src/features/home/pages/HomePage.vue`
- Modify: `src/shared/i18n.ts`
- Test: `tests/release/calendarStitchParity.test.ts`
- Test: `tests/release/visualRegressionStructure.test.ts`
- Test: `tests/release/settingsI18nBehavior.test.ts`

- [ ] **Step 1: Write the failing dark calendar integration test**

```ts
// tests/release/calendarStitchParity.test.ts (append)
it("includes chisu-v2 dark calendar treatments without changing selection logic", () => {
  const calendarPage = readFileSync("src/features/calendar/pages/CalendarPage.vue", "utf8");
  expect(calendarPage).toContain("theme-dark");
  expect(calendarPage).toContain("calendar-page__month-nav");
  expect(calendarPage).toContain("calendar-page__day--selected");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test:unit -- tests/release/calendarStitchParity.test.ts tests/release/visualRegressionStructure.test.ts
```

Expected: FAIL until the dark visual structure has been applied.

- [ ] **Step 3: Update CalendarPage dark-mode class structure**

```vue
<!-- src/features/calendar/pages/CalendarPage.vue -->
<view class="calendar-page" :class="[themeClass, typographyClass, { 'calendar-page--dark-shell': themeClass === 'theme-dark' }]">
  <!-- keep existing calendar logic -->
</view>
```

```css
/* src/features/calendar/pages/CalendarPage.vue */
.theme-dark.calendar-page--dark-shell {
  background: #0C0A08;
  color: #EAE2CE;
}

.theme-dark .calendar-page__day--selected {
  background: #EAE2CE;
  color: #0C0A08;
}

.theme-dark .calendar-page__marker {
  background: #A83228;
}
```

- [ ] **Step 4: Wire Today card behavior to Archive direct-write vs main-view**

```vue
<!-- src/features/dark-shell/components/DarkTodaySection.vue -->
<view class="dark-today__question-card" @tap="openArchive">
  <!-- existing card -->
</view>
```

```ts
// src/features/dark-shell/components/DarkTodaySection.vue <script setup>
const emit = defineEmits<{
  (event: "open-archive", mode: "main" | "write"): void;
}>();

function openArchive() {
  emit("open-archive", archiveStore.hasAnsweredToday ? "main" : "write");
}
```

- [ ] **Step 5: Run full verification for the feature slice**

Run:

```bash
pnpm test:unit -- tests/features/darkShellTabs.test.ts tests/features/archiveQuestions.test.ts tests/features/archiveDisplay.test.ts tests/features/darkMailboxView.test.ts tests/data/storageArchiveRepository.test.ts tests/data/sqliteArchiveRepository.test.ts tests/app/archiveStore.test.ts tests/app/mailboxStore.test.ts tests/release/darkShellStructure.test.ts tests/release/homeStitchParity.test.ts tests/release/mailboxStitchParity.test.ts tests/release/calendarStitchParity.test.ts tests/release/visualRegressionStructure.test.ts
pnpm type-check
```

Expected:

- Vitest exits with `PASS`
- `pnpm type-check` exits with no errors

- [ ] **Step 6: Commit**

```bash
git add src/features/calendar/pages/CalendarPage.vue src/features/dark-shell/components/DarkTodaySection.vue src/features/dark-shell/pages/DarkShellPage.vue src/shared/i18n.ts tests/release/calendarStitchParity.test.ts tests/release/visualRegressionStructure.test.ts tests/release/settingsI18nBehavior.test.ts
git commit -m "feat: finish dark shell archive integration"
```

## Self-Review

### Spec coverage

- Dark shell and theme gate: covered by Tasks 1, 6, 7, and 8.
- `chisu-v2.jsx` token and symbol replication: covered by Tasks 1, 6, 7, and 8.
- Archive independent data model and fallback AI question strategy: covered by Tasks 2, 3, 4, and 5.
- Today page Archive entry card and recent jotting list: covered by Task 6 and Task 8.
- Jotting/Diary dual large-title entry: covered by Task 7.
- Future top intro as the only creation entry: covered by Task 7.
- Unified dark mailbox and preserved calendar shortcut: covered by Task 7.
- Calendar dark restyle with preserved logic: covered by Task 8.
- Verification and light-mode protection: covered by Task 8.

No spec requirement is intentionally left unassigned.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders.
- Every task includes exact file paths.
- Every task includes concrete commands.
- Every test-writing step includes concrete sample test code.

### Type consistency

- Dark shell tab ids use `today | jotting | future | mailbox` consistently.
- Archive entities use `ArchiveQuestion` and `ArchiveEntry` consistently.
- Archive repository contract and store actions use the same method names:
  - `saveQuestion`
  - `getQuestionByDate`
  - `answerToday`
  - `getByDate`
  - `listAnswered`
  - `getOneYearAgo`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-21-dark-mode-archive-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
