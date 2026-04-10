# CHECKPOINT 22 - Editor Destroy And Empty Save Rules

## 1. 本轮概述

本轮继续沿着“可上线版本”推进，但重点不是视觉，而是把 Editor 里原本还没补全的关键行为补完整：

1. 阅读态销毁
2. 空白新草稿点击信封后的处理
3. 已保存内容续写后删空，再次保存时的处理

同时按用户新增要求，优先考虑后续可扩展性，因此本轮没有把规则继续堆在页面里，而是先把保存决策下沉回 domain。

## 2. 本轮实际实现

### Domain

更新：

- `src/domain/services/entryService.ts`

新增：

- `resolveDraftSaveAction()`

当前统一返回：

- `save-entry`
- `discard-empty`
- `destroy-entry`

语义：

- 有内容：正式保存
- 新草稿删空：收起空白纸页
- 已保存内容续写后删空：进入销毁流

### Editor Page

更新：

- `src/features/editor/pages/EditorPage.vue`

新增 / 补全：

- 阅读态新增“销毁”按钮
- 空白新草稿点击信封：
  - 删除当前 draft
  - 轻提示“信纸是空的，已收起”
  - 回首页
- 已保存内容续写后若删空，再次点信封：
  - 弹确认
  - 确认后执行 `destroyEntry`
  - 删除 draft
  - 回首页

这意味着编辑页当前已经不只是“能写能存”，而是开始对空白与销毁场景给出完整行为。

## 3. 本轮新增测试

更新：

- `tests/domain/entryService.test.ts`

新增覆盖：

- 空白新 draft -> `discard-empty`
- 空白 linked draft -> `destroy-entry`
- 非空 draft -> `save-entry`

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：24 个测试文件、57 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 5. 当前结论

Editor 当前已具备：

- 编辑
- 自动保存
- 正式保存
- 阅读
- 续写
- 销毁
- 空白收起

并且保存决策已经开始进入 domain 规则层，符合后续继续扩展时的可维护方向。

## 6. 下一轮自然续做点

下一轮建议继续：

1. 再扫一轮用户可见英文/原型腔
2. 继续补页面级边角功能（尤其 Profile / Mailbox / Calendar 的最终完整度）
3. 若工具链恢复，直接转 APK 打包与安装验证
