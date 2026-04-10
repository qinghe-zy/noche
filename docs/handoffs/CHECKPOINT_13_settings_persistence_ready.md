# CHECKPOINT 13 - Settings Persistence Ready

## 1. 本轮概述

本轮继续后端推进，目标是把 settings 从“只有内存 state”推进到“可注入 prefs repository、可 hydrate、可持久化”的状态，同时补一个统一的 persistence adapter 装配入口，方便后续在 memory / sqlite 之间切换。

本轮没有改页面实现，也没有接入真实 SQLite runtime client。

## 2. 本轮改动

- **settings store**
  - `src/app/store/useSettingsStore.ts`
  - 新增：
    - `isLoading`
    - `error`
    - `hydrate(): Promise<void>`
    - `setWeekStartsOn(value: 0 | 1)`
  - 现有同步接口仍保留：
    - `setTheme(theme)`
    - `setLocale(locale)`
  - 同步 setter 现在会在内部异步持久化到 prefs repository
- **prefs repository provider**
  - `src/app/store/settingsRepository.ts`
- **统一 adapter 装配入口**
  - `src/app/providers/configurePersistenceAdapters.ts`
- **memory prefs repository**
  - `src/data/repositories/memoryPrefsRepository.ts`
- **新增测试**
  - `tests/data/memoryPrefsRepository.test.ts`
  - `tests/app/settingsStore.test.ts`
  - `tests/app/persistenceProvider.test.ts`

## 3. 已交付契约

### 3.1 useSettingsStore

当前 `useSettingsStore` 现在可稳定提供：

- 状态
  - `theme`
  - `locale`
  - `weekStartsOn`
  - `isLoading`
  - `error`
- 动作
  - `hydrate(): Promise<void>`
  - `setTheme(theme: "system" | "light" | "dark"): void`
  - `setLocale(locale: string): void`
  - `setWeekStartsOn(value: 0 | 1): void`

兼容性说明：

- 原有 `setTheme / setLocale` 仍然是同步调用面，没有改成 `Promise`
- 页面如果之前直接调用这两个方法，不需要改写
- 新增的持久化逻辑在 store 内部异步完成

### 3.2 Persistence adapter seam

现在已经有统一装配入口：

```ts
configurePersistenceAdapters({
  draftRepository?,
  entryRepository?,
  prefsRepository?,
})
```

这意味着后续如果要在 boot 阶段切 memory / sqlite repository，不必分别到各个 store 文件里散落调用 setter。

## 4. 验证结果

- `pnpm test:unit`
  - 18 个测试文件通过
  - 33 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过

## 5. 前端现在可以依赖什么

前端当前可以开始依赖：

- `useSettingsStore().hydrate()`
- `useSettingsStore().setWeekStartsOn()`
- `useSettingsStore().isLoading`
- `useSettingsStore().error`

并继续保留原有：

- `useSettingsStore().setTheme()`
- `useSettingsStore().setLocale()`

如果页面只关心设置表面行为，不需要知道 prefs repository 是 memory 还是 sqlite。

## 6. 仍未完成

- `createSQLiteClient()` 仍是空实现
- `configurePersistenceAdapters()` 还没有自动在 app boot 阶段调用
- `useSettingsStore` 当前只接了 prefs repository，尚未和 profile 页面正式接线
- 真实 platform storage / sqlite 切换策略仍待下一轮落地

## 7. 下一步建议

推荐下一轮优先级：

1. 在 app boot 或 provider 装配层真正调用 `configurePersistenceAdapters()`
2. 决定默认运行时是 memory 还是 sqlite adapter
3. 让 settings 在启动时自动 hydrate
4. 再继续 editor 的 save/resume facade 收口
