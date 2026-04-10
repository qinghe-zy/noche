# CHECKPOINT 19 - Calendar Day Archive Display Helpers

## 1. 本轮概述

本轮继续在不改大方向的前提下收口页面展示层，重点把 `CalendarPage` 和 `DayArchivePage` 里分散的日期标题、引导语、空态文案抽到 feature helper，并补上对应测试。

目标不是重做页面，而是把已经存在的页面继续变得：

- 文案口径更稳定
- 日期展示更贴近项目语境
- 页面里少放拼接规则

## 2. 本轮实际实现

### Calendar

新增：

- `src/features/calendar/calendarDisplay.ts`

收口能力：

- `formatCalendarMonthLabel()`
- `formatCalendarYearLabel()`
- `formatCalendarGuideText()`

页面接入：

- `src/features/calendar/pages/CalendarPage.vue`
  - 月份标题不再直接依赖英文月份格式
  - 增加“当前选中日期”的引导语区域
  - 未选日期时提示“查看已有记录或补写一篇日记”

### Day Archive

新增：

- `src/features/day-archive/dayArchiveDisplay.ts`

收口能力：

- `formatDayArchiveTitle()`
- `formatDayArchiveSubtitle()`
- `formatDayArchiveEmptyText()`

页面接入：

- `src/features/day-archive/pages/DayArchivePage.vue`
  - 页面标题统一为 `YYYY年MM月DD日`
  - 副标题不再由页面直接拼字符串
  - 空态文案不再写死在页面里
  - 导航栏标题不再使用英文月份缩写

## 3. 本轮新增测试

- `tests/features/calendarDisplay.test.ts`
- `tests/features/dayArchiveDisplay.test.ts`

覆盖点：

- 中文月份 / 年份展示
- Calendar 引导语
- Day Archive 标题 / 副标题 / 空态文案

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：22 个测试文件、47 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

## 5. 当前状态

已完成的页面展示 helper：

- Mailbox
- Calendar
- Day Archive（基础标题与空态）

当前页面收口方向是正确的：

- stitch 只保留结构参考
- 原型文案没有继续渗入正式页面
- 页面层开始从“自己拼所有展示规则”转向“复用 feature helper”

## 6. 下一轮自然续做点

下一轮建议继续：

1. 继续收口 Day Archive 里的 type / fallback title 展示逻辑
2. 视情况把 Mailbox / Day Archive 的类型标签统一到共享 entry display helper
3. 若浏览器环境可用，再回补 H5 可视化导航验收
