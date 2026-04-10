# CHECKPOINT 20 - Shared Entry Display Helper

## 1. 本轮概述

本轮继续沿着页面展示层收口，没有扩大功能范围，重点解决的是：

- `Mailbox`
- `Day Archive`

这两个页面原本各自维护一套 entry 类型标签和空标题 fallback 逻辑，后续很容易继续漂移。

因此这一轮把这部分收口到了共享 helper。

## 2. 本轮实际实现

### 新增共享 helper

- `src/features/entries/entryDisplay.ts`

当前提供：

- `formatEntryTypeLabel()`
- `fallbackEntryTitle()`

### 页面接入

- `src/features/mailbox/mailboxDisplay.ts`
  - 类型标签改为复用共享 `formatEntryTypeLabel()`

- `src/features/day-archive/pages/DayArchivePage.vue`
  - 类型标签改为复用共享 `formatEntryTypeLabel()`
  - 空标题 fallback 改为复用共享 `fallbackEntryTitle()`

## 3. 本轮新增测试

- `tests/features/entryDisplay.test.ts`

覆盖点：

- diary / jotting / future 的类型标签
- fallback title 的项目语境文案

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：23 个测试文件、49 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

## 5. 当前状态

当前已经完成的展示 helper 收口：

- Mailbox
- Calendar
- Day Archive
- Shared Entry Display

这意味着页面里的展示逻辑开始出现明确边界：

- 页面负责组合与跳转
- helper 负责稳定展示口径

## 6. 下一轮自然续做点

下一轮建议继续：

1. 继续收口 Day Archive / Mailbox 的日期展示格式
2. 若环境恢复，优先回补 H5 Playwright 导航回归
3. 若环境仍阻塞，继续纯代码收口页面状态层级
