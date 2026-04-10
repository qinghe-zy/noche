# CHECKPOINT 04 - Draft Rules Tested

## Scope

- 功能依据收紧为 `docs/tech`
- 草稿槽位键规则统一
- 最小单元测试入口落地

## Completed

- 新增 `pnpm test:unit`
- 新增 `vitest.config.mts`
- 新增 `tests/domain/draftRules.test.ts`
- 修复 `src/domain/draft/rules.ts`，统一使用 `DRAFT_KEYS`
- 修复 `src/app/store/draft.store.ts`，避免旧 store 继续复制槽位规则

## Verification

- `pnpm test:unit`
  - 1 个测试文件通过
  - 2 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过

## Pending

- 提交 T-003
- 下一轮打通 `entry/draft` 的最小 repository + store 用例闭环
