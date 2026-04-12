# CHECKPOINT 40: Release Total Acceptance And Gap Closure

## 本轮目标

把 `noche` 当成“准备打包上手机”的版本，按发版前总验收重新核一遍当前真实代码，而不是沿用旧 checkpoint 结论：

1. 重建总验收状态表
2. 只修未通过 / 部分通过 / 新发现高风险问题
3. 给出是否可进入 APK 打包与真机验收的最终判断

## 基线澄清

用户口头基线是：

- checkpoint：`CHECKPOINT_38_settings_and_local_backup_closure.md`
- commit：`6526963`

但本地仓库真实基线已经继续前进：

- 已存在 `CHECKPOINT_39_release_edge_closure.md`
- 当前分支 HEAD 为 `1339e5f`

因此这轮验收全部以“当前工作区真实代码”作为判断对象。

## 本轮重新核查的方法

### 1. 代码与架构核查

重点复核：

- `useDraftStore / useEntryStore / useCalendarStore / useMailboxStore / useSettingsStore`
- `entryReadFacade / entryService / entryQueryService`
- `storage / sqlite / localBackup / localFiles`
- `Editor / Home / Mailbox / Calendar / DayArchive / Profile / ProfileAlbum`

### 2. 运行时验证

已重启本地 H5：

- `pnpm dev:h5 --host 127.0.0.1 --port 5173`

由于 Playwright MCP 仍会向 `C:\Windows\System32\.playwright-mcp` 写会话文件并触发 `EPERM`，本轮改用：

- `msedge --headless --dump-dom --screenshot`

重新核了：

- Home
- Diary prelude
- Future editor
- Mailbox
- Calendar
- Profile

### 3. 必跑命令

已实跑：

- `pnpm test:unit`
- `pnpm type-check`
- `pnpm build:h5`

结果：

- 单测通过：`57` 个测试文件，`169` 个测试通过
- TypeScript 类型检查通过
- H5 构建通过

## 本轮新发现并已收口的问题

### 1. locale 切换后主路径仍残留硬编码文案

这是本轮最明确的新高风险问题。残留点集中在：

- `calendarDisplay`
- `mailboxView`
- `profileData`
- `DiaryPreludePicker`
- `ProfilePage`
- `EditorPage` 与 shell 注入

本轮处理：

- 扩展 `src/shared/i18n.ts`
- 新增并转绿以下红灯：
  - `tests/features/calendarDisplay.test.ts`
  - `tests/features/mailboxView.test.ts`
  - `tests/features/profileData.test.ts`
  - `tests/release/coreI18nConsistency.test.ts`
- 把 profile settings / input dialog / about / editor diary prelude / saved hint / read meta 都接回统一 i18n

当前结论：

- 主路径 `locale` 切换后的中英混杂问题继续缩小
- 当前已不是“切到英文后还到处直接冒中文常量”的状态

### 2. Profile 默认 identity 仍是中文常量

本轮前：

- 默认昵称与签名是固定中文
- 英文环境首次进入 Profile 时也会直接看到中文默认资料

本轮处理：

- `profileData` 新增 locale-aware default identity
- `useProfileIdentity` 在 refresh 时按已存 locale 回退

当前结论：

- 英文环境下默认资料不会再硬落中文常量

## 已知仍保留的边界

### 1. 隐私锁

状态：部分通过

当前真实情况：

- 冷启动 / onShow / onHide 会遮挡
- 仍是轻遮挡
- 没有把它包装成加密能力
- 最近任务缩略图的系统级隐藏仍未形成更深保护

### 2. backup / restore

状态：部分通过

当前真实情况：

- 代码路径已接通
- 目录结构 / manifest / db / prefs / draft shadow / files 已定义清楚
- 但本轮仍未在 Android 真机上重跑一次导出 / 导入
- 因此“代码层可打，真机层仍待复核”

### 3. 深色模式

状态：部分通过

当前真实情况：

- `App.vue` 的 theme 切换、核心 CSS variables、共享对话框层都已接通
- 但仍有一部分 feature 组件保留固定浅色值
- 尤其 editor / album / profile 局部表面，还需要真机暗色截图复核

### 4. 前台跨午夜

状态：部分通过

当前真实情况：

- `Home / Calendar / Mailbox / Profile` 已接入 `dateChangeWatcher`
- 冷启动、回前台、页面跨午夜会刷新
- 仍不是全局更深层的系统心跳机制

## 当前判断

### 是否可进入 APK 打包与真机验收

结论：**可以**

原因：

- 当前代码层主链没有新的构建/类型/单测阻塞
- 发版前总验收中发现的高风险 locale 漏口已做一轮收口
- 当前剩余问题更适合通过 APK + `Redmi Note 11T Pro+` 真机验收继续确认，而不是继续停在代码层空转

### 是否可直接当成“已完成正式发版”

结论：**还不建议直接下正式发版结论**

剩余更适合真机复核的项：

- backup / restore 实机链路
- 隐私锁最近任务缩略图表现
- 深色模式表面一致性
- 飞行模式主路径

## 本轮核心修改文件

- `src/shared/i18n.ts`
- `src/features/calendar/calendarDisplay.ts`
- `src/features/mailbox/mailboxView.ts`
- `src/features/profile/profileData.ts`
- `src/features/profile/composables/useProfileIdentity.ts`
- `src/features/profile/pages/ProfilePage.vue`
- `src/features/editor/components/DiaryPreludePicker.vue`
- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/JottingEditorShell.vue`
- `src/features/editor/components/FutureLetterEditorShell.vue`
- `src/features/editor/pages/EditorPage.vue`
- `src/features/calendar/pages/CalendarPage.vue`
- `src/features/calendar/calendarMailbox.ts`
- `src/features/mailbox/pages/MailboxPage.vue`
- `tests/features/calendarDisplay.test.ts`
- `tests/features/mailboxView.test.ts`
- `tests/features/profileData.test.ts`
- `tests/release/coreI18nConsistency.test.ts`
- `tests/release/profilePageLocalFirst.test.ts`

## 最终验证

本轮结束前再次实跑：

- `pnpm test:unit`：通过
- `pnpm type-check`：通过
- `pnpm build:h5`：通过

当前推荐下一步：

1. 继续走 APK 打包
2. 在 `Redmi Note 11T Pro+` 上重跑：
   - 飞行模式主路径
   - 深色模式
   - 本地备份导出 / 导入
   - future 解锁前后
   - Profile 相册
   - 前后台 / 跨午夜
