# noche 后端功能清单

## 1. 目标

本文档从后端视角梳理当前项目的能力面、完成状态和推荐推进顺序。

这里的“后端”指：

- 领域模型与规则
- use case
- store facade
- repository
- SQLite 持久化

## 2. 状态标记

- `done`：已可运行、已被当前页面使用
- `partial`：已有基础能力，但还不能支撑完整功能
- `todo`：尚未开始，或只有占位

## 3. 核心能力总览

| 模块 | 能力 | 状态 | 当前落点 | 备注 |
|---|---|---|---|---|
| Core | Entry / Draft 类型收敛 | done | `src/domain/**/types.ts` | 已统一为 `future / saved-sealed-unlocked / unlockDate` |
| Core | 草稿槽位规则 | done | `src/domain/draft/rules.ts` | 已有测试 |
| Core | 时间规则 | done | `src/domain/time/rules.ts` | 已支持 future 日期校验与解锁判定 |
| Editor | 打开草稿 | done | `useDraftStore.openDraft()` | 已接内存 draft repo |
| Editor | 背景保存草稿 | done | `useDraftStore.saveActiveDraft()` | 已更新时间戳 |
| Editor | formal save entry | done | `createEntryFromDraft()` + `useEntryStore.saveEntry()` | 已进入 read mode |
| Editor | 续写已有 entry | partial | `linkedEntryId` 已预留 | 缺读取指定 entry -> 回填 draft 的正式流程 |
| Entry | 按日期读取 | done | `useEntryStore.fetchEntriesByDate()` | 当前只支持日期维度 |
| Entry | 删除 entry | done | `useEntryStore.destroyEntry()` | 统一走 `destroyEntry` 语义 |
| Mailbox | 过去内容列表 | partial | `IEntryRepository.getAllActive()` | 缺 mailbox store / 分组 / 过滤 |
| Mailbox | 待启之信列表 | partial | `IEntryRepository.getByType("future")` | 缺 sealed/unlocked 分流 |
| Mailbox | 读取指定 entry | partial | `IEntryRepository.getById()` | 缺页面入口与 facade |
| Calendar | 日期标记 | partial | `IEntryRepository.getCalendarMarkedDates()` | 缺 calendar store / 页面解析 |
| Calendar | 日期跳转决策 | todo | 无 | 缺 single / list / new-diary 解析 |
| Profile | 设置内存态 | done | `useSettingsStore` | 仅内存，不持久化 |
| Profile | 设置持久化 | todo | `prefsRepo.ts` 占位 | 缺 facade 与 SQLite 实现 |
| Persistence | 内存 entry repo | done | `memoryEntryRepository.ts` | 当前主要运行路径 |
| Persistence | 内存 draft repo | done | `memoryDraftRepository.ts` | 当前主要运行路径 |
| Persistence | SQLite entry repo | todo | `entryRepo.ts` | 只有 TODO SQL |
| Persistence | SQLite draft repo | todo | `draftRepo.ts` | 只有 TODO SQL |
| Persistence | SQLite prefs repo | todo | `prefsRepo.ts` | 只有 TODO SQL |

## 4. 模块清单

## 4.1 Core / Domain

### 已完成

- `EntryType = diary | jotting | future`
- `EntryStatus = saved | sealed | unlocked`
- `unlockDate` 统一命名
- `DRAFT_KEYS` 与 `buildDraftSlotKey()` 已统一
- `lockRecordDate()` / `isFutureUnlockable()` / `isValidFutureLetterDate()` 已可用
- `canPersistEntry()` 已提供空白内容拦截

### 未完成

- future 从 `sealed` 自动进入 `unlocked` 的 use case 还没有封装成统一入口
- “读取 entry -> 切换成阅读态 -> 续写回编辑态”的完整 use case 还没有抽出来

## 4.2 Editor Backend

### 已完成

- 打开 diary / jotting / future 三类草稿
- 对当前活动草稿做背景保存
- formal save 后生成正式 entry
- 删除当前草稿
- 页面已可同页进入 read mode

### 未完成

- 续写已有 entry
- 未来信阅读页从 sealed -> unlocked 的状态切换
- editor read mode 打开指定 entry 的统一入口

### 推荐下一步

1. 增加 `fetchEntryById(entryId)` facade
2. 增加 `resumeEntry(entryId)` use case
3. 把 `createEntryFromDraft + saveEntry + removeDraft` 收敛成单一 action，避免页面手写流程

## 4.3 Mailbox Backend

### 当前前端会需要的能力

- 拉取“往日信件”列表
- 拉取“待启之信”列表
- 读取指定条目
- 按 `recordDate` 倒序

### 已有基础

- `getAllActive()`
- `getByType(type)`
- `getById(id)`

### 缺口

- 没有 `useMailboxStore`
- 没有 `pastEntries / sealedFutureEntries` 两个稳定列表
- 没有把 `future` 依据解锁时间拆为 `sealed / unlocked`
- 没有“点击卡片进入阅读态”的后端路径

### 推荐下一步

1. 新增 `useMailboxStore`
2. 抽出 future 解锁归类逻辑
3. 提供 `fetchPastEntries()` / `fetchSealedFutureEntries()` / `fetchEntryById()`

## 4.4 Calendar Backend

### 当前前端会需要的能力

- 标记有内容的日期
- 点击日期后返回跳转决策

### 已有基础

- `getCalendarMarkedDates()` 已能返回带记录日期

### 缺口

- 没有 calendar store
- 没有 “单条 / 多条 / 无记录” 三分流解析
- 没有“当天归档列表页”的后端数据接口

### 推荐下一步

1. 新增 `useCalendarStore`
2. 定义 `resolveDate(recordDate)` 返回：
   - `entry`
   - `entry-list`
   - `new-diary`
3. 新增“按日期列出条目”的稳定 facade

## 4.5 Profile Backend

### 已完成

- `useSettingsStore`
  - `theme`
  - `locale`
  - `weekStartsOn`

### 缺口

- `weekStartsOn` 还没有 setter
- preferences 持久化没接上
- 隐私锁 / 备份 / 关于 都还没有后端模型

### 推荐下一步

1. 补 `setWeekStartsOn`
2. 设计 settings hydrate/save facade
3. 再决定隐私锁与备份是否进入当前阶段

## 4.6 Persistence / SQLite

### 已完成

- schema 已预留：
  - `entries`
  - `drafts`
  - `preferences`
- mapper 已有：
  - `mapEntryToRecord / mapRecordToEntry`
  - `mapDraftToRecord / mapRecordToDraft`

### 缺口

- `createSQLiteClient()` 仍是空实现
- `entryRepo.ts` / `draftRepo.ts` / `prefsRepo.ts` 只有查询骨架或 TODO SQL
- 没有迁移、初始化、事务错误处理

### 推荐下一步

1. 先实现 `draftRepo` upsert
2. 再实现 `entryRepo` upsert / delete
3. 最后接 `prefsRepo`

原因：

- editor 当前最依赖 draft 持久化
- mailbox / calendar 依赖 entry 真实落库
- profile 依赖 prefs，但优先级低于 mailbox/calendar

## 4.7 测试清单

### 已完成

- draft slot 规则测试
- entry service 核心字段测试
- memory entry repository 测试
- memory draft repository 测试
- entry store 测试
- draft store 测试
- legacy store alias 测试

### 未完成

- mailbox store 测试
- calendar store / resolveDate 测试
- future unlock transition 测试
- SQLite repository 测试
- profile settings persistence 测试

## 5. 推荐推进顺序

### P0

1. Mailbox backend facade
2. Calendar backend facade
3. Future unlock transition

### P1

4. SQLite draft repository
5. SQLite entry repository
6. Profile preferences persistence

### P2

7. Editor 续写已有 entry
8. 当天归档列表页的后端数据接口
9. 隐私锁 / 备份建模

## 6. 当前对前端的承诺

在不改页面的前提下，后端后续应该尽量保持以下表面稳定：

- `useDraftStore.openDraft / saveActiveDraft / removeDraft`
- `useEntryStore.fetchEntriesByDate / saveEntry / destroyEntry`
- `Entry` / `Draft` / `SettingsState` 类型字段名
- `ROUTES`
- `DRAFT_KEYS`

若后续需要重构实现，优先新增 facade 或 adapter，不要直接把前端已经开始依赖的签名打碎。
