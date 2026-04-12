# CHECKPOINT 37: Architecture Review And Logic Fixes

## 本轮目标

在 `64ba1a8` 的数据库优化之后，不再回头重做数据库主线，转而处理仍会伤用户体验和信任感的逻辑问题：

- 启动 seed
- future / calendar / mailbox 时间语义
- 编辑页最终保存可靠性
- destroy / attachment 文件清理
- 隐私锁前台时序
- jotting 草稿冲突
- 跨天后的关键页面刷新

## 逐项复核结果

### 1. 启动 seed 污染

状态：已修复

复核结果：

- `bootstrapAppRuntime()` 之前确实会默认注入两条示例 entry
- 用户删光后，下一次空库启动也会重新出现

处理：

- 移除了默认 seed
- 现在只有显式传入 `bootstrapAppRuntime({ demoEntries })` 时才允许演示数据注入

### 2. future / calendar / mailbox 时间语义

状态：已修复

本轮前的问题：

- `Mailbox` 已启 future 仍用 `recordDate` 文案表达“启封于”
- `DayArchivePage` 仍按 `recordDate` 拉取，和 calendar preview 的 `unlockDate` 语义不一致
- editor 阅读态 future 元信息也还在直接写 `unlockDate`

本轮修复后：

- calendar 打点：diary / jotting 走 `recordDate`，future 走 `unlockDate`
- calendar 点击读取：走 `getCalendarPreviewEntries()`，future 按 `unlockDate`
- day archive：改为走 `CalendarStore.fetchSelectedDateEntries()`，和 calendar 同口径
- mailbox pending：按 `unlockDate ASC`
- mailbox opened future：优先按 `unlockedAt`，退化用 `unlockDate`
- editor 阅读态 future：改为“启封于 …”

### 3. 编辑页最终保存链路

状态：部分存在

本轮前的问题：

- `onHide / onUnload` 只是 `void autosave.flush()`，不够稳
- `draft -> entry` 是顺序提交，不是完整事务
- 续写旧 entry 会丢原始 `createdAt`

本轮修复：

- `createEntryFromDraft()` 在 linked draft 场景保留原始 `createdAt`
- `useDraftStore.saveActiveDraftAsEntry()` 增加补偿式回滚
  - 新 entry 保存成功但 draft 删除失败：删除新 entry
  - 续写旧 entry 保存成功但 draft 删除失败：恢复旧 entry 快照
- `EditorPage` 新增 draft shadow
  - `onHide / onUnload` 前同步写本地 shadow
  - 下次进入时若发现 shadow 更新，会优先恢复并补写回 repository

仍未做到的部分：

- 这不是单个底层数据库事务，而是“补偿式一致性”
- 但已经避免了最危险的半状态

### 4. destroy / attachment 清理闭环

状态：已修复

本轮前的问题：

- 删除 entry / draft 时会删数据库记录
- 但不会清理 `saveFile()` 落下的本地图片文件

本轮修复：

- 新增 `src/shared/utils/localFiles.ts`
- `destroyEntry()` 会先清受管本地附件文件，再删 entry
- `removeDraft()` 同样会先清受管本地附件文件，再删 draft
- data URL / 非受管路径不会误删

说明：

- 数据库、附件记录、本地文件三层现在是一条闭环
- profile album / profile stats / calendar marker 因为后续都从 repository 重取，所以不会继续出现数据库级幽灵数据

### 5. 隐私锁

状态：部分存在

本轮前的问题：

- 隐私锁主要依赖 hydrate 后的 settings 状态
- 冷启动存在前台短暂暴露窗口

本轮修复：

- 新增 `readStoredPrivacyLockEnabled()`
- `useAppStore` 初始化时同步读取轻存储中的隐私锁状态
- 只要之前开过隐私锁，冷启动第一帧就先遮挡

仍未做的部分：

- 仍然只是轻遮挡 UI，不是加密
- 最近任务缩略图和系统级截图防护仍不在当前范围

### 6. Profile 返回与导航

状态：已修复

复核结果：

- 当前 `ProfilePage` / `ProfileAlbumPage` 都通过 `navigateBackOrFallback()`
- fallback 路径存在
- 没有错误 `switchTab`

这轮未再修改。

### 7. jotting 草稿冲突逻辑

状态：已修复

本轮前的问题：

- “另起一张”会调用 `saveActiveDraftAsEntry()`
- 等于系统替用户正式保存旧随笔

本轮修复：

- “继续上次”保持不变
- “另起一张”现在改成丢弃旧草稿并新建
- “取消”就是保留草稿并退出当前冲突处理

这比之前更符合“不能替用户收好”的要求。

### 8. 跨天状态刷新

状态：部分存在

本轮修复：

- `MailboxPage` 新增 `onShow` 刷新
- `CalendarPage` 新增 `onShow` 刷新
- 回前台或跨天后重新回到页面时，会重新拉 future 状态和日期打点

仍未完全解决：

- 如果页面持续停留在前台、完全不发生 `onShow`，仍没有做分钟级全局日期心跳
- 当前按“主入口不要错”原则，先做到回前台恢复稳定

## 额外核查结果

### A. 空白保存规则

状态：已修复

- 仅天气 / 心情不会正式生成 diary
- 正文空但有图片可以正式保存
- 不再沿用老的 `content.trim()` 单一判断

### B. profile 统计排除项

状态：已修复

现在 profile stats 会排除：

- destroyed 内容
- 未解锁 future
- 草稿内容
- 仅 prelude 的 diary 由于无法 formal save，本身不会进入统计

### C. backup / restore 可行性

状态：部分存在

- SQLite + attachments 现在已经具备导出基础条件
- attachment 现在有独立归属和稳定 `local_uri`
- 但完整导出 / 导入流程这轮没有展开实现

## 本轮新增/调整文件

重点改动：

- `src/app/providers/bootstrapAppRuntime.ts`
- `src/app/store/useAppStore.ts`
- `src/app/store/useDraftStore.ts`
- `src/app/store/useEntryStore.ts`
- `src/domain/services/entryService.ts`
- `src/features/editor/pages/EditorPage.vue`
- `src/features/day-archive/pages/DayArchivePage.vue`
- `src/features/home/pages/HomePage.vue`
- `src/features/mailbox/mailboxDisplay.ts`
- `src/features/mailbox/pages/MailboxPage.vue`
- `src/features/calendar/pages/CalendarPage.vue`

新增：

- `src/app/store/privacyLockState.ts`
- `src/features/editor/draftShadow.ts`
- `src/shared/utils/localFiles.ts`
- `tests/release/calendarDayArchiveSemanticParity.test.ts`

## 验证

已实跑：

- `pnpm test:unit`
- `pnpm type-check`
- `pnpm build:h5`

结果：

- 单测通过：`53` 个测试文件，`157` 个测试通过
- TypeScript 类型检查通过
- H5 构建通过

## 仍建议下一轮继续看的点

- 若需要更强的编辑保存保证，可继续把 draft shadow 提升为正式 crash-recovery 规则并补专项测试
- 若需要更稳的跨天体验，可考虑非常轻量的日期心跳，只在 Home / Calendar / Mailbox 这几个关键页面生效
- 若要推进本地备份，本轮的 SQLite + attachments 结构已经足够作为基础
