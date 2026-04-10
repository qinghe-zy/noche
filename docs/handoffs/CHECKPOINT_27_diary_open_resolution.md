# CHECKPOINT 27 - Diary Open Resolution

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮概述

本轮继续补主链里一个很关键但此前仍未严格实现的点：

**从 Home 打开“今日信纸”时，系统应该先恢复今日草稿；没有草稿时再打开今天已保存的日记；两者都没有时才新建。**

此前这条逻辑没有独立成规则层，而是会直接进入 editor draft 流。现在这条链已经按功能矩阵要求补齐。

## 2. 本轮实际实现

### Domain

新增：

- `src/domain/services/editorService.ts`

新增能力：

- `resolveDiaryEntryOpenTarget()`

当前规则固定为：

1. 有 diary draft -> 恢复 draft
2. 无 draft 但有已保存 diary -> 进入 read mode
3. 两者都没有 -> 新建 draft

### Editor

更新：

- `src/features/editor/pages/EditorPage.vue`

当前 diary 模式初始化已改为：

- 先 `peekDraft()`
- 再 `fetchEntriesByDate()`
- 最后用 `resolveDiaryEntryOpenTarget()` 决定：
  - 打开 draft
  - 打开 entry read mode
  - 或创建新 draft

## 3. 本轮新增测试

新增：

- `tests/domain/editorService.test.ts`

覆盖点：

- draft 优先
- saved diary 次之
- 无内容时新建

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：26 个测试文件、64 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 5. 当前结论

主链中“打开今日信纸”的关键解析优先级现在已经符合功能矩阵：

- 草稿优先
- 正式内容次之
- 最后新建

这意味着 `Home -> 今日信纸 -> 恢复/阅读/新建` 终于不再停留在近似行为，而是进入正式规则实现。

## 6. 下一轮自然续做点

下一轮建议直接做一次“功能矩阵对照验收”，确认：

1. 还有哪些能力是真缺口
2. 是否已经满足“功能验收完毕，再转 APK 打包”
