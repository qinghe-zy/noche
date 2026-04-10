# noche 前后端分离契约

## 1. 目标

本文档定义当前阶段前端可以稳定依赖的接口面，以及后端后续必须保持兼容的契约。

这里的“后端”不是远程 HTTP 服务，而是：

- `src/app/store/**`
- `src/domain/**`
- `src/data/**`

前端页面层只围绕本文档开发、联调、写 mock。即使底层从内存仓储切到 SQLite，也不应该要求前端重写页面逻辑。

## 2. 分层边界

### 2.1 前端允许直接依赖

- `src/app/store/**`
- `src/domain/**/types.ts`
- `src/shared/constants/routes.ts`
- `src/shared/constants/draftKeys.ts`
- 纯规则函数：
  - `src/domain/time/rules.ts`
  - `src/domain/draft/rules.ts`
  - `src/domain/entry/rules.ts`

### 2.2 前端禁止直接依赖

- `src/data/db/**`
- `src/data/mappers/**`
- `src/data/repositories/*Repo.ts`
- `src/data/repositories/*Repository.ts`
- 任何 SQLite client / schema 细节

### 2.3 当前例外

当前 editor 页为了完成最小闭环，直接调用了 `createEntryFromDraft()`。

这属于“过渡期页面直接拼装 use case”的实现，不建议后续页面继续复制。前端若要完全脱离后端并行开发，应按本文档的“语义契约”写 mock，不要把 repository 或 SQLite 细节带进页面。

## 3. 核心数据契约

### 3.1 Entry

```ts
export type EntryType = "diary" | "jotting" | "future";
export type EntryStatus = "saved" | "sealed" | "unlocked";

export interface Entry {
  id: string;
  type: EntryType;
  status: EntryStatus;
  title: string | null;
  content: string;
  recordDate: string;        // YYYY-MM-DD
  createdAt: string;         // ISO string
  updatedAt: string;         // ISO string
  savedAt: string | null;    // ISO string
  unlockDate: string | null; // YYYY-MM-DD, future only
  unlockedAt: string | null; // ISO string
  destroyedAt: string | null;
  isDestroyed?: boolean;
}
```

### 3.2 Draft

```ts
export interface Draft {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  recordDate: string | null;
  slotKey: string;
  linkedEntryId: string | null;
  createdAt: string;
  updatedAt: string;
  lastBackgroundSavedAt: string | null;
  unlockDate?: string | null;
}
```

### 3.3 SettingsState

```ts
export interface SettingsState {
  theme: "system" | "light" | "dark";
  locale: string;
  weekStartsOn: 0 | 1;
}
```

### 3.4 AppState

```ts
export type AppBootStatus = "idle" | "ready";

interface AppState {
  bootStatus: AppBootStatus;
  currentRoute: string;
}
```

## 4. 稳定常量契约

### 4.1 路由

```ts
export const ROUTES = {
  home: "features/home/pages/HomePage",
  editor: "features/editor/pages/EditorPage",
  mailbox: "features/mailbox/pages/MailboxPage",
  calendar: "features/calendar/pages/CalendarPage",
  profile: "features/profile/pages/ProfilePage",
} as const;
```

### 4.2 草稿槽位

```ts
export const DRAFT_KEYS = {
  JOTTING: "draft_jotting",
  FUTURE: "draft_future",
  diary: (date: string) => `draft_diary_${date}`,
} as const;
```

语义规则：

- `diary`：按日期唯一槽位，`draft_diary_YYYY-MM-DD`
- `jotting`：全局唯一活跃槽位，`draft_jotting`
- `future`：全局唯一活跃槽位，`draft_future`

## 5. 前端可消费的 store 契约

## 5.1 useAppStore

用途：应用启动与当前路由的最小运行态。

状态：

- `bootStatus: "idle" | "ready"`
- `currentRoute: string`

动作：

```ts
markReady(): void
setCurrentRoute(route: string): void
```

状态说明：

- 已实现
- 当前无持久化

## 5.2 useSettingsStore

用途：主题、本地化、周起始日。

状态：

- `theme`
- `locale`
- `weekStartsOn`

动作：

```ts
setTheme(theme: "system" | "light" | "dark"): void
setLocale(locale: string): void
```

状态说明：

- 已实现内存态
- 尚未接 preferences 持久化

## 5.3 useDraftStore

用途：editor 的草稿生命周期。

状态：

- `drafts: Record<string, Draft>`
- `activeDraftKey: string | null`
- `activeDraft: Draft | null`
- `isLoading: boolean`
- `error: string | null`

动作：

```ts
openDraft(input: {
  type: EntryType;
  recordDate?: string | null;
  linkedEntryId?: string | null;
}): Promise<Draft>

saveActiveDraft(patch?: {
  title?: string;
  content?: string;
  unlockDate?: string | null;
}): Promise<Draft | null>

removeDraft(slotKey: string): Promise<void>

setActiveDraftKey(slotKey: string | null): void
```

行为约束：

- `openDraft()`：
  - 先按槽位查已存在草稿
  - 未命中则创建新草稿
  - 返回值始终是当前活动 draft
- `saveActiveDraft()`：
  - 仅保存 `activeDraft`
  - 会更新 `updatedAt`
  - 会写入 `lastBackgroundSavedAt`
- `removeDraft()`：
  - 删除指定槽位
  - 如果删除的是当前活动 draft，会清空 `activeDraftKey`

错误约定：

- `openDraft / saveActiveDraft / removeDraft` 在失败时：
  - 会设置 `error`
  - 会 `throw`

前端建议：

- `try/catch` 只处理 toast / fallback UI
- 真实错误状态展示以 `draftStore.error` 为准

状态说明：

- 已实现
- 当前底层是内存 `IDraftRepository`
- 后续切 SQLite 后不应改变以上方法签名

## 5.4 useEntryStore

用途：正式 entry 的保存、按日期读取、销毁。

状态：

- `entries: Record<string, Entry>`
- `entryList: Entry[]`
- `isLoading: boolean`
- `error: string | null`

动作：

```ts
fetchEntriesByDate(recordDate: string): Promise<void>
saveEntry(entry: Entry): Promise<void>
destroyEntry(entryId: string): Promise<void>
upsertEntry(entry: Entry): void
removeEntry(entryId: string): void
```

行为约束：

- `fetchEntriesByDate(recordDate)`：
  - 从 repository 拉取指定日期的 active entries
  - 结果写入 `entries`
- `saveEntry(entry)`：
  - 保存或更新 entry
  - 成功后写入 `entries`
- `destroyEntry(entryId)`：
  - 调用 repository 删除
  - 成功后从 `entries` 中删除

错误约定：

- `useEntryStore` 当前与 `useDraftStore` 不一致：
  - 会设置 `error`
  - 不主动 `throw`

前端建议：

- 把 `entryStore.error` 当作错误真相
- 不要依赖 `saveEntry()` 抛异常来判断失败

后端待办：

- 后续应统一 draft / entry store 的错误语义

状态说明：

- 已实现
- 当前底层是内存 `IEntryRepository`
- 后续切 SQLite 后不应改变以上方法签名

## 6. 领域 use case 契约

前端如需 mock editor 流，可以按以下语义契约模拟，而不是直接 mock repository。

### 6.1 createDraft

```ts
createDraft(input: {
  type: EntryType;
  recordDate?: string | null;
  linkedEntryId?: string | null;
}): Draft
```

规则：

- `diary` 默认锁定当天 `recordDate`
- 自动生成 `slotKey`

### 6.2 markDraftBackgroundSaved

```ts
markDraftBackgroundSaved(draft: Draft): Draft
```

规则：

- 同时更新 `updatedAt`
- 同时更新 `lastBackgroundSavedAt`

### 6.3 createEntryFromDraft

```ts
createEntryFromDraft(draft: Draft): Entry
```

规则：

- 空白内容不能正式保存
- `future` 必须有 `unlockDate`
- formal save 时写入 `savedAt`
- `future` 保存后状态为 `sealed`
- `diary / jotting` 保存后状态为 `saved`
- 若 `linkedEntryId` 存在，则沿用该 id

### 6.4 destroyEntry

```ts
destroyEntry(
  entry: Entry,
  options?: { cleanupHook?: (entry: Entry) => Promise<void> | void }
): Promise<Entry>
```

规则：

- 统一删除入口
- 返回已写入 `destroyedAt` 的 entry

### 6.5 时间规则

```ts
lockRecordDate(source?): string
isFutureUnlockable(unlockDate, now?): boolean
isValidFutureLetterDate(candidate, now?): boolean
```

规则：

- `recordDate` 一旦进入编辑态即锁定
- future unlock 最早只能选明天
- 解锁判定以本地日为粒度

## 7. feature 契约

## 7.1 Home

输入：

- 无必需数据输入

输出：

- 跳转 editor：
  - `#/features/editor/pages/EditorPage?type=diary`
  - `#/features/editor/pages/EditorPage?type=jotting`
  - `#/features/editor/pages/EditorPage?type=future`
- 跳转 mailbox / profile

状态：

- 已实现 UI
- 当前不消费业务数据

## 7.2 Editor

路由输入：

```ts
type query = {
  type: "diary" | "jotting" | "future";
}
```

前端最小联调时序：

1. 读取 `type`
2. 调 `draftStore.openDraft(...)`
3. 用户输入时调 `draftStore.saveActiveDraft(...)`
4. formal save 时：
   - 读取 `draftStore.activeDraft`
   - 调 `createEntryFromDraft(draft)`
   - 调 `entryStore.saveEntry(entry)`
   - 调 `draftStore.removeDraft(slotKey)`
5. 页面进入 read mode

输出状态：

- `edit`
- `read`

当前实现状态：

- 已实现最小闭环

后续待补：

- “续写”正式入口
- 读取已有 entry 后进入只读态
- 从 mailbox / calendar 打开指定 entry

## 7.3 Mailbox

产品职责：

- 展示“往日信件”
- 展示“待启之信”
- 允许进入阅读态
- 右上进入 calendar

前端应等待的后端契约：

```ts
interface MailboxFacade {
  pastEntries: Entry[];
  sealedFutureEntries: Entry[];
  isLoading: boolean;
  error: string | null;
  fetchPastEntries(): Promise<void>;
  fetchSealedFutureEntries(): Promise<void>;
}
```

列表规则：

- “往日信件”：
  - `diary`
  - `jotting`
  - 已解锁 `future`
- “待启之信”：
  - 未解锁 `future`
- 排序按 `recordDate` 倒序，不按 `updatedAt`

当前实现状态：

- UI 未实现
- store / facade 未实现
- repository 原始能力部分具备（`getAllActive` / `getByType`）

## 7.4 Calendar

产品职责：

- 展示有记录日期标记
- 点日期后决定：
  - 直接进单条阅读态
  - 进入当天归档列表
  - 新建该日 diary

前端应等待的后端契约：

```ts
type CalendarResolveResult =
  | { kind: "entry"; entryId: string }
  | { kind: "entry-list"; recordDate: string }
  | { kind: "new-diary"; recordDate: string };

interface CalendarFacade {
  markedDates: string[];
  isLoading: boolean;
  error: string | null;
  fetchMarkedDates(): Promise<void>;
  resolveDate(recordDate: string): Promise<CalendarResolveResult>;
}
```

规则：

- 有记录日期要标记
- 日历补写只能补 diary
- `future` 不参与可补写逻辑

当前实现状态：

- UI 未实现
- facade 未实现
- repository 原始能力部分具备（`getCalendarMarkedDates`）

## 7.5 Profile

产品职责：

- 主题
- 语言
- 周起始日
- 后续扩展：隐私锁、备份、关于

前端当前可依赖：

```ts
useSettingsStore()
```

后端建议目标契约：

```ts
interface ProfileFacade {
  settings: SettingsState;
  isLoading: boolean;
  error: string | null;
  hydrate(): Promise<void>;
  setTheme(theme: SettingsState["theme"]): Promise<void>;
  setLocale(locale: string): Promise<void>;
  setWeekStartsOn(value: 0 | 1): Promise<void>;
}
```

当前实现状态：

- 仅有内存 settings store
- preferences repository 已有占位接口
- 持久化未实现

## 8. repository 契约

这些接口属于后端内部边界，前端不直接使用，但为了前后端分离开发，需要知道后端会交付什么能力。

### 8.1 IEntryRepository

```ts
interface IEntryRepository {
  save(entry: Entry): Promise<void>;
  getById(id: string): Promise<Entry | null>;
  getByDate(recordDate: string): Promise<Entry[]>;
  getAllActive(): Promise<Entry[]>;
  getByType(type: EntryType): Promise<Entry[]>;
  deleteById(id: string): Promise<void>;
  getCalendarMarkedDates(): Promise<string[]>;
}
```

当前实现：

- `createMemoryEntryRepository()` 已实现
- SQLite `entryRepo.ts` 仍是占位

### 8.2 IDraftRepository

```ts
interface IDraftRepository {
  save(draft: Draft): Promise<void>;
  getBySlotKey(slotKey: string): Promise<Draft | null>;
  getAll(): Promise<Draft[]>;
  deleteBySlotKey(slotKey: string): Promise<void>;
}
```

当前实现：

- `createMemoryDraftRepository()` 已实现
- SQLite `draftRepo.ts` 仍是占位

### 8.3 PrefsRepo

```ts
interface PrefsRepo {
  get(key: string): Promise<{ key: string; value: string } | null>;
  set(record: { key: string; value: string }): Promise<void>;
}
```

当前实现：

- SQLite 占位存在
- 上层 facade 未实现

## 9. 前端 mock 建议

若前端要完全脱离后端开发，请只 mock 下列 6 类能力：

1. `useAppStore`
2. `useSettingsStore`
3. `useDraftStore`
4. `useEntryStore`
5. `MailboxFacade`（按本文档定义）
6. `CalendarFacade`（按本文档定义）

不要 mock：

- SQLite client
- mapper
- schema
- raw repository SQL record

原因：

- 这些属于后端内部替换面
- mock 到这一层会让前端绑定实现细节，后续 SQLite 落地时会二次返工

## 10. 当前阻塞与统一建议

### 10.1 已知不一致

- `useDraftStore` 失败时会 `throw`
- `useEntryStore` 失败时只写 `error`，不 `throw`

### 10.2 当前前端处理建议

- 页面层统一读取 `store.error`
- 对 draft store 补 `try/catch`
- 对 entry store 不依赖异常流

### 10.3 后端后续统一方向

推荐后续统一成二选一：

1. 全部 `throw + error`
2. 全部只写 `error`，不 `throw`

在统一之前，不应让前端自行猜测 store 的错误语义。
