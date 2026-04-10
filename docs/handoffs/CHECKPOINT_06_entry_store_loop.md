# CHECKPOINT 06 - Entry Store Loop

## Scope

- Entry repository 最小可执行闭环
- Entry Pinia store 接入 repository
- Legacy store 文件降级为 alias，避免重复 Pinia id

## Completed

- 新增 `src/data/repositories/memoryEntryRepository.ts`
- 更新 `src/app/store/useEntryStore.ts`
- `src/app/store/entry.store.ts` 改为 alias
- `src/app/store/draft.store.ts` 改为 alias，并保留 `getDraftSlotKey`
- 新增 `tests/data/memoryEntryRepository.test.ts`
- 新增 `tests/app/entryStore.test.ts`
- 新增 `tests/app/storeAliases.test.ts`

## Verification

- `pnpm test:unit`
  - 5 个测试文件通过
  - 8 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过
- `rg "defineStore" src/app/store`
  - 只在 `useAppStore.ts`、`useSettingsStore.ts`、`useEntryStore.ts`、`useDraftStore.ts` 直接定义 store

## Pending

- 为 Gemini 准备轻量 UI handoff 与接口说明
- 后续将内存 repository 替换或包裹为 SQLite repository
- 单独清理或归档未跟踪的 `docs/tech/*_final.md`
