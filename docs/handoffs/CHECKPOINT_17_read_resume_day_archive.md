# CHECKPOINT 17 - Read Resume Day Archive

## 1. 本轮概述

本轮按功能矩阵继续补主链，没有重新发散需求，直接把下面这条路径接通到可验证状态：

`Mailbox / Calendar -> Editor read mode -> continue write -> save back -> Day Archive 中转`

同时顺手清掉了当前主链页面里最明显的原型腔文案，确保 `docs/stitch/**` 只作为结构参考，而不是内容来源。

## 2. 本轮实际实现

### Editor

- `EditorPage` 已支持 `mode=read&entryId=...`
- 进入阅读态时会按 `entryId` 读取正式内容并渲染只读页
- 阅读态新增 `Continue Write`
- `diary / jotting` 可从阅读态回到编辑态
- `future` 不暴露续写入口，仍保持不可续写
- 额外接入 `recordDate` 路由参数，供 Calendar 对历史空白日期补写 diary

### Calendar

- `CalendarPage` 已修正为按 `CalendarResolveResult.kind` 分支
- `kind = entry`：进入 `EditorPage?mode=read&entryId=...`
- `kind = entry-list`：进入 Day Archive
- `kind = new-diary`：进入 `EditorPage?type=diary&recordDate=...`

### Day Archive

- 新增最小可用页面：
  - `src/features/day-archive/pages/DayArchivePage.vue`
- 当前职责只有：
  - 展示某天可阅读条目
  - 点击后进入阅读态
  - 为空时允许补写这一天 diary

### Domain / Rule

- 在 `entryQueryService` 新增 `listDayArchiveEntries()`
- Day Archive 与 Calendar 共享“只展示 calendar-visible entry”的规则
- 未解锁 future 不会混入当天归档列表

### Mailbox

- `Mailbox -> read mode` 路径已可直达 Editor 阅读态
- 本轮顺手把页面文案收回到项目语境，去掉明显的原型文案表达

## 3. 本轮新增 / 更新测试

- `tests/app/draftStore.test.ts`
  - 新增：续写后的 formal save 仍沿用原 entry id
- `tests/domain/entryQueryService.test.ts`
  - 新增：Day Archive 只展示 calendar-visible entries，且排序稳定

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：19 个测试文件、40 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

## 5. 当前主链状态

已完成：

- 写入
- 保存
- 阅读
- Mailbox 查看
- Calendar 跳转
- Day Archive 中转
- 阅读态续写恢复

仍建议下一轮继续收口：

1. Mailbox / Calendar / Day Archive 参考 `docs/stitch/**` 继续做版式与状态体验收口
2. Editor 阅读态与编辑态的按钮层级、反馈文案、空白销毁提示继续产品化
3. 视情况补页面级验证（H5 导航链手测或浏览器自动化）

## 6. 下一轮自然续做点

下一轮优先继续：

1. 收口 `MailboxPage`
   - loading / empty / error 的版式层级
   - 卡片信息密度
   - sealed future 的锁定态表现
2. 收口 `CalendarPage`
   - 月视图层级
   - 回到今天入口表现
   - 选中态与 marker 关系
3. 收口 `DayArchivePage`
   - 归档列表的信息层级
   - 空状态与补写入口
4. 若页面态稳定，再补一轮 H5 可视化验证
