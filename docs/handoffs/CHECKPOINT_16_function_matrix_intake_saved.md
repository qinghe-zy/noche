# CHECKPOINT 16 - Function Matrix Intake Saved

## 1. 本轮概述

本轮先按用户要求“保存进度”，没有冒进继续改页面，而是先把外部执行文档正式落进项目，并记录当前已经开始的主链路修复切口。

新增的功能矩阵文档明确了：

- 主链必须优先回到 `写入 -> 保存 -> 阅读 -> 信箱查看 -> 日历跳转 -> 续写恢复`
- 前端页面必须参考 `docs/stitch/**`
- future 封存后不可继续编辑
- Calendar 多条内容必须进入 Day Archive，而不是停在 toast
- 每轮默认采用“实现 -> 验证 -> checkpoint -> commit -> 自动进入下一轮”的循环

## 2. 本轮已保存内容

- 新增真相文档：
  - `docs/tech/noche_codex_function_matrix_and_interaction_logic.md`
- 更新真相入口：
  - `docs/README.md`
  - `docs/tech/README.md`
- 更新规划记录：
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
- 已开始主链修复：
  - `tests/app/draftStore.test.ts`
  - `src/app/store/useDraftStore.ts`

## 3. 当前技术状态

### 已完成保存的代码切口

- 为 `useDraftStore` 增加 `resumeEntry(entryId)` 语义动作
- 新增测试约束：
  - 已保存 diary 可恢复为对应 draft
  - future 不可恢复为可编辑 draft

### 仍未完成的主链缺口

- `EditorPage` 还未真正接住 `mode=read&entryId=...`
- `CalendarPage` 当前工作区实现仍在消费过时的 `result.type`，而 store 返回 `result.kind`
- Day Archive 页面与路由仍未落地

## 4. 当前验证结果

- `pnpm.cmd run type-check`
  - 失败
  - 失败点：`src/features/calendar/pages/CalendarPage.vue`
  - 原因：页面仍在按旧契约读取 `CalendarResolveResult`
- `pnpm.cmd run test:unit`
  - 未跑通
  - 原因：sandbox 下 `spawn EPERM`
- `pnpm.cmd run build:h5`
  - 未跑通
  - 原因：sandbox 下 `spawn EPERM`

## 5. 下一轮首要动作

1. 补通 `EditorPage` 的 read / continue-write 路径
2. 修正 `CalendarPage` 的 `kind` 分支与日历跳转
3. 落地 Day Archive 最小页面与路由
4. 申请提权重新跑 `test:unit` / `build:h5`
