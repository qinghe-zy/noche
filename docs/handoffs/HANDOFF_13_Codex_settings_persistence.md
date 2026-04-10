# HANDOFF: Codex Settings Persistence

## 本轮目标

- 让 settings 不再只是纯内存态
- 保持现有前端可见 API 不炸签名
- 为后续 memory / sqlite 切换准备统一装配入口

## 已完成

- `useSettingsStore` 已支持：
  - `hydrate(): Promise<void>`
  - `setWeekStartsOn(value: 0 | 1)`
  - `isLoading`
  - `error`
- 现有同步方法仍保留：
  - `setTheme(theme)`
  - `setLocale(locale)`
- 新增 prefs repository provider：
  - `src/app/store/settingsRepository.ts`
- 新增统一 adapter 装配：
  - `src/app/providers/configurePersistenceAdapters.ts`
- 新增 memory prefs repository：
  - `src/data/repositories/memoryPrefsRepository.ts`

## 已稳定接口

```ts
interface SettingsStore {
  theme: "system" | "light" | "dark";
  locale: string;
  weekStartsOn: 0 | 1;
  isLoading: boolean;
  error: string | null;
  hydrate(): Promise<void>;
  setTheme(theme: "system" | "light" | "dark"): void;
  setLocale(locale: string): void;
  setWeekStartsOn(value: 0 | 1): void;
}
```

## 语义说明

- `hydrate()` 会从当前注入的 prefs repository 读取：
  - `theme`
  - `locale`
  - `weekStartsOn`
- `setTheme / setLocale / setWeekStartsOn`
  - 先同步更新 store state
  - 再在内部异步写 prefs repository
- 页面层不需要 `await setTheme()`，也不要自己碰 prefs repo

## 统一装配入口

```ts
configurePersistenceAdapters({
  draftRepository?,
  entryRepository?,
  prefsRepository?,
})
```

后续如果要切到 sqlite adapter，可以从这里接，而不是到各个 store 手工设 repository。

## 仍未完成

- 真实 app boot 暂未调用 `configurePersistenceAdapters()`
- 真实 SQLite client 仍未接上
- profile 页面尚未正式消费 `hydrate()` / `setWeekStartsOn()`

## 给前端 / Gemini 的结论

如果需要做 Profile 设置页，当前可以安全依赖：

- `theme`
- `locale`
- `weekStartsOn`
- `isLoading`
- `error`
- `hydrate()`
- `setTheme()`
- `setLocale()`
- `setWeekStartsOn()`

不需要直接依赖 prefs repo，也不需要知道底层当前是 memory 还是 sqlite。
