# noche 数据模型说明

## 1. 目标

本文档定义 `noche` 当前阶段的核心概念模型，为后续 TypeScript 类型、Pinia 状态与 SQLite schema 提供统一依据。

## 2. 核心实体

### 2.1 Entry

正式保存内容。

建议核心字段：

- `id`
- `type` (EntryType)
- `title`
- `content`
- `recordDate` (YYYY-MM-DD，打开纸张时锁定)
- `createdAt`
- `updatedAt`
- `futureUnlockDate` (未来信解锁日)
- `futureStatus` (FutureLetterStatus)
- `destroyedAt`

### 2.2 Draft

编辑中的临时内容。

建议核心字段：

- `id`
- `type` (EntryType)
- `title`
- `content`
- `recordDate` (日记草稿按日期分槽)
- `slotKey` (草稿槽位键，按类型隔离)
- `linkedEntryId`
- `createdAt`
- `updatedAt`
- `lastBackgroundSavedAt`

### 2.3 Settings / Prefs

本地偏好配置。

建议字段：

- `theme`
- `locale`
- `weekStartsOn`
- `lastOpenedRoute`

## 3. 核心枚举

- `EntryType`: `diary` / `jotting` / `future-letter`
- `FutureLetterStatus`: `locked` / `unlockable` / `opened`

## 4. 关键规则映射

- `recordDate` 在打开纸张时锁定
- 空白内容不能正式保存
- 未来信最早只能选明天
- 草稿按类型隔离
- 日记草稿按日期分槽
- 信箱按 `recordDate` 排序，不按 `updatedAt`
- 删除统一走 `destroyEntry`
- 日历补写只能补日记

## 5. 数据层落地建议

未来 SQLite 至少预留以下表：

- `entries`
- `drafts`
- `preferences`

后续如果引入附件、索引、搜索，可再扩展：

- `entry_resources`
- `entry_search_index`

## 6. 当前状态

当前工程只提供：

- 领域类型
- mapper 骨架
- repository 接口
- SQLite 连接占位接口

尚未完成真实 SQL 执行与迁移。
