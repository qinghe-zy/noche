# CHECKPOINT 35 - Diary Prelude Local-First Upgrade

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮产品升级

从这一轮开始，`diary` 新增“写之前先选天气和心情”的前序模块：

- 仅作用于 `diary`
- 进入 diary 编辑前允许先选择：
  - 天气
  - 心情
- 允许跳过，不阻塞写作主链
- 进入 diary 后，在纸面上部展示缩略前序卡
- 编辑态与阅读态都允许展示
- 编辑态允许点卡重新修改
- 阅读态默认只展示，修改需走续写

## 2. 已审计的旧口径

本轮已确认以下旧口径失效，后续文档与代码不得继续沿用：

1. `Editor` 仍被视为三种内容共用同一张视觉页
2. 图片能力仍只是“未来预留”，不是正式能力
3. Stitch 导出代码可直接进入运行时代码

## 3. Stitch 审计结论

已审计真相源：

- `docs/stitch/stitch_minimalist_paper_diary`

当前导出代码可见的非本地依赖包括：

- `cdn.tailwindcss.com`
- Google Fonts
- Material Symbols 外链
- `hover:*` 桌面交互
- 远程背景纹理图

这些内容只能作为视觉参考，不能直接进入运行时代码。

## 4. 本轮硬约束

1. 整个 prelude 功能必须保持本地优先、离线可用。
2. 不接服务器，不接远程 API，不接登录，不接云同步。
3. 天气 / 心情图标必须本地化为 SVG 组件或本地静态资源。
4. 样式必须收敛为项目内 CSS / 组件样式。
5. 进入飞行模式后仍需可打开、可编辑、可恢复、可阅读。

## 5. 数据升级结论

本轮 diary 将新增 `DiaryPreludeMeta`，并以 `diaryPrelude` 字段挂在：

- `Draft`
- `Entry`

注意：

- 该字段仅对 `diary` 产生业务意义
- `jotting / future` 默认可为空
- prelude 进入草稿层、正式保存层与阅读态展示层
- 仅有 prelude、没有正文且没有图片时，不得生成正式 diary entry

## 6. 当前推荐实现结构

- `EditorPage.vue` 继续作为统一路由入口与 orchestration 页面
- `DiaryEditorShell.vue` 继续作为 diary 壳
- 新增：
  - `DiaryPreludePicker.vue`
  - `DiaryPreludeInlineCard.vue`

接线原则：

- 先在 diary editor 上叠加前序层
- 不拆新重路由
- 不把前序卡混进正文图片流

## 7. 后续验收重点

1. `recordDate` 仍在打开纸张瞬间锁定
2. autosave 与 formal save 都要携带 `diaryPrelude`
3. 仅有 prelude 不能算完成一篇日记
4. diary 首屏仍以日期、标题、正文为主，不让前序卡喧宾夺主

## 8. 已落地实现

### 8.1 文档与规则

已同步：

- `AGENTS.md`
- `docs/tech/jianzirumian_product_spec_v2.md`
- `docs/spec/product_spec_v2.md`
- `docs/tech/data_model.md`
- `docs/spec/interaction_rules.md`
- `docs/tech/noche_codex_function_matrix_and_interaction_logic.md`

同步后的新口径：

- diary 独占 weather + mood prelude
- 进入 diary 编辑前可先选、也可跳过
- 编辑态与阅读态都支持缩略前序卡
- Stitch 外链资源只可参考，不可直接依赖
- 全链路继续本地优先、离线可用

### 8.2 数据与持久化

已新增：

- `src/domain/diaryPrelude/types.ts`
- `src/domain/diaryPrelude/catalog.ts`

已升级：

- `Entry.diaryPrelude`
- `Draft.diaryPrelude`
- draft / entry mapper
- memory / storage / sqlite repository
- SQLite schema 的 `diary_prelude_json`

当前行为：

- autosave 会保存 `diaryPrelude`
- formal save 会把 `diaryPrelude` 写入正式 entry
- resume / restore 会把 `diaryPrelude` 带回 diary draft
- 仅有 prelude、没有正文且没有图片时，仍按空白 diary 处理

### 8.3 页面与资源本地化

已新增：

- `src/features/editor/components/DiaryPreludePicker.vue`
- `src/features/editor/components/DiaryPreludeInlineCard.vue`
- `src/features/editor/components/DiaryPreludeGlyph.vue`
- `src/features/editor/diaryPreludeState.ts`

接线结果：

- `EditorPage.vue` 继续作为 orchestrator
- diary 编辑链路若无 prelude，会先显示 `DiaryPreludePicker`
- diary 纸面顶部通过 `DiaryPreludeInlineCard` 展示缩略前序卡
- 编辑态允许点卡重新打开 picker
- 阅读态只展示，不提供直接修改入口

### 8.4 Stitch 承接与本地化结果

本轮承接的 stitch 视觉元素：

- 米白底 + 白纸卡的纸感层级
- 手绘感天气 / 情绪 glyph
- 中文主标签 + 英文副标签
- 极轻分隔线
- 短句式脚注文案
- 克制留白和轻阴影

已本地化替换的外链资源：

- Tailwind CDN -> 组件内 CSS
- Google Fonts -> 项目现有字体策略
- Material Symbols -> 本地 SVG glyph / 现有 `AppIcon`
- 远程背景纹理图 -> 不再使用
- hover-only 演出 -> 改为移动端 tap 交互

## 9. 验证结果

已通过：

- `pnpm test:unit`
- `pnpm type-check`
- `pnpm build:h5`

补充说明：

- 已尝试做本地浏览器验收，但 Playwright MCP 仍被 `C:\Windows\System32\.playwright-mcp` 写权限问题阻塞，当前环境无法完成自动化截图验收。
- 飞行模式实机验收步骤已具备执行前提，但本线程未直接完成真机飞行模式复验。
