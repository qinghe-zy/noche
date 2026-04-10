# CHECKPOINT 10 - Backend Contract Docs Ready

## 1. 阶段概述

本阶段没有改动运行时代码，重点是把前端真正需要依赖的稳定接口面和后端后续的功能清单文档化，减少页面开发与底层推进之间的互相等待。

## 2. 变更详情

- **改动文件**:
  - `docs/tech/tech_frontend_backend_contract.md`
  - `docs/tech/tech_backend_feature_checklist.md`
  - `docs/tech/README.md`
  - `docs/README.md`
  - `docs/tasks/T-009.md`
  - `docs/handoffs/CHECKPOINT_10_backend_contract_docs_ready.md`
  - `task_plan.md`
  - `progress.md`
  - `findings.md`
- **核心逻辑变更**:
  - 无运行时逻辑改动
  - 新增前端/后端分离契约：定义前端允许直接依赖的 store、types、常量、feature contract
  - 新增后端功能清单：梳理 editor、mailbox、calendar、profile、SQLite 持久化的完成度与推进顺序

## 3. 验收情况

- [x] 任务卡 T-009 子任务已全部勾选
- [x] 文档已写入 tech 真相目录
- [x] docs 入口索引已更新
- [x] 构建通过 (N/A，本轮无代码变更)
- [x] 测试通过 (N/A，本轮无代码变更)

## 4. 下一步计划

- [ ] 进入 mailbox / calendar 后端能力实现
- [ ] 优先补 `useMailboxStore` 与 `useCalendarStore`
- [ ] 再推进 SQLite draft / entry repository

## 5. 备注

- 当前 editor 页仍直接调用 `createEntryFromDraft()`，这是过渡实现；契约文档已明确这不应扩散为前端普遍依赖方式。
- 当前 `useDraftStore` 与 `useEntryStore` 的错误语义不一致，已在文档中标记为后续统一项。
