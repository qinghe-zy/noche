# DeepSeek 首页动态卡片接入 Handoff

日期：2026-04-19
当前代码保存点：`15b506d` (`Save progress on remote home card integration`)

## 目标

给首页小卡片接入 DeepSeek 自动生成能力，同时满足这些要求：

- 联网即可用，优先走 DeepSeek 远程生成
- 远程失败、超时、返回脏数据时，自动回退到现有本地 300 张卡片池
- 尽量不要让用户等待，首次点开首页就应该已经预取或至少本地卡先显示
- 远程卡也要能继续走现有收藏链路，支持加入卡片展柜
- 生成文案必须符合现有产品风格，不要出现“第几张卡”“提醒你”之类前缀
- 生成内容要结合用户最近选择的天气、心情等上下文动态适配
- 生成结果必须做严格清洗和结构校验，不能把异常内容直接展示给用户

## 已完成

已新增一个独立的远程卡片模块：

- [src/features/home/homeWelcomeCardRemote.ts](/D:/Project/noche/src/features/home/homeWelcomeCardRemote.ts)

这个模块目前已经具备：

- DeepSeek 基础配置读取
- 远程卡片缓存 key 设计
- 远程卡片缓存读写
- 按日期和语言缓存单张远程卡
- 请求去重，避免同一日期重复并发请求
- DeepSeek Chat Completion 请求骨架
- JSON 响应解析为运行时卡片对象
- 远程请求失败时返回 `null`，为本地卡池回退留好了接口

## 当前设计决策

采用方案 A：在线优先、本地兜底。

具体策略：

- 首页启动或进入首页时，后台预取当天远程卡
- 如果远程卡尚未返回，先显示本地卡，不阻塞用户
- 如果远程卡在合适时机返回，并且用户还没展开/收藏当前卡，可以平滑替换
- 如果远程请求失败、超时或内容不合法，继续使用本地卡
- 远程卡收藏进展柜时，应该保存内容快照，避免后续远程缓存失效导致展柜内容丢失

## 产品约束

DeepSeek 生成内容必须符合以下要求：

- 只返回卡片正文
- 不带编号、前缀、标签、引号、Markdown
- 不出现“第几张卡”“卡片提醒你”“AI”“模型”等元信息
- 风格要安静、纸感、本地优先、适合私人书写
- 长度保持短文案感
  - 中文建议 18-40 字
  - 英文建议 8-24 词

## 需要补入的动态上下文

下一步接入 DeepSeek 时，提示词里要带上这些信息：

- `dateKey`
- `locale`
- 当前时间 `nowIso`
- 最近一次/最近若干次用户选择过的日记前序信息：
  - `weatherCode`
  - `moodCode`
- 如果拿不到最近上下文，也允许退化为普通当日卡

建议做法：

- 从已有本地数据中读取最近若干条 diary 的 `diaryPrelude`
- 做一个轻量聚合，例如：
  - 最近最常见天气
  - 最近最常见心情
  - 最近一次出现的天气/心情
- 把这些聚合结果放入 DeepSeek prompt，而不是整包原始历史

## 数据清洗要求

远程返回后不要直接展示，至少做这些校验：

- 必须是合法 JSON
- 只能有 `type` 和 `content` 这两个核心字段
- `type` 只能是：
  - `today_quote`
  - `mood_response`
  - `weather_season`
  - `playful_draw`
  - `action_prompt`
- `content` 必须是非空字符串
- 去掉首尾空白
- 拒绝以下内容：
  - 含 Markdown 标记
  - 含编号前缀
  - 含“第…张卡”“提醒你”“AI”“模型”等明显不合规文案
- 如果清洗后不合格，直接判定本次远程卡失败，回退本地卡池

## 缓存与展柜兼容

建议把远程卡的运行时结构扩成：

- `id`
- `dateKey`
- `locale`
- `content`
- `type`
- `generatedAt`
- `source: "remote"`

展柜收藏记录建议后续补这些可选字段：

- `source`
- `contentSnapshot`
- `generatedAt`

原因：

- 远程卡不能只靠 `cardId` 再反查 catalog
- 展柜必须能稳定显示收藏当时的正文

## 启动与预取策略

建议分两层：

1. `bootstrapAppRuntime` 或首页进入时预取当天远程卡
2. 首页自身再做一次兜底预取，避免启动阶段错过

原则：

- 预取不阻塞 App Ready
- 首页首屏优先可用，本地卡即时显示
- 远程卡超时建议控制在 2-4 秒决策窗口内
- 模块里现在默认超时常量是 `3500ms`

## 不要做的事

- 不要把用户提供的 DeepSeek API Key 写进仓库
- 不要把明文 key 写进这份 handoff
- 不要为了接入 DeepSeek 改坏现有 300 张本地卡逻辑
- 不要把网络失败暴露成首页错误提示
- 不要让首页因为等远程卡而白屏或无卡可看

## 本地配置建议

用户已经在对话里提供了 DeepSeek API Key，但出于安全原因没有写入文档。

继续实现时，建议本地通过 `.env.local` 配置：

```env
VITE_DEEPSEEK_API_KEY=...
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
VITE_DEEPSEEK_MODEL=deepseek-chat
```

仓库 `.gitignore` 已经忽略 `.env.local`。

## 官方文档参考

- DeepSeek 基础说明：[https://api-docs.deepseek.com/](https://api-docs.deepseek.com/)
- Chat Completions：[https://api-docs.deepseek.com/api/create-chat-completion/](https://api-docs.deepseek.com/api/create-chat-completion/)
- Rate Limit：[https://api-docs.deepseek.com/quick_start/rate_limit/](https://api-docs.deepseek.com/quick_start/rate_limit/)

## 下一步建议

下一轮对话建议按这个顺序继续：

1. 给 `homeWelcomeCardRemote.ts` 补测试
   - 远程成功
   - 远程失败回退
   - 返回脏 JSON 拒绝
   - 请求去重
2. 新增“最近天气/心情聚合”辅助函数
3. 把聚合结果接入 DeepSeek prompt
4. 在首页把 `activeWelcomeCard` 改成“远程优先、本地兜底”的解析逻辑
5. 收藏远程卡时把内容快照写入展柜记录
6. 给展柜页补远程卡展示兼容测试

## 当前状态总结

这轮还没有把 DeepSeek 真的接到首页展示层，只是先完成了远程卡片模块草稿，并把方向定清楚了。  
后续从 `15b506d` 这个提交点继续往下做最清楚。
