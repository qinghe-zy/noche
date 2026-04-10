# Task Plan

## Goal
- 在 `D:\Project\noche` 保留现有骨架的前提下，补齐“可开工的最小文件集”，把项目推进到可安装、可运行、可继续开发的状态。
- 当前追加目标：以 `docs/tech` 为功能准绳，优先稳定底层规则、数据与可验证闭环，再交给 Gemini 做正式页面。

## Constraints
- 不写业务功能。
- 不接数据库。
- 不做 UI 细节。
- 尽量不打乱现有目录骨架。
- 使用 `pnpm` 作为包管理器。
- 需要安装最小依赖：`pinia`、`dayjs`、`uuid`。

## Phases
- [complete] Phase 1: 建立规划记录并确认初始化边界
- [complete] Phase 2: 创建技术与规格文档
- [complete] Phase 3: 合并 Uni-app 最小工程结构
- [complete] Phase 4: 安装依赖并完成最小入口配置
- [complete] Phase 5: 验证命令可运行并写入日志
- [complete] Phase 6: 收敛草稿槽位规则并补齐单元测试入口
- [pending] Phase 7: 打通 entry/draft 的最小 repository + store 用例闭环

## Assumptions
- 使用官方 Uni-app Vue3 + Vite + TypeScript 模板作为初始化基线。
- 为保证可运行性，允许增加最小页面文件与静态资源目录。
- 当前任务允许新增最小 store、domain、data、shared、features 骨架文件，但不实现正式页面与完整数据库。
- 功能判断以 `docs/tech` 下文档为准；`docs/spec` 仅作为产品背景参考。
- 交给 Gemini 的页面/UI 任务只提供接口与边界，不强压视觉创造方案。

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `build:h5` 首次构建提示缺少 `sass` | 1 | 去掉页面与根组件中的 `lang=\"scss\"`，改为纯 CSS 与 CSS 变量，避免额外增加样式预处理依赖 |
| PowerShell 清理校验日志时使用了保留变量 `$PID` | 1 | 改为普通变量名并定向结束 `uni` 进程后完成清理 |
| 使用 `pnpm` 接管现有 `npm` 安装结果时出现“不同包管理器”迁移警告 | 1 | 重新执行 `pnpm install`，生成 `pnpm-lock.yaml` 并移除旧的 `package-lock.json` |
| 草稿槽位规则出现 `draft_*` 与 `type:default` 两套命名 | 1 | 以 `docs/tech/data_model.md` 的草稿隔离规则为准，统一由 `DRAFT_KEYS` 生成并补单元测试 |
