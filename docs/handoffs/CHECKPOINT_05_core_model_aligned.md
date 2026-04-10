# CHECKPOINT 05 - Core Model Aligned

## Scope

- Entry / Draft 核心模型按 `docs/tech` 最终口径收敛
- canonical `docs/tech/data_model.md` 已同步关键字段
- 单元测试覆盖草稿槽位与 entry service 创建规则

## Completed

- `EntryType`：`diary | jotting | future`
- `EntryStatus`：`saved | sealed | unlocked`
- 未来信字段统一为 `unlockDate`
- 数据库列名统一为 `unlock_date`
- `entryMapper` 与 `EntryRecord` 对齐新字段
- `draftRules` 识别 `future` 槽位
- 新增 `tests/domain/entryService.test.ts`

## Verification

- `pnpm test:unit`
  - 2 个测试文件通过
  - 5 个测试通过
- `pnpm type-check`
  - 通过
- `pnpm build:h5`
  - 通过

## Pending

- 下一轮打通 entry/draft 的最小 repository + store 用例闭环
- 单独清理或归档未跟踪的 `docs/tech/*_final.md`
