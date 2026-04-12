# noche 项目文档库 (Docs)

本目录是 `noche` 项目的“唯一真相源 (Source of Truth)”。所有开发实现必须严格遵守本文档库中的定义。

## 主验收设备

- `Redmi Note 11T Pro+`
- 当前阶段的安装、启动、编辑、保存、恢复、浏览体验，默认以该机型作为主验收标准。

## 1. 目录结构

- [spec/](./spec/)：产品规格与交互规则。
  - [product_spec_v2.md](./spec/product_spec_v2.md)：主产品文档。
  - [interaction_rules.md](./spec/interaction_rules.md)：全局交互规则。
- [tech/](./tech/)：技术架构与底层设计。
  - [architecture.md](./tech/architecture.md)：系统分层与依赖关系。
  - [data_model.md](./tech/data_model.md)：核心数据模型。
  - [ai_workflow.md](./tech/ai_workflow.md)：AI 协作边界与流程。
  - [noche_codex_function_matrix_and_interaction_logic.md](./tech/noche_codex_function_matrix_and_interaction_logic.md)：Codex 执行用功能矩阵与交互主链说明。
  - [tech_frontend_backend_contract.md](./tech/tech_frontend_backend_contract.md)：前端可依赖的稳定契约面。
  - [tech_backend_feature_checklist.md](./tech/tech_backend_feature_checklist.md)：后端功能清单与推进顺序。
- [release/](./release/)：发布与版本更新文档。
  - [android_release_playbook.md](./release/android_release_playbook.md)：Android 发版执行手册。
  - [version_update_checklist.md](./release/version_update_checklist.md)：版本更新固定检查单。
  - [releases/v1.0.0.md](./release/releases/v1.0.0.md)：当前版本 release note。
- [tasks/](./tasks/)：任务拆解与进度追踪。
  - 命名格式：`T-###_topic.md`
- [handoffs/](./handoffs/)：阶段检查点与交接记录。
  - 命名格式：`CHECKPOINT_XX_topic.md`

## 2. 协作流程

1. **阅读真相**：开始任何任务前，必须阅读 `spec/` 和 `tech/` 下的真相文档。
2. **任务拆解**：由 `Antigravity` 生成 `tasks/` 下的任务卡。
3. **分工执行**：按照 `ai_workflow.md` 定义的边界进行开发。
4. **阶段交付**：完成任务后，更新 `handoffs/` 下的 checkpoint 文档。
5. **归档提交**：本地 git commit，确保每个阶段有迹可循。

## 3. 注意事项

- **禁止私自修改真相文档**：除非通过 Antigravity 明确确认。
- **改动面限制**：每轮迭代最多改动 15 个文件。
- **代码边界**：严格遵守各自 AI 角色的目录权限。
