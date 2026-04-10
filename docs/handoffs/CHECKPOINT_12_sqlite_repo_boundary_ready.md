# CHECKPOINT 12 - SQLite Repository Boundary Ready

## 1. 本轮概述

本轮继续沿着后端优先级推进，把 SQLite 相关的 repository 边界从“只有 TODO 占位”推进到了“SQL 语义、mapper、adapter、测试都已就位”的状态。

这轮没有接入真实 SQLite runtime client，也没有改动页面实现；重点是让后续切换存储后端时不需要再从零设计数据层接口。

## 2. 本轮改动

- **schema 对齐**
  - `src/data/db/schema.ts`
  - `drafts` 表补入 `unlock_date`
  - `drafts.slot_key` 改为主键，`id` 保持唯一字段
  - `entries` 表补入索引声明
- **draft persistence**
  - `src/data/repositories/draftRepo.ts`
  - `src/data/mappers/draftMapper.ts`
  - `src/data/repositories/sqliteDraftRepository.ts`
- **entry persistence**
  - `src/data/repositories/entryRepo.ts`
  - `src/data/repositories/sqliteEntryRepository.ts`
- **prefs persistence**
  - `src/data/repositories/prefsRepo.ts`
- **新增测试**
  - `tests/data/draftRepo.test.ts`
  - `tests/data/entryRepo.test.ts`
  - `tests/data/prefsRepo.test.ts`
  - `tests/data/sqliteDraftRepository.test.ts`
  - `tests/data/sqliteEntryRepository.test.ts`
  - `tests/data/fakeSQLiteClient.ts`

## 3. 已交付能力

### 3.1 Draft SQLite 边界

当前已经具备：

- `createDraftRepo(client)`
  - `findBySlotKey(slotKey)`
  - `list()`
  - `upsert(record)`
  - `deleteBySlotKey(slotKey)`
- `createSQLiteDraftRepository(client)`
  - 实现 `IDraftRepository`
  - 通过 mapper 在 domain draft 与 SQL record 间转换

重要修复：

- future draft 的 `unlockDate` 现在会进入：
  - schema
  - `DraftRecord`
  - mapper
  - SQL upsert 参数

也就是说，未来信草稿持久化不再丢 `unlockDate`。

### 3.2 Entry SQLite 边界

当前已经具备：

- `createEntryRepo(client)`
  - `listActive()`
  - `findById(entryId)`
  - `findByDate(recordDate)`
  - `findByType(type)`
  - `listCalendarMarkedDates()`
  - `upsert(record)`
  - `destroyEntry(entryId, destroyedAt, options)`
- `createSQLiteEntryRepository(client)`
  - 实现 `IEntryRepository`
  - 对接 domain `Entry`
  - `deleteById()` 内部统一转成 logical destroy

重要说明：

- `destroyEntry()` 不再是空 TODO，而是统一写 `destroyed_at`
- calendar marked dates 的 SQL 语义已经对齐当前后端规则：
  - 包含 `diary`
  - 包含 `jotting`
  - 包含 `status = unlocked` 的 `future`

### 3.3 Preferences SQLite 边界

当前已经具备：

- `createPrefsRepo(client)`
  - `get(key)`
  - `set(record)`，使用 upsert SQL

这还没有接到 `useSettingsStore`，但底层 prefs repository 已经不再是 TODO 占位。

## 4. 验证结果

- `pnpm test:unit`
  - 15 个测试文件通过
  - 30 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过

## 5. 仍未完成

- `createSQLiteClient()` 仍是空实现，真实平台数据库尚未接入
- stores 默认仍走 memory repository
- `useSettingsStore` 还未接 prefs persistence facade
- 尚未提供“根据环境切换 memory / sqlite repository”的统一 provider
- editor save / resume 的更高层 facade 仍待继续收口

## 6. 下一步建议

推荐下一轮优先级：

1. 给 draft / entry / prefs 增加 repository provider 装配点
2. 让 store 可以在 boot 阶段选择 memory 或 sqlite adapter
3. 补 `useSettingsStore` 的 hydrate / persist
4. 再推进 editor 的单一 save facade 与 resumeEntry
