# HANDOFF: Codex Bootstrap Runtime

## 本轮目标

- 把 persistence seam 真正接进应用启动链路
- 不改页面层签名
- 保持默认运行仍然可用

## 已完成

- 新增：
  - `src/app/providers/bootstrapAppRuntime.ts`
- 更新：
  - `src/main.ts`
    - `createApp()` 内会自动触发 `bootstrapAppRuntime(pinia)`

## 当前启动行为

启动时会执行：

1. `configurePersistenceAdapters(...)`
2. `useSettingsStore(pinia).hydrate()`
3. `useAppStore(pinia).markReady()`

默认注入：

- `createMemoryDraftRepository()`
- `createMemoryEntryRepository()`
- `createMemoryPrefsRepository()`

## 已稳定接口

```ts
bootstrapAppRuntime(pinia, {
  draftRepository?,
  entryRepository?,
  prefsRepository?,
}): Promise<void>
```

这给后续切 sqlite 提供了统一入口。

## 仍未完成

- 当前 runtime 还不会自动判断并切换 sqlite adapter
- 真实 sqlite client 未接入
- 这轮没有继续推进 editor 页面 save/resume facade

## 给前端 / Gemini 的结论

这轮没有新增页面必须直接调用的新接口，但 app boot 语义已经更稳定：

- `useAppStore().bootStatus` 会在 bootstrap 后变成 `ready`
- settings 会在启动时 hydrate

前端仍然只需要消费 store，不要直接碰 provider / repo。
