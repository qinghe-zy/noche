# Docs Audit (noche)

## Scan Scope

- Root: `D:\Project\noche\docs`
- Purpose: inventory, identify overlaps, and preserve sources before consolidation.

## Existing Formal Docs (source of truth candidates)

- `docs/tech/jianzirumian_product_spec_v2.md` (产品说明 v2, 标注为可定稿)
- `docs/tech/noche_architecture_final.md` (architecture final)
- `docs/tech/noche_data_model_final.md` (data model final)
- `docs/spec/noche_interaction_rules_final.md` (interaction rules final)
- `docs/tech/ai_workflow.md` (AI workflow)

## Existing Official Targets (to be consolidated)

- `docs/spec/product_spec_v2.md`
- `docs/spec/interaction_rules.md`
- `docs/tech/architecture.md`
- `docs/tech/data_model.md`
- `docs/tech/ai_workflow.md`

## README / Placeholder Files

- `docs/spec/README.md` (占位)
- `docs/tech/README.md` (占位)
- `docs/tasks/README.md` (占位)
- `docs/handoffs/README.md` (占位)

## Potential Duplicates / Conflicts

- 产品规格：`docs/tech/jianzirumian_product_spec_v2.md` vs `docs/spec/product_spec_v2.md`
- 交互规则：`docs/spec/noche_interaction_rules_final.md` vs `docs/spec/interaction_rules.md` vs `docs/tech/noche_interaction_rules_final.md`
- 架构：`docs/tech/noche_architecture_final.md` vs `docs/tech/architecture.md`
- 数据模型：`docs/tech/noche_data_model_final.md` vs `docs/tech/data_model.md`

## Preservation Plan

- 保留所有原始来源文件，不直接删除。
- 将“final / v2 / 最终版”优先收口到官方目标文件。
- 对摘要或重复内容，仅在不冲突时吸收，冲突条目在 handoff 中标注。
