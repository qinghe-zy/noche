# CHECKPOINT 14 - Bootstrap Runtime Ready

## 1. 本轮概述

本轮把上一轮补好的 persistence seam 真正接进了应用启动链路。现在 app 启动时已经有统一的 runtime bootstrap 入口，可以在一个地方完成 repository adapter 装配、settings hydrate、以及 app bootStatus 切换。

这轮仍然没有接入真实 SQLite client，默认运行路径还是 memory adapters。

## 2. 本轮改动

- **新增 runtime bootstrap provider**
  - `src/app/providers/bootstrapAppRuntime.ts`
- **createApp 启动接线**
  - `src/main.ts`
  - 在 `createApp()` 中调用 `bootstrapAppRuntime(pinia)`
- **新增测试**
  - `tests/app/bootstrapAppRuntime.test.ts`

## 3. 已交付能力

### 3.1 bootstrapAppRuntime

```ts
bootstrapAppRuntime(pinia, {
  draftRepository?,
  entryRepository?,
  prefsRepository?,
})
```

默认行为：

1. 配置 persistence adapters
   - draft -> memory
   - entry -> memory
   - prefs -> memory
2. 调 `useSettingsStore(pinia).hydrate()`
3. 调 `useAppStore(pinia).markReady()`

### 3.2 createApp 启动链路

当前 `createApp()` 不再只创建 Vue app + Pinia，而是会在 app 启动阶段自动触发 runtime bootstrap。

这为后续切换到 SQLite adapter 提供了明确装配点，不需要再去各个 store 或页面零散补线。

## 4. 验证结果

- `pnpm test:unit`
  - 19 个测试文件通过
  - 34 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过

## 5. 前端 / Gemini 当前影响

- 页面层接口没有新增破坏性变更
- Profile 相关页面后续可以默认假设：
  - app 启动后 settings 会尝试 hydrate
  - `bootStatus` 最终会进入 `ready`
- 但前端仍然不需要自己关心 repository adapter 是 memory 还是 sqlite

## 6. 仍未完成

- `bootstrapAppRuntime()` 当前默认注入的是 memory repositories
- `createSQLiteClient()` 仍是占位
- 还没有“根据环境自动选择 sqlite adapter”的分支逻辑
- editor save/resume 的高层 facade 还未继续收口

## 7. 下一步建议

推荐下一轮优先级：

1. editor formal save 流程收口成单一 facade / action
2. 继续补 `resumeEntry(entryId)` 之类的编辑器后端语义接口
3. 再考虑 Day Archive 的后端数据接口
