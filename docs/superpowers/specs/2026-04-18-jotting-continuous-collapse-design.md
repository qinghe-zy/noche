# Jotting 预览态连续收拢头部设计

## 背景

当前 `JottingEditorShell.vue` 的预览态沿用“固定头部 + 卡片正文 + 内层 body scroll”的结构。头部固定占高较大，正文首屏面积偏小；同时头部与正文是两层相对独立的布局，无法形成“内容驱动滚动、头部连续收拢并最终并入返回栏”的阅读体验。

本次改动目标是把随笔预览态和编辑态重构为：

- 正文滚动是唯一驱动力
- 头部从展开态连续压缩到单层顶栏
- 日期、标题各只有一个真实 DOM 节点
- 正文顶边始终紧贴 overlay 底边，不出现空白带、跳变或重影
- 编辑态压缩时机稳定，不因键盘与光标跟随而抖动

## 范围

本轮覆盖：

- `src/features/editor/components/JottingEditorShell.vue`
- `src/features/editor/jottingContinuousCollapse.ts`

本轮明确不改：

- `EditorPage.vue` 的业务流转
- 日记、未来信编辑器壳层
- 多语言文案内容

## 核心原则

### 1. 单元素插值，禁止双布局交接

日期和标题在整个预览态中各只存在一个 DOM 节点。展开态与折叠态的视觉变化全部通过样式插值完成，不允许“展开版节点”和“折叠版节点”同时存在后再做淡入淡出。

### 2. 固定 spacer，禁止高度反写

`scroll-view` 顶部使用固定高度 spacer，为展开态头部预留空间。spacer 不随滚动进度变化，避免出现：

- spacer 高度变化
- scrollTop 被动漂移
- progress 重新计算
- 再次触发布局回流
- 循环抖动

### 3. 读态和编辑态都使用整页 scroll shell，但编辑态滚动职责拆分

`mode === 'read'` 与 `mode === 'edit'` 在模板层拆成两个分支。两者都使用外层整页 `scroll-view` 和固定 overlay 头部，但编辑态需要额外拆开：

- 外层 shell scroll：只负责页面滚动和头部收拢
- 键盘期内层 body scroll：只负责 caret-aware scroll
- 键盘弹起后冻结外层收拢进度，不再让输入补偿滚动驱动头部变化

### 4. 视觉连续性优先于实现“巧妙”

任何可能破坏“overlay 底边与内容顶边连续贴合”的写法都不采用，即使代码表面更少。

## 最终结构

`JottingEditorShell.vue` 拆成以下结构：

```text
jotting-shell (100vh)
├── read branch
│   ├── scroll-view
│   │   ├── spacer
│   │   ├── paper
│   │   │   ├── readMeta
│   │   │   ├── attachments
│   │   │   └── readContent
│   │   └── signature + bottomPad
│   └── header-overlay
│       ├── overlay-bg
│       ├── back-btn
│       ├── continue-write / spacer
│       ├── eyebrow
│       ├── date
│       └── title
└── edit branch
    ├── shell-scroll
    │   ├── spacer
    │   ├── paper
    │   │   ├── title input
    │   │   ├── attachments
    │   │   └── body
    │   │       ├── keyboard hidden: static flow
    │   │       └── keyboard visible: inner body scroll for caret follow
    │   └── signature + bottomPad
    └── header-overlay
        ├── overlay-bg
        ├── back-btn
        ├── save-btn
        ├── eyebrow
        ├── date
        └── readonly title
```

### 结构职责

- `scroll-view`：只负责正文滚动，不参与头部布局。
- `spacer`：固定高度，提供展开态头部占位。
- `paper`：正文与附件的视觉承载面，顶部圆角和阴影可随进度压平。
- `header-overlay`：顶部固定层，承载所有头部动画。
- `overlay-bg`：从屏幕顶到底部覆盖到当前 overlay bottom，确保内容与头部交接区域永远是实体背景。
- `date/title`：唯一的日期与标题节点。
- `readMeta`：保留在 `paper` 内，因为它是补充元信息，不参与头部收拢。
- `attachments`：继续保留在 `paper` 内，点击行为仍为预览。
- 编辑态标题：展开态使用真实 `input`，折叠态使用只读展示文本，不承接编辑焦点。
- 编辑态内层 body scroll：仅键盘期启用，用于 caret-aware scroll，不参与 collapse progress。

## 用户交互决策

### 继续写点击策略

当 `canContinueWrite` 为真时：

- 点击附件：保持图片预览
- 点击正文文本区：触发继续写
- 点击 `paper` 留白区：触发继续写

当 `collapseProgress <= 0.05` 时，直接进入编辑态。

当 `collapseProgress > 0.05` 时，先将读态滚动位置动画回顶，再进入编辑态，确保模式切换发生在展开态，不造成视觉断层。

### 无标题策略

若随笔没有标题：

- 展开态不渲染标题文本
- 折叠态也不保留标题占位
- 顶栏仅保留日期

这样可以避免“未命名”之类的额外文案破坏单元素真实内容驱动原则。

### 编辑态标题策略

编辑态标题按两种职责处理：

- 展开态：真实 `input`
- 折叠态：只读展示文本，不可编辑

标题字号要求明显大于正文，展开态建议使用：

- `editTitleInputFontSize = rpx(48)`

折叠态标题展示字号收敛为：

- `editCollapsedTitleFontSize = rpx(26)`

### 编辑态压缩时机

编辑态头部收拢只跟随用户页面滚动。

当 `keyboardVisible === true` 时：

- 冻结外层 `collapseProgress`
- 启用内层正文滚动补偿
- 不允许键盘带出的光标跟随滚动继续推动头部收拢

这样可以避免“点击某个编辑位置后，键盘弹起把文本整体顶到上方”的错位体验。

### paper 顶部视觉策略

展开态 `paper` 保持卡片感；随着收拢接近终态：

- 顶部圆角逐步压平到 `0`
- 顶部阴影逐步减弱到 `0`
- 底部圆角保持轻微存在

最终观感是内容被顶栏自然吸上去，而不是一张悬浮卡片永远停在下方。

## 数据与状态设计

读态新增状态如下：

- `readScrollTop: Ref<number>`
- `collapseProgress: ComputedRef<number>`
- `measuredPaperHeight: Ref<number>`
- `readCanScroll: ComputedRef<boolean>`
- `measuredDateWidth: Ref<number>`
- `isTransitioningToEdit: Ref<boolean>`
- `readScrollWithAnimation: Ref<boolean>`
- `readAnimatedScrollTop: Ref<number>`

编辑态新增状态：

- `editShellScrollTop: Ref<number>`
- `editUserScrollTop: Ref<number>`
- `editCollapseProgress: Ref<number>`
- `measuredEditPaperHeight: Ref<number>`
- `isProgrammaticEditBodyScroll: Ref<boolean>`
- `isEditShellScrollLocked: ComputedRef<boolean>`

编辑态现有 `writingScrollTop / scrollWithAnimation / textareaFocused` 保留，但仅服务键盘期 body 补偿滚动，不复用为头部收拢进度源。

## 布局常量与几何定义

所有 `rpx` 通过现有 `rpxToPx` 转换。

### 顶栏基础量

- `topbarTop = statusBarHeight + rpx(32)`
- `topbarHeight = rpx(88)`
- `topbarBottom = topbarTop + topbarHeight`

### 展开态

- `eyebrowTop = topbarBottom + rpx(48)`
- `eyebrowFontSize = rpx(18)`
- `eyebrowVisualHeight = rpx(30)`
- `dateExpandedTop = eyebrowTop + eyebrowVisualHeight`
- `dateExpandedLeft = rpx(76)`
- `dateExpandedFontSize = rpx(60)`
- `dateExpandedLineHeight = dateExpandedFontSize * 1.14`
- `titleExpandedTop = dateExpandedTop + dateExpandedLineHeight + rpx(16)`
- `titleExpandedLeft = rpx(76)`
- `titleExpandedFontSize = rpx(40)`
- `titleExpandedLineHeight = titleExpandedFontSize * 1.24`
- `titleExpandedMaxWidth = screenWidth - rpx(152)`

### 折叠态

- `dateCollapsedTop = topbarTop + (topbarHeight - rpx(26)) / 2`
- `dateCollapsedLeft = rpx(132)`
- `dateCollapsedFontSize = rpx(26)`
- `titleCollapsedTop = dateCollapsedTop`
- `titleCollapsedFontSize = rpx(26)`
- `titleGapAfterDate = rpx(12)`

右侧安全区按按钮存在与否确定：

- 若 `canContinueWrite` 为真：预留继续写按钮宽度
- 若 `canContinueWrite` 为假：预留一个与图标按钮接近的安全区，避免标题顶到右侧边缘

### 收拢高度定义

- `expandedMetaHeight = titleExpandedTop + titleExpandedLineHeight - topbarBottom`
- `collapseDistance = expandedMetaHeight`
- `spacerHeight = topbarBottom + expandedMetaHeight`

### 进度定义

- `collapseProgress = clamp(readScrollTop / collapseDistance, 0, 1)`
- `editCollapseProgress = clamp(editUserScrollTop / editCollapseDistance, 0, 1)`

滚动超过 `collapseDistance` 后，头部保持折叠终态，不再继续变形。

编辑态在键盘弹起后冻结 `editCollapseProgress`，直到键盘收起。

## 测量设计

### 日期宽度测量

折叠态标题的左起点依赖日期实际渲染宽度，因此需要以下两阶段策略：

1. 初始估算
   - 使用 `estimateJottingTextWidth(headlineDate, dateCollapsedFontSize)` 计算初始宽度
   - 保证首帧布局稳定

2. 挂载后修正
   - 使用 `createSelectorQuery` 测量 overlay 中日期节点真实宽度
   - 更新 `measuredDateWidth`
   - 重新计算 `titleCollapsedLeft`

最终：

- `titleCollapsedLeft = dateCollapsedLeft + measuredDateWidth + titleGapAfterDate`

### paper 高度测量

`paper` 高度用于判断读态是否允许滚动：

- `readCanScroll = measuredPaperHeight > (visibleWindowHeight - spacerHeight)`

测量时机：

- `onMounted`
- `content` 变化
- `attachments.length` 变化
- `mode` 切到 `read`
- `screenWidth` 变化

### 不测量标题宽度

标题不做真实宽度测量，也不做反推布局。标题长度问题统一由：

- `maxWidth`
- `maxHeight`
- `white-space`
- `text-overflow`

控制，避免让布局链路依赖更多测量结果。

## 插值模型

继续复用 `interpolateJottingMetric` 作为数值插值函数。新增 `estimateJottingTextWidth` 作为日期宽度估算辅助函数。

### eyebrow

- `opacity`：在 `progress [0, 0.3]` 区间从 `1` 到 `0`
- `height contribution`：在 `progress [0, 0.2]` 区间从完整贡献降到 `0`

`eyebrow` 节点本身保留，但在早期先淡出并释放垂直空间，驱动 `date` 和 `title` 上移。

### date

以下属性在 `progress [0, 1]` 全程线性插值：

- `top`
- `left`
- `fontSize`
- `maxWidth`

### title

以下属性在 `progress [0, 1]` 全程线性插值：

- `top`
- `left`
- `fontSize`
- `maxWidth`

以下属性分阶段收缩：

- `maxHeight`
  - `progress [0, 0.5]`：保持多行空间
  - `progress [0.5, 0.8]`：逐步压到单行高度
- `white-space / text-overflow`
  - `progress < 0.8`：允许正常换行
  - `progress >= 0.8`：切到 `nowrap + ellipsis`

### overlay background

overlay 背景高度定义为：

- `overlayBottom = topbarBottom + expandedMetaHeight * (1 - collapseProgress)`

即背景始终覆盖从屏幕顶到当前头部底部的整个区域。

### paper 外观

在 `progress [0.65, 1]` 区间内：

- `border-top-left-radius`：从展开态值插到 `0`
- `border-top-right-radius`：从展开态值插到 `0`
- `box-shadow`：逐步衰减为无

底部圆角不强制归零，以保留轻微纸面感。

## 数学连续性约束

本设计依赖以下关系成立：

- 内容顶部屏幕坐标：`spacerHeight - scrollTop`
- overlay 底部屏幕坐标：`topbarBottom + expandedMetaHeight - scrollTop`

由于：

- `spacerHeight = topbarBottom + expandedMetaHeight`

所以在任意 `scrollTop = S` 且 `S ∈ [0, collapseDistance]` 时：

- 内容顶部屏幕坐标 = overlay 底部屏幕坐标

这保证了：

- 头部与正文交界区零间隙
- 头部收拢时内容自然上接
- 无需额外补动画或过渡蒙层来掩盖断裂

## 模板改造方案

### read 分支

读态模板需要新增以下类簇：

- `.jotting-shell-read`
- `.jotting-shell-read__scroll`
- `.jotting-shell-read__spacer`
- `.jotting-shell-read__paper`
- `.jotting-shell-read__overlay`
- `.jotting-shell-read__overlay-bg`
- `.jotting-shell-read__eyebrow`
- `.jotting-shell-read__date`
- `.jotting-shell-read__title`
- `.jotting-shell-read__signature`
- `.jotting-shell-read__bottom-pad`

读态中不再渲染当前 `.jotting-editor-shell__read-title`。标题只存在于 overlay。

`readMeta`、`attachments`、`readContent` 继续留在 `paper` 中。

### edit 分支

编辑态新增以下类簇：

- `.jotting-shell-edit`
- `.jotting-shell-edit__scroll`
- `.jotting-shell-edit__spacer`
- `.jotting-shell-edit__paper`
- `.jotting-shell-edit__overlay`
- `.jotting-shell-edit__overlay-bg`
- `.jotting-shell-edit__topbar`
- `.jotting-shell-edit__eyebrow`
- `.jotting-shell-edit__date`
- `.jotting-shell-edit__title-display`

展开态标题输入保留在 `paper` 中；折叠态只读标题存在于 overlay 中。

## 事件与滚动行为

### 读态滚动

- `scroll-view :scroll-y="readCanScroll && !isTransitioningToEdit"`
- `scroll-view :scroll-top="readAnimatedScrollTop"`
- `scroll-view :scroll-with-animation="readScrollWithAnimation"`

`onReadScroll` 只做两件事：

- 更新 `readScrollTop`
- 由此驱动 `collapseProgress`

禁止在滚动回调里做这些事：

- 反写 spacer 高度
- 反写 paper 高度
- 根据进度切换不同 DOM
- 动态插删标题/日期节点

### 编辑态滚动

- `shell-scroll` 只负责页面滚动和头部压缩
- `keyboardVisible === false` 时：
  - 允许外层页面滚动
  - `editCollapseProgress` 跟随 `editUserScrollTop`
- `keyboardVisible === true` 时：
  - 冻结外层页面压缩进度
  - 仅允许内层 body 滚动补偿光标位置

禁止让 `writingScrollTop` 直接驱动头部收拢。

### 继续写过渡

当点击正文或 `paper` 留白，且允许继续写时：

1. 若 `collapseProgress <= 0.05`
   - 直接 `emit('continue-write')`

2. 若 `collapseProgress > 0.05`
   - `isTransitioningToEdit = true`
   - `readScrollWithAnimation = true`
   - `readAnimatedScrollTop = 0`
   - 等待约 `250ms`
   - 再 `emit('continue-write')`

在等待期间：

- 禁止再次触发滚动交互
- 若组件销毁或模式已切换，则取消后续补发

### 附件点击

附件点击行为在读态始终优先走：

- `preview-attachment`

不因为头部已折叠而改为继续写。

## 需要新增的 script 逻辑

### `JottingEditorShell.vue`

新增：

- 读态专用 refs
- 读态专用 computed
- 编辑态 shell scroll refs
- 编辑态只读标题展示 computed
- `onReadScroll`
- `onEditShellScroll`
- `measurePaperHeight`
- `measureEditPaperHeight`
- `measureCollapsedDateWidth`
- `handleContinueWriteTap`

现有编辑态 caret-aware 逻辑保留，但需要改成只在键盘期驱动正文补偿滚动。所有新增 watcher 都要先按 `mode` 守卫，避免读写态串扰。

### `jottingContinuousCollapse.ts`

新增：

- `estimateJottingTextWidth(text: string, fontSize: number): number`

实现要求：

- 返回稳定的近似像素宽度
- 优先保证中文日期和英文月份缩写的估算不出现明显低估
- 不追求精确排版，只用作首帧布局兜底

## 验收映射

### 1. 正文未撑满预览区时不可滚动

通过 `readCanScroll` 控制：

- 短内容页面上滑无响应

### 2. 正文溢出后头部平滑收拢

通过单节点样式插值保证：

- 慢速滚动时日期、标题位置和字号连续变化
- 标题左缩进由日期真实宽度推导，自然形成

### 3. 任意时刻只有一套可见标题信息

通过删除 `paper` 中的读态标题渲染实现：

- 标题全程只存在于 overlay

### 4. 正文上边界持续上收，交接区无空白带

通过固定 spacer 与 overlay 底部等式保证：

- `overlay bottom = content top`

### 5. 折叠终态仅一层栏高

通过 `overlay-bg` 最终高度收敛到 `topbarBottom` 保证：

- 终态只剩返回栏所在的一层高度

### 6. 折叠态点击继续写先展开回位再进编辑

通过回顶动画和延迟发射事件实现：

- 先回到展开头部
- 再切编辑态

### 7. 编辑态标题显著大于正文

通过展开态标题输入字号配置保证：

- 标题输入视觉层级高于正文

### 8. 编辑态键盘弹起后光标位置稳定

通过“冻结外层收拢 + 内层 caret-aware scroll”实现：

- 键盘弹起后文本不整体被顶到上方
- 当前光标行尽量稳定地留在可视区

## 风险与缓解

### 1. `scroll-view` 动画回顶无精确完成回调

风险：

- 不同端的动画时长不完全一致

缓解：

- 固定等待 `220ms ~ 260ms`
- 统一取较保守值 `250ms`
- 期间锁定二次点击

### 2. 日期宽度首帧估算与实测有微小偏差

风险：

- 标题初始 left 可能有轻微抖动

缓解：

- 用估算值保证首帧稳定
- mount 后只修正一次
- 不对标题做额外弹性动画

### 3. 读态和编辑态共用一个组件，watcher 易串扰

风险：

- 编辑态逻辑被读态 watcher 误触发

缓解：

- 所有新增 watcher、测量和滚动处理都先判断 `mode === 'read'`
- 编辑态状态与读态状态分开命名，不混用

### 4. 标题极长或本地化日期变长

风险：

- 折叠态可用宽度过小

缓解：

- 标题宽度始终由可用区域上限裁切
- 在 `progress >= 0.8` 时进入单行省略
- 无标题时直接不渲染标题节点

## 测试与验证建议

实现完成后至少验证以下场景：

1. 短正文、无附件、无标题
2. 长正文、无附件、有标题
3. 长正文、有多张附件、有标题
4. 长英文日期格式和中文日期格式
5. 无继续写按钮场景
6. 折叠过半后点击正文继续写
7. 折叠过半后点击附件预览
8. 屏宽变化后的日期宽度重测

重点观察：

- 是否存在双标题
- overlay 与正文交界是否露底
- 回顶进编辑是否有跳闪
- 长标题在 `0.5 ~ 1.0` 区间裁切是否连续

## 不做的事

本设计明确不包含：

- 对编辑态结构做统一重构
- 对 Jotting 以外编辑器壳层做抽象复用
- 引入新的动画库
- 重做 `readMeta` 的信息结构
- 依赖复杂文本真实排版测量来驱动布局

## 实现完成标准

以下条件同时满足时，视为本需求完成：

- 读态结构与编辑态结构已完全分流
- 日期与标题仅保留单个 DOM 节点
- spacer 固定且无滚动抖动
- `paper` 顶部与 overlay 底部全程连续
- 点击继续写符合“先回顶再进编辑”规则
- 编辑态既有键盘与光标逻辑无回归
