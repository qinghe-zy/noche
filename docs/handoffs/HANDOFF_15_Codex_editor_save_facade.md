# HANDOFF: Codex Editor Save Facade

## 本轮目标

- 把 editor formal save 的直接拼装流程收口到 store 语义 action
- 给后续 resume / continue-write 链路打基础

## 已完成

- `useDraftStore` 新增：
  - `saveActiveDraftAsEntry(): Promise<Entry | null>`
  - `restoreEntryAsActiveDraft(entry: Entry): Promise<Draft>`
- `EditorPage.vue` 的 formal save 已改为调用：
  - `draftStore.saveActiveDraftAsEntry()`

## 已稳定语义

### saveActiveDraftAsEntry

适用场景：

- 当前 editor 页面在编辑态点击正式保存

行为：

1. 读取 `activeDraft`
2. 生成正式 entry
3. 保存 entry
4. 删除 draft
5. 返回 entry

### restoreEntryAsActiveDraft

适用场景：

- 后续“续写已有 entry”
- 从 read mode 切回 edit mode

行为：

- 将正式 entry 内容回填成当前活动 draft
- 自动写入 `linkedEntryId`
- future 会保留 `unlockDate`

## 前端结论

当前 editor 页已经不需要再自己拼 formal save 三步流。

后续如果要做 continue-write，优先依赖：

- `restoreEntryAsActiveDraft(entry)`

而不是在页面里手工 new draft / patch content / 写 linkedEntryId。

## 仍未完成

- 还没有一个直接接受 `entryId` 的 `resumeEntry()` facade
- 还没有 mailbox / calendar -> continue-write 的正式入口接线
