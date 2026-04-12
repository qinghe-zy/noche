# CHECKPOINT 39: Release Edge Closure

## 本轮目标

在 `6526963` 的基础上，不回头重做已经接通的 `Settings / backup / sqlite` 主线，只做发版前最后一轮边界收口：

1. 编辑页最后一次保存
2. 跨天刷新
3. 核心主路径语言覆盖
4. 发版前检查清单

## 1. 编辑页最后一次保存

### 本轮压掉的风险

本轮前的真实风险是：

- `onHide / onUnload` 写 shadow 后，如果此时已有一轮 autosave 正在跑，`flush()` 只会等旧保存结束
- 旧保存结束后不会再补跑一次最新内容
- 结果就是“最后一句可能只进 shadow，还没及时回 repo”

本轮修复：

- `useEditorAutosave()` 新增“补跑一次”的语义
- 如果保存进行中再次触发 `flush()` 或新一轮保存，当前保存结束后会再跑一轮最新 `onSave`

当前效果：

- 最后一两句只进 shadow、不进 repo 的风险又压低了一层
- shadow 仍然只是兜底，不是主数据源
- formal save 后 shadow 仍会在 `persistDraftNow()` / `removeDraft()` 路径里清掉，不会残留旧 shadow

### 当前仍保留的边界

- 这仍不是数据库级单事务
- 如果系统直接强杀在写 shadow 之前，仍不能承诺 100% 零丢失
- 但当前已形成：
  - repo 正常保存
  - shadow 兜底
  - 补偿回滚
  三层收口

## 2. 跨天刷新

### 最终方案

新增：

- `src/shared/utils/dateChange.ts`

这是一个低成本的“下一次午夜单次定时器”：

- 不做分钟级心跳
- 不高频轮询
- 只在跨过午夜时触发一次回调
- 触发后重新预约下一次午夜

### 已接入页面

- `HomePage`
- `CalendarPage`
- `MailboxPage`
- `ProfilePage`

### 实际效果

- `Home`
  - `todayDateKey` 会在跨天时更新
  - diary 主入口会显式带上新的 `recordDate`
- `Calendar`
  - 今天高亮会跟着 `todayDateKey` 刷新
  - marker 与当天面板会重拉
- `Mailbox`
  - future 解锁状态会重拉
- `Profile`
  - 与日期相关的 stats / album 会重拉一轮

### 当前做到的程度

- 冷启动、回前台、页面跨午夜都能更新
- 没有做前台常驻高频刷新

## 3. 语言覆盖

### 这轮补齐的页面和区域

- `Settings` 弹层内部所有主题 / 周起始日 / 语言文案
- `DayArchivePage`
- `EditorPage`
- `JottingEditorShell`
- `FutureLetterEditorShell`
- `ProfileStatsRow`
- `ProfileMemoryAlbum`
- `ProfileAlbumViewer`
- `MailboxPage` 的空态、锁定提示、类型标签
- `CalendarMailbox` 的关键 action label / future 空态
- `backup / restore` 导出、导入、确认、不可用反馈
- `App` 隐私锁覆盖层

### 命名统一

本轮同时把主路径里的“未来信”统一为：

- 中文：`致未来`
- 英文：`To Future`

覆盖到：

- Home 次入口
- type label
- fallback title
- mailbox sealed title
- profile album viewer type
- editor fallback read title
- image-only future fallback title

### 当前结论

- 核心主路径已不再中英混杂
- 仍不能声称全仓库 100% 覆盖，但发版主路径已统一

## 4. 发版前检查清单

### 已确认通过

- demo / seed：默认关闭，仅显式 `demoEntries` 才会注入
- 运行时远程资源强依赖：
  - 未发现 `Google Fonts`
  - 未发现 `Tailwind CDN`
  - 未发现远程图片 URL 作为主路径运行时依赖
- 本地链路：
  - SQLite：`_doc/noche.db`
  - 备份目录：`_documents/noche-backups/<backupId>/`
  - 附件恢复路径与 manifest 映射已明确
- H5 / type / unit 三条验证均通过

### 仍然存在的发版阻塞项

- `manifest.json` 里还没有明确的 Android 正式包名配置
- 应用正式图标配置仍未完全写入 manifest
- Android 飞行模式真机验收这轮没有重跑，只能根据当前 local-first 架构判断主路径应可离线工作

### 风险判断

- 从代码与构建结果看，第一次安装不需要服务器即可启动主路径
- 但正式 APK 发版前，仍建议补一次：
  - 真机首次安装
  - 真机飞行模式
  - 真机本地备份导出 / 导入

## 变更文件

新增：

- `src/shared/utils/dateChange.ts`
- `tests/shared/dateChange.test.ts`

重点修改：

- `src/features/editor/composables/useEditorAutosave.ts`
- `src/features/editor/pages/EditorPage.vue`
- `src/features/calendar/pages/CalendarPage.vue`
- `src/features/calendar/calendarMailbox.ts`
- `src/features/day-archive/dayArchiveDisplay.ts`
- `src/features/day-archive/pages/DayArchivePage.vue`
- `src/features/home/pages/HomePage.vue`
- `src/features/mailbox/mailboxDisplay.ts`
- `src/features/mailbox/pages/MailboxPage.vue`
- `src/features/profile/components/ProfileStatsRow.vue`
- `src/features/profile/components/ProfileMemoryAlbum.vue`
- `src/features/profile/components/ProfileAlbumViewer.vue`
- `src/features/profile/profileData.ts`
- `src/domain/services/entryService.ts`
- `src/features/entries/entryDisplay.ts`
- `src/shared/i18n.ts`

## 验证

已实跑：

- `pnpm test:unit`
- `pnpm type-check`
- `pnpm build:h5`

结果：

- 单测通过：`55` 个测试文件，`163` 个测试通过
- TypeScript 类型检查通过
- H5 构建通过
