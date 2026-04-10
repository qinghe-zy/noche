# Task Plan

## Goal
- 在 `D:\Project\noche` 保留现有骨架的前提下，补齐“可开工的最小文件集”，把项目推进到可安装、可运行、可继续开发的状态。
- 当前追加目标：以 `docs/tech` 为功能准绳，主攻底层、数据与可验证闭环，并补齐前端可独立开发的契约文档。
- 当前追加目标：将 `noche_codex_function_matrix_and_interaction_logic.md` 纳入项目真相入口，并据此优先补主链路：`写入 -> 保存 -> 阅读 -> 信箱查看 -> 日历跳转 -> 续写恢复`。

## Constraints
- 不写业务功能。
- 不接数据库。
- 不做 UI 细节。
- 尽量不打乱现有目录骨架。
- 使用 `pnpm` 作为包管理器。
- 需要安装最小依赖：`pinia`、`dayjs`、`uuid`。
- 默认连续推进：每轮都执行“实现 -> 验证 -> checkpoint -> commit -> 自动进入下一轮”，直到命中停止条件。

## Phases
- [complete] Phase 1: 建立规划记录并确认初始化边界
- [complete] Phase 2: 创建技术与规格文档
- [complete] Phase 3: 合并 Uni-app 最小工程结构
- [complete] Phase 4: 安装依赖并完成最小入口配置
- [complete] Phase 5: 验证命令可运行并写入日志
- [complete] Phase 6: 收敛草稿槽位规则并补齐单元测试入口
- [complete] Phase 7: 按最终 tech 口径收敛 Entry / Draft 核心模型
- [complete] Phase 8: 打通 entry/store 的最小 repository 用例闭环
- [complete] Phase 9: 为 Gemini 准备轻量 UI handoff 与稳定接口说明
- [complete] Phase 10: 调用 Gemini CLI 在约定目录实现首个页面 UI 闭环
- [complete] Phase 11: 继续推进 editor/draft 最小写作闭环，形成最小 save/read 页面闭环
- [pending] Phase 12: 基于现有 entry/draft 闭环接入 mailbox/read 读取路径
- [complete] Phase 13: 补齐前后端分离契约文档与后端功能清单
- [complete] Phase 14: 纳入 Codex 功能矩阵文档，并补通 read/resume 主链缺口
- [in_progress] Phase 15: 按 stitch 参考收口 Mailbox / Calendar / Day Archive 页面状态与文案，并补 H5 可视化验收
- [in_progress] Phase 16: 继续把页面展示文案与日期显示从页面内联收口为 feature helper

## Assumptions
- 使用官方 Uni-app Vue3 + Vite + TypeScript 模板作为初始化基线。
- 为保证可运行性，允许增加最小页面文件与静态资源目录。
- 当前任务允许新增最小 store、domain、data、shared、features 骨架文件，但不实现正式页面与完整数据库。
- 功能判断以 `docs/tech` 下文档为准；`docs/spec` 仅作为产品背景参考。
- 交给 Gemini 的页面/UI 任务只提供接口与边界，不强压视觉创造方案。
- 新增的 `noche_codex_function_matrix_and_interaction_logic.md` 应进入项目真相文档链，并高于零散 prompt 文档。
- `docs/stitch/**` 只作为结构与视觉节奏参考，不继承原型文案、示例图片或假数据表达。

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `build:h5` 首次构建提示缺少 `sass` | 1 | 去掉页面与根组件中的 `lang=\"scss\"`，改为纯 CSS 与 CSS 变量，避免额外增加样式预处理依赖 |
| PowerShell 清理校验日志时使用了保留变量 `$PID` | 1 | 改为普通变量名并定向结束 `uni` 进程后完成清理 |
| 使用 `pnpm` 接管现有 `npm` 安装结果时出现“不同包管理器”迁移警告 | 1 | 重新执行 `pnpm install`，生成 `pnpm-lock.yaml` 并移除旧的 `package-lock.json` |
| 草稿槽位规则出现 `draft_*` 与 `type:default` 两套命名 | 1 | 以 `docs/tech/data_model.md` 的草稿隔离规则为准，统一由 `DRAFT_KEYS` 生成并补单元测试 |
| `docs/tech` 下最终版数据模型使用 `future/status/unlockDate`，当前代码仍使用 `future-letter/futureStatus/futureUnlockDate` | 1 | 以用户“功能以 docs/tech 为准”的要求和最终版 tech 文档为准，收敛代码与 canonical `data_model.md` |
| PowerShell 中直接写复杂引号正则导致解析错误 | 1 | 改用简单 `rg "defineStore" src/app/store` 验证 store 定义数量 |
| Gemini 完成 UI 后尝试调用自身不存在的 `run_shell_command` 工具 | 1 | Codex 接手运行 `pnpm test:unit`、`pnpm type-check`、`pnpm build:h5` 与 Playwright 验证 |
| Home UI 使用 `lang=\"scss\"`，构建缺少 `sass` | 1 | 保留 Gemini 视觉结构，改成纯 CSS，不新增依赖 |
| `Start-Process pnpm` 在 Windows 下不能直接运行 pnpm shim | 1 | 改用 `Start-Process pnpm.cmd` |
| dev server 首轮导航时被停止导致 Vite connection lost | 1 | 重新启动 dev server 后复测，控制台 0 error |
| Gemini CLI 两次 headless editor 调用在 10 分钟超时内未写出文件 | 1 | 保留 handoff 文档和调用记录，本轮由 Codex 本地接管 editor feature 实现与验收 |
| Playwright MCP 导航本地 dev server 时尝试写入 `C:\Windows\System32\.playwright-mcp\...` 并触发 `EPERM` | 1 | 本轮已保留 dev server 正常启动证据与完整报错，待后续切换可写目录或 MCP 环境后再继续浏览器自动化验收 |
