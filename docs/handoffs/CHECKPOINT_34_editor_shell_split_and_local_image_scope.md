# CHECKPOINT 34 - Editor Shell Split And Local Image Scope

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮变更结论

Editor 的旧口径已经失效，新的真相如下：

- `diary`
  - 视觉真相源：`docs/stitch/diary_editor`
- `jotting`
  - 视觉真相源：`docs/stitch/minimalist_jotting_editor`
- `future`
  - 继续沿用当前沉浸式信纸 editor

从这一轮开始，不能再把三种类型继续压在同一张 future-style 纸面上做小修小补。

## 2. 新的能力边界

本轮范围已经升级为：

1. 三套 editor shell 分离
2. 共用 draft / save / destroy / resume 逻辑
3. `diary / jotting / future` 都支持本地图片插入
4. 图片能力第一版只做：
   - 本机选择
   - 插入
   - 展示
   - 删除
   - 自动暂存恢复
   - 正式保存恢复
   - 阅读态查看
5. 仍保持本地优先、离线可用

## 3. 已废弃的旧口径

以下旧说法不再成立：

1. `Editor` 是统一承接三种模式的同一套视觉页面
2. 图片正式能力当前不做，只做结构预留

后续文档、测试和页面实现都必须以本 checkpoint 和更新后的真相文档为准。

## 4. 推荐实现结构

路由先不拆散，继续保持：

- `src/features/editor/pages/EditorPage.vue`

但内部视觉壳改为：

- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/JottingEditorShell.vue`
- `src/features/editor/components/FutureLetterEditorShell.vue`

共享逻辑继续通过 store / domain / composables 编排。

## 5. 数据升级要求

本轮数据模型必须补 `attachments` 概念：

- `Entry` 保留 `content`
- 图片不写进纯文本
- 附件独立建模，至少包含：
  - `id`
  - `type = image`
  - `entryId` 或 `draftKey`
  - `localUri`
  - `sortOrder`
  - `createdAt`
  - `width`
  - `height`

## 6. 保存规则升级

旧规则：

- `content.trim() === ""` 视为空白

新规则：

- 只有“正文为空且附件为空”时才视为空白
- 只要存在图片附件，即使正文为空，也允许正式保存

这条规则必须同步到：

- autosave
- formal save
- destroy 判定
- 标题 fallback

## 7. 标题 fallback 升级

若正文存在，仍优先使用正文首行生成标题。

若只有图片没有文字，使用：

- `diary` -> `图片日记`
- `jotting` -> `图片随笔`
- `future` -> `图片未来信`

## 8. 当前阶段建议顺序

1. 先完成文档口径替换
2. 再补 attachment model 与本地持久化
3. 再做 `EditorPage -> shell` 分发
4. 先接 diary shell
5. 再接 jotting shell
6. 最后做 future shell 兼容收口
7. 最后统一补测试与验收
