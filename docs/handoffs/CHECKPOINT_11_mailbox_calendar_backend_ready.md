# CHECKPOINT 11 - Mailbox / Calendar Backend Facades Ready

## 1. 本轮概述

本轮聚焦 P0 后端能力补齐，没有重写正式页面，也没有引入 SQLite 细节。目标是先把 `Mailbox` / `Calendar` 的稳定读取面和 future unlock transition 收敛到后端边界里，让前端可以基于 memory repository 继续并行开发。

## 2. 本轮改动

- **新增 store facade**
  - `src/app/store/useMailboxStore.ts`
  - `src/app/store/useCalendarStore.ts`
- **新增共享读取边界**
  - `src/app/store/entryRepository.ts`
  - `src/app/store/entryReadFacade.ts`
- **新增统一领域查询规则**
  - `src/domain/services/entryQueryService.ts`
- **补齐 entry store 读取能力**
  - `src/app/store/useEntryStore.ts`
    - 新增 `fetchEntryById()`
    - 新增 `refreshFutureLetterStatus()`
    - `fetchEntriesByDate()` 改为走统一读取 facade
- **新增测试**
  - `tests/domain/entryQueryService.test.ts`
  - `tests/app/mailboxStore.test.ts`
  - `tests/app/calendarStore.test.ts`
  - `tests/app/entryStore.test.ts`（补 future unlock 读取验证）

## 3. 已交付契约

### 3.1 Mailbox

`useMailboxStore` 当前已可稳定提供：

- `pastEntries: Entry[]`
- `sealedFutureEntries: Entry[]`
- `pendingFutureEntries: Entry[]`（兼容别名，等同于 `sealedFutureEntries`）
- `isLoading: boolean`
- `error: string | null`
- `fetchPastEntries(): Promise<void>`
- `fetchSealedFutureEntries(): Promise<void>`
- `fetchEntryById(entryId: string): Promise<Entry | null>`
- `refreshMailbox(): Promise<void>`

规则已收口：

- “往日信件” = `diary` + `jotting` + 已解锁 `future`
- “待启之信” = 未解锁 `future`
- 排序按 `recordDate` 倒序，同日再按 `createdAt` 倒序

### 3.2 Calendar

`useCalendarStore` 当前已可稳定提供：

- `markedDates: string[]`
- `isLoading: boolean`
- `error: string | null`
- `fetchMarkedDates(): Promise<void>`
- `resolveDate(recordDate: string): Promise<CalendarResolveResult>`

其中：

```ts
type CalendarResolveResult =
  | { kind: "entry"; entryId: string }
  | { kind: "entry-list"; recordDate: string }
  | { kind: "new-diary"; recordDate: string };
```

当前决策规则：

- 单条可见记录 -> `entry`
- 同日多条可见记录 -> `entry-list`
- 无可见记录 -> `new-diary`
- sealed future 不进入 calendar 可见记录集合
- unlocked future 会进入 calendar 可见记录集合

### 3.3 Future unlock transition

future 解锁过渡现在统一经过两层：

1. `src/domain/services/entryQueryService.ts`
   - 负责纯规则：sealed -> unlocked 的判定、mailbox 分桶、calendar 可见性与 resolve 规则
2. `src/app/store/entryReadFacade.ts`
   - 负责读取 repository 后应用规则，并把已发生的解锁状态回写 repository

这样做的原因：

- 解锁判定本身属于领域规则，不应该散落在页面或 repository SQL 里
- 状态回写是读取副作用，适合放在 store facade / adapter 层统一处理
- 后续从 memory repository 切到 SQLite 时，页面仍然只依赖 store，不需要知道底层差异

## 4. 验证结果

- `pnpm test:unit`
  - 10 个测试文件通过
  - 22 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过

## 5. 尚未完成

- editor 正式保存流程仍是过渡态，页面内还直接拼了 `createEntryFromDraft()`；本轮没有为追求“完美收口”而动正式页面
- SQLite `draft / entry / prefs` repository 仍未实现
- mailbox / calendar 的正式页面 UI 与导航接线仍待前端继续落地
- Day Archive 页面后端数据接口仍未单独抽出
- settings persistence 仍未开始

## 6. 前端现在可依赖什么

前端 / Gemini 当前可以直接围绕以下接口开发 `Mailbox` / `Calendar` 页面，不需要依赖 SQLite：

- `useMailboxStore().pastEntries`
- `useMailboxStore().sealedFutureEntries`
- `useMailboxStore().pendingFutureEntries`
- `useMailboxStore().fetchPastEntries()`
- `useMailboxStore().fetchSealedFutureEntries()`
- `useMailboxStore().fetchEntryById(entryId)`
- `useCalendarStore().markedDates`
- `useCalendarStore().fetchMarkedDates()`
- `useCalendarStore().resolveDate(recordDate)`

如果只写页面 mock，请 mock store 输出，不要 mock repository / mapper / SQLite client。
