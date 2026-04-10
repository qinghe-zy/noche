# CHECKPOINT 29 - Function Matrix Acceptance

主验收设备：`Redmi Note 11T Pro+`

## 1. 验收目标

本轮不再继续零散补点，而是基于：

- `docs/tech/noche_codex_function_matrix_and_interaction_logic.md`

对当前版本做一次功能矩阵对照验收，判断是否已经达到：

1. 功能矩阵主链完成
2. 前端界面进入可交付状态
3. 可以切回 APK 打包链

## 2. 验收结论

### 2.1 P0 主链能力

| 能力 | 当前状态 | 结论 |
|---|---|---|
| 今日日记写入 | Home -> diary 已接通 | 通过 |
| 今日日记恢复 | draft 优先 / saved diary 次之 / 新建最后 | 通过 |
| 日记按天唯一 | diary 草稿与读取已按日期分槽 | 通过 |
| 已保存日记续写 | read mode -> continue write | 通过 |
| 新建随笔 | Home -> jotting 已接通 | 通过 |
| 活跃随笔草稿冲突处理 | 继续上次 / 另起一张 / 取消 | 通过 |
| 写未来信 | Home -> future 已接通 | 通过 |
| future 日期最早为明天 | 规则校验已接通 | 通过 |
| future 封存前日期选择 | 未选日期时打开底部选择层 | 通过 |
| future 封存后不可续写 | `resumeEntry()` 明确阻止 | 通过 |
| future 自动解锁 | 读取 facade 会物化 unlock 状态 | 通过 |
| Mailbox 往日信件 / 待启之信 | 双 tab 已接通 | 通过 |
| Mailbox 阅读态跳转 | 已解锁内容进入 read mode | 通过 |
| 未解锁 future 提示 | sealed future 只提示开启日期 | 通过 |
| 未解锁 future 销毁 | Mailbox 已补入口 | 通过 |
| Calendar 日期打点 | 已接通 | 通过 |
| Calendar 单条直达 | 已接通 | 通过 |
| Calendar 多条进入 Day Archive | 已接通 | 通过 |
| Calendar 历史空白补 diary | 已接通 | 通过 |
| 自动静默暂存 | draft autosave 已在 editor 接通 | 通过 |
| 正式保存后进入阅读态 | 已接通 | 通过 |
| 空白内容拦截 | 空白收起 / 已保存删空后销毁 | 通过 |
| destroyEntry 统一入口 | 页面侧统一复用 store | 通过 |

### 2.2 P1 能力

| 能力 | 当前状态 | 结论 |
|---|---|---|
| 自动标题 | 首个非空行截取标题 | 通过 |
| Profile 基本信息展示 | 已完成 | 通过 |
| Profile 轻统计 | 已完成 | 通过 |
| Profile 外观设置 | 已完成 | 通过 |
| 隐私锁入口与恢复 | settings + app overlay 已接通最小闭环 | 通过 |

### 2.3 P2 / 信息架构项

| 能力 | 当前状态 | 结论 |
|---|---|---|
| 数据备份 | 已有入口与说明文案 | 当前阶段通过 |
| 关于 | 已有入口与说明文案 | 当前阶段通过 |

## 3. 当前残余风险

仍需明确但不构成当前代码阻塞的点：

1. `Redmi Note 11T Pro+` 上的真实前后台切换、隐私锁覆盖层、任务缩略图遮罩，还需要实机验收
2. Playwright 浏览器自动化此前受环境路径权限影响，没有补齐 H5 导航回归
3. APK 最终产出仍依赖 HBuilderX 打包链

这些属于：

- 实机 / 工具链验收风险

而不是当前仓库的代码未完成功能。

## 4. 验证结果

本轮沿用当前最新验证结果：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：26 个测试文件、64 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 5. 结论

按当前功能矩阵对照，代码层已经达到：

**功能验收可通过，可以切回 APK 打包链。**

## 6. 下一轮自然续做点

下一轮直接进入：

1. 使用 `D:\Develop\HBuilderX` 继续 APK 打包链
2. 产出 APK
3. 围绕 `Redmi Note 11T Pro+` 记录安装与启动验收结果
