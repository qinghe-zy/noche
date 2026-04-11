# Repository AGENTS.md

## 主验收设备

- 主验收设备：`Redmi Note 11T Pro+`

## 当前设备约束

1. 当前阶段以 `Redmi Note 11T Pro+` 作为主目标设备，不优先为全机型泛化优化。
2. 页面实现、交互链路、后台恢复、隐私锁恢复、静默暂存，优先保证该机型上的真实体验。
3. Android 实机验证清单默认围绕 `Redmi Note 11T Pro+` 编写。
4. 当前阶段优先确保：
   - 可安装
   - 可启动
   - 可编辑
   - 可保存
   - 可恢复
   - 可浏览

## 实现原则补充

1. 新规则优先落在 `store / domain / facade / repository`，避免散落到页面。
2. 写代码时优先考虑后续可扩展性：先抽稳定语义，再接页面。
3. 在设备约束没有解除前，不为了全机型兼容性而牺牲当前主目标设备体验。

## 书写页排版标准

1. 所有新增书写页面（如日记、随笔、未来信等正文书写面），正文默认字号统一使用 `18px`（约 `36rpx`）。
2. 若确需偏离该字号，必须先以 `Redmi Note 11T Pro+` 的真实阅读舒适度为依据验证后再调整。

## Editor 当前真相

1. `EditorPage` 继续作为统一路由入口与 orchestration 页面，但视觉层不再让日记 / 随笔 / 未来信共用同一套壳。
2. 当前 Editor 视觉真相源固定为：
   - `docs/stitch/diary_editor`
   - `docs/stitch/minimalist_jotting_editor`
   - future letter 沿用当前沉浸式信纸方向
3. 推荐结构固定为：
   - `DiaryEditorShell.vue`
   - `JottingEditorShell.vue`
   - `FutureLetterEditorShell.vue`
4. 三种内容类型允许共享 `draft / save / destroy / resume / unlockDate` 等稳定语义，但不要为了复用把三套视觉重新揉回一张皮。

## 图片附件当前范围

1. 从当前版本开始，`diary / jotting / future` 都支持本地图片插入。
2. 第一版图片能力范围固定为：
   - 本机选择
   - 插入当前草稿
   - 编辑态展示
   - 删除
   - 自动暂存恢复
   - 正式保存恢复
   - 阅读态查看
3. 当前阶段图片能力必须保持本地优先、离线可用，不依赖服务器，不引入云同步前提。
4. 当前阶段不做：
   - 云上传
   - 账号同步
   - 复杂图片编辑
   - 多图富文本排版
   - 图片音频混合编辑器

## Diary 前序信息当前范围

1. 从当前版本开始，只有 `diary` 支持写前前序信息。
2. `diary` 可选的前序元信息固定为：
   - 天气
   - 心情
3. 进入 `diary` 编辑态前，允许先选择天气和心情，也允许跳过。
4. 编辑态与阅读态都允许展示 diary 的缩略前序卡。
5. 编辑态允许轻点前序卡重新修改；阅读态默认只展示，修改需走续写。
6. `jotting / future` 当前不接这组前序元信息。

## 本地运行硬约束

1. 当前阶段所有主链功能必须保持 Android-only、Local-first、离线可用。
2. 不接 Spring Boot，不接任何远程 API，不接登录系统，不接云同步。
3. 不允许运行时依赖：
   - Google Fonts
   - Tailwind CDN
   - Material Symbols 外链
   - 远程图片 URL
   - 外链 SVG
4. `docs/stitch/**` 下的导出代码只允许作为视觉参考，不可直接成为运行时代码依赖。
5. 视觉资源必须转成项目内可打包的本地 SVG、静态资源或组件样式。
