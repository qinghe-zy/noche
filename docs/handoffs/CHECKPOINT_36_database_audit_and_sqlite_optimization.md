# CHECKPOINT 36: Database Audit And SQLite Optimization

## 本轮目标

围绕本地数据库做一轮真实审计与最小必要优化，重点保证：

- Android-only
- local-first
- 核心内容走 SQLite
- 设置继续走本地轻存储
- diary / jotting / future / draft / attachment / diaryPrelude / profile stats 主链不回退

## 审计结论

### 1. 之前的真实状态

在本轮之前，仓库里的 SQLite 还停留在“边界已写、运行时未接”的状态：

- `src/data/db/schema.ts` 只有 `entries / drafts / preferences`
- `createSQLiteClient()` 只是空实现
- migration 没有执行入口
- 真正 runtime 默认仍走：
  - `createStorageEntryRepository(storage)`
  - `createStorageDraftRepository(storage)`
  - `createStoragePrefsRepository(storage)`

也就是说，代码里虽然已经有 SQLite repo 和 SQL，但 Android 主链并没有真正用到它。

### 2. 发现的高风险点

- `Mailbox / Calendar / Profile Album / future status refresh` 大量依赖 `getAllActive()` 后再在 JS 里二次过滤、排序、聚合。
- `CalendarStore` 原来只按 `recordDate` 查当天内容，future 没有真正按 `unlockDate` 参与当天查询。
- 待启 future 原来在信箱里按 `recordDate DESC` 排，不符合 `unlockDate` 语义。
- attachment 没有独立表，本地图片路径仅存在 `attachments_json`。
- `Profile` 统计每次实时聚合；相册每次全量扁平化。
- draft autosave 在内容没变化时也会继续写。
- migration 之前没有版本控制，也没有旧 storage -> SQLite 的迁移入口。

## 本轮落地

### A. 表结构

保留原有：

- `entries`
- `drafts`
- `preferences`

新增：

- `attachments`
  - 独立存图片附件
  - `entry_id` / `draft_slot_key` 二选一归属
  - 本地路径落在 `local_uri`
- `profile_stats_cache`
  - 缓存 `recorded_days / total_words / diary_count`
- `record_date_counters`
  - 为后续 recorded day 统计与排障留结构

### B. 索引

新增或确认存在：

- `idx_entries_record_date`
- `idx_entries_type`
- `idx_entries_status`
- `idx_entries_unlock_date`
- `idx_entries_active_timeline`
- `idx_entries_type_status_unlock`
- `idx_entries_calendar_preview`
- `idx_entries_future_preview`
- `idx_attachments_entry_owner`
- `idx_attachments_draft_owner`

### C. 查询路径优化

- `CalendarStore.fetchMarkedDates()`
  - 不再拉全量 entries 再计算
  - 改走 repository 的 `getCalendarMarkedDates()`
- `CalendarStore.resolveDate()` / `fetchSelectedDateEntries()`
  - 改走 `getCalendarPreviewEntries()`
  - future 现在真正按 `unlockDate` 进入当天解析
- `MailboxStore.refreshMailbox()`
  - 先只刷新“到期可解锁 future”
  - 再走 repository 的 `getMailboxCollections()`
- `ProfileAlbum`
  - 不再先拉全量 entries 再扁平化
  - 改走 `getProfileAlbumItems()`
- `ProfileStats`
  - SQLite 侧改读 `profile_stats_cache`
  - 不再每次页面进入都实时全表聚合
- `future status refresh`
  - 不再全表扫所有 entry
  - 改走 `getUnlockableFutureEntries()`

### D. 附件路径

- SQLite 新增 `attachments` 表，明确区分：
  - 正式内容归属：`entry_id`
  - 草稿归属：`draft_slot_key`
- 本地图片路径继续保持简单，直接存 `local_uri`
- 删除 entry / draft 时，数据库层会同步删掉对应 attachment 记录
- Profile album 的 SQLite 查询只会联表取：
  - `diary`
  - `jotting`
  - `future(status = unlocked)`

因此未解锁 future 的图片不会混进相册。

### E. migration

新增：

- `src/data/db/migrations.ts`

当前版本：

- `v1`：基础表结构
- `v2`：附件表、统计缓存表、日期计数表、性能索引
- `v3`：从旧 `attachments_json` 回填到 `attachments`，并重建统计缓存

同时在 app-plus runtime 中加入：

1. 打开 SQLite
2. 执行 migration
3. 若 SQLite 为空，则从旧 storage 导入 `entries / drafts`
4. 设置仍走轻存储，不迁进 SQLite

## 业务规则保持情况

本轮没有改坏以下规则：

- `recordDate` 仍在打开纸张时锁定
- `diary` 仍按天唯一语义使用
- `jotting` 一天可多条
- future 未解锁时仍不会混进往日信件和相册
- 草稿分槽规则不变
- autosave 仍只保存 draft
- 小信封仍是正式保存
- `diaryPrelude` 仍只作用于 diary
- 跳过 `diaryPrelude` 后不重弹
- 全程不接服务器

## 验证

本轮已实跑：

- `pnpm test:unit`
- `pnpm type-check`
- `pnpm build:h5`

结果：

- 单测通过：`52` 个测试文件，`151` 个测试通过
- TypeScript 类型检查通过
- H5 构建通过

## 剩余说明

- H5 仍会走 storage fallback；这是为了不破坏现有 H5 验证链。
- Android app-plus runtime 会优先尝试 SQLite。
- `preferences` 表仍保留在 schema 中，但当前设置真实落点仍是轻存储，这和“设置走本地轻存储”的要求保持一致。
