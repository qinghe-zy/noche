# CHECKPOINT 38: Settings And Local Backup Closure

## 本轮目标

在 `e88f7ab` 的基础上，不回头重做已修好的数据库主线，只继续收口仍标记为“部分存在”的风险点，并把 Settings 做成真实可用：

- 编辑页最后一次保存
- 隐私锁
- 跨天状态刷新
- backup / restore
- 深色模式
- 语言
- 周起始日
- 隐私锁设置

## 本轮复核结果

### 1. 编辑页最后一次保存

状态：部分存在

本轮前剩余问题：

- `draft shadow` 虽已存在，但只覆盖到“离开页面后再次进入”
- `onHide / onUnload` 的 flush 仍然是 fire-and-forget
- 还存在“最后一句先进 shadow、稍后再回 repo”的小窗口

本轮处理：

- 保留并继续使用 `draft shadow`
- formal save 增加补偿式回滚
- linked draft formal save 保留旧 entry 的 `createdAt`

当前结论：

- 刚写完一句就退后台时，shadow 会先兜住
- 重新进入 editor 会优先恢复 shadow 并补写回 repository
- 仍不是单事务强一致；属于“补偿式 + shadow”方案

### 2. 隐私锁

状态：部分存在

本轮处理：

- `useAppStore` 初始状态改为同步读取本地 prefs，冷启动第一帧即可遮挡
- `ProfilePage` 里的隐私锁现在不再只是开关，还提供：
  - 开关
  - 立即锁定

当前结论：

- 冷启动前台暴露窗口已明显缩小
- 回前台仍是先锁再解锁
- 仍然只是轻遮挡，不是加密
- 最近任务缩略图的系统级隐藏这轮没有继续扩大承诺

### 3. 跨天状态刷新

状态：部分存在

本轮处理：

- `MailboxPage` 新增 `onShow` 刷新
- `CalendarPage` 新增 `onShow` 刷新
- calendar 今日高亮与 future 解锁状态在重新回到页面时会刷新

当前结论：

- 冷启动、回前台、重新进入页面时，关键日期状态会更新
- 仍未实现“页面持续停留在前台跨过午夜”的分钟级心跳刷新

### 4. backup / restore

状态：已修复（按本轮最小可用范围）

本轮新增：

- `src/features/profile/localBackup.ts`

最终格式：

- 备份包不是 zip，而是目录型本地备份包
- 默认导出路径：
  - `_documents/noche-backups/<backupId>/`

包内结构：

- `manifest.json`
- `db/noche.db`
- `storage/preferences.json`
- `storage/draft-shadow.json`
- `files/**`

导出内容覆盖：

- SQLite 数据库
- draft shadow
- settings / profile prefs
- entry / draft 引用到的受管本地附件
- profile avatar / cover 等本地资源

恢复流程：

1. 关闭当前 SQLite
2. 把备份里的 `db/noche.db` 拷回 `_doc/noche.db`
3. 按 `manifest.json` 把备份里的 `files/**` 拷回原始资源路径
4. 恢复 `preferences.json`
5. 恢复 `draft-shadow.json`
6. 完成后重启 app

因此恢复后：

- entry / draft / diaryPrelude / profile album / profile stats 都会跟着 SQLite 一起恢复
- prefs 和 shadow 也会一起恢复
- 不需要手动清缓存，重启后直接接管

## Settings 当前可用项

### 1. 深色模式

状态：已接通

实现方式：

- `App.vue` 监听 `settingsStore.theme`
- 通过 `data-theme` + CSS variables 应用到核心页面与共享弹层
- 目前已覆盖：
  - `App` 隐私锁遮挡
  - `HomePage`
  - `MailboxPage`
  - `CalendarPage`
  - `DayArchivePage`
  - `ProfilePage`
  - `ProfileAlbumPage`
  - `PaperOptionSheet`
  - `PaperConfirmDialog`
  - `PaperInputDialog`

### 2. 语言

状态：已接通核心页面

实现方式：

- 新增 `src/shared/i18n.ts`
- 当前支持：
  - `zh-CN`
  - `en-US`

已覆盖核心文案的页面/区域：

- `App` 隐私锁文案
- `HomePage`
- `MailboxPage`
- `CalendarPage`
- `ProfilePage`
- `ProfileAlbumPage`

说明：

- 当前属于“核心页面文案可切”
- 不是全仓库所有文案 100% 覆盖

### 3. 周起始日

状态：已接通

实现方式：

- `CalendarPage` 现在读取 `settingsStore.weekStartsOn`
- `getFirstDayOfWeek()` 新增 `weekStartsOn` 参数
- 周标题和月历起始偏移都会真实变化

### 4. 隐私锁设置

状态：已接通

现在 Settings 里可以真实影响：

- 开 / 关隐私锁
- 立即锁定当前页面
- 冷启动遮挡状态
- 回前台遮挡状态

### 5. 本地备份导出

状态：已接通

- 从 `ProfilePage -> 本地备份` 可触发导出
- 导出成功会反馈真实备份路径

### 6. 本地备份导入

状态：已接通

- 从 `ProfilePage -> 本地备份 -> 从本地备份恢复`
- 会列出现有本地备份
- 有确认流程
- 恢复完成后自动重启应用

## 这轮没有继续动的点

- 没有回头再改数据库主结构
- 没有重新改 future / mailbox / calendar 已修好的主语义
- 没有把隐私锁包装成加密系统
- 没有扩展成云备份 / 云同步
- 没有做分钟级全局跨天热刷新

## 核心文件

新增：

- `src/shared/i18n.ts`
- `src/shared/theme.ts`
- `src/features/profile/localBackup.ts`

重点修改：

- `src/App.vue`
- `src/shared/utils/date.ts`
- `src/features/calendar/pages/CalendarPage.vue`
- `src/features/home/pages/HomePage.vue`
- `src/features/mailbox/pages/MailboxPage.vue`
- `src/features/profile/pages/ProfilePage.vue`
- `src/features/profile/pages/ProfileAlbumPage.vue`
- `src/features/profile/profileData.ts`
- `src/shared/ui/PaperOptionSheet.vue`
- `src/shared/ui/PaperConfirmDialog.vue`
- `src/shared/ui/PaperInputDialog.vue`
- `src/app/store/useDraftStore.ts`
- `src/app/store/useEntryStore.ts`
- `src/features/editor/pages/EditorPage.vue`

## 验证

本轮已实跑：

- `pnpm test:unit`
- `pnpm type-check`
- `pnpm build:h5`

结果：

- 单测通过：`53` 个测试文件，`157` 个测试通过
- TypeScript 类型检查通过
- H5 构建通过

## 当前结论

这轮已经把“Settings 只是存在”推进到“核心能力真实可用”，并把 backup / restore 做成了最小本地可用系统。

仍保留为“部分存在”的只有两类边界：

- 编辑页最后一次保存：目前依赖 shadow + 补偿式回滚，不是底层单事务
- 跨天刷新：目前在冷启动 / onShow / 回前台时稳定，但没有前台驻留跨午夜心跳
