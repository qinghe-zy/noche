# CHECKPOINT 15 - Editor Save Facade Collected

## 1. 本轮概述

本轮继续把 editor 页面里直接拼装的 formal save / resume 流程往后端边界收口。目标不是重做 editor，而是先把最容易复制出错的那段流程抽成 store 语义 action，并把正式页面接线切过去。

## 2. 本轮改动

- **draft store**
  - `src/app/store/useDraftStore.ts`
  - 新增：
    - `saveActiveDraftAsEntry(): Promise<Entry | null>`
    - `restoreEntryAsActiveDraft(entry: Entry): Promise<Draft>`
- **editor page 最小接线**
  - `src/features/editor/pages/EditorPage.vue`
  - `handleFormalSave()` 改为调用 `draftStore.saveActiveDraftAsEntry()`
- **测试**
  - `tests/app/draftStore.test.ts`
  - 新增 formalize / restore 两条验证

## 3. 已交付能力

### 3.1 saveActiveDraftAsEntry

当前语义：

1. 读取 `activeDraft`
2. 通过 `createEntryFromDraft()` 生成正式 entry
3. 保存 entry
4. 删除对应 draft
5. 返回 entry

这样 editor 页面不再自己拼：

- `createEntryFromDraft(draft)`
- `entryStore.saveEntry(entry)`
- `draftStore.removeDraft(slotKey)`

### 3.2 restoreEntryAsActiveDraft

当前语义：

1. 接收一个正式 `Entry`
2. 按 entry 类型生成对应 draft 槽位
3. 把 title / content / linkedEntryId / unlockDate 回填到 draft
4. 持久化 draft 并设为当前活动 draft

这为后续 “续写已有 entry” 提供了后端基础能力。

## 4. 验证结果

- `pnpm test:unit`
  - 19 个测试文件通过
  - 36 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过

## 5. 当前前端可依赖什么

前端现在可以在不手写 formal save 流程的前提下依赖：

- `draftStore.saveActiveDraftAsEntry()`
- `draftStore.restoreEntryAsActiveDraft(entry)`

其中：

- `saveActiveDraftAsEntry()` 已经被当前 editor 页接入
- `restoreEntryAsActiveDraft(entry)` 目前还没有正式页面入口消费，但后端语义已稳定

## 6. 仍未完成

- “从 mailbox / calendar 打开指定 entry -> read mode -> continue write” 的完整导航链还没接
- `restoreEntryAsActiveDraft()` 还没有正式路由 / 页面入口消费
- Day Archive 数据接口仍未单独抽出

## 7. 下一步建议

推荐后续优先级：

1. 设计并接入 `resumeEntry(entryId)` 或等价 facade
2. 再把 mailbox / calendar -> editor read / continue-write 的链路接上
3. 之后再补 Day Archive 后端接口
