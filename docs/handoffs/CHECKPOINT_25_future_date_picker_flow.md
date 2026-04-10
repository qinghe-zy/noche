# CHECKPOINT 25 - Future Date Picker Flow

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮概述

本轮继续补 `future` 的封存前交互，让它更接近当前功能矩阵定义的行为：

- 未选日期时，点击信封先触发日期选择
- 选好日期后再正式封存

此前实现里，future 草稿会默认带一个“明天”的日期，这会让封存动作显得过于自动，弱化了产品定义中的轻仪式感。

## 2. 本轮实际实现

### Domain

更新：

- `src/domain/services/entryService.ts`

变更：

- `DraftSaveAction` 新增 `pick-future-date`
- `resolveDraftSaveAction()` 现在能区分：
  - 有内容但未选 unlockDate 的 future draft

### Editor

更新：

- `src/features/editor/pages/EditorPage.vue`

当前 future 流程改为：

1. future 草稿默认不再自动预填明天
2. 用户有正文但还没选日期时，点击信封
3. 页面打开底部半屏日期选择层
4. 只有选定合法日期后，才继续正式封存

### 规则复用

- 日期合法性校验继续复用 `isValidFutureLetterDate()`
- 保存意图判断继续复用 `resolveDraftSaveAction()`

这保证了“选择日期”不是页面随意判断，而是规则驱动的 UI 分支。

## 3. 本轮新增 / 更新测试

更新：

- `tests/domain/entryService.test.ts`

新增覆盖：

- future draft 有正文但缺 unlockDate 时，应返回 `pick-future-date`

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：25 个测试文件、60 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 5. 当前结论

当前 future 已不再是“默认给明天日期然后直接保存”的简化版本，而是更接近真实产品定义的最小可用实现：

- 写正文
- 点信封
- 若未选日期则先选
- 选好后再封存

## 6. 下一轮自然续做点

下一轮建议继续：

1. 补自动标题（首行 12~16 字）
2. 继续扫描主路径里残留的非产品腔文案
3. 若功能矩阵验收足够，再切回 APK 打包与安装验证
