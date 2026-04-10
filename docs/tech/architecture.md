# noche 架构说明

## 1. 架构目标

`noche` 当前采用“可持续扩展的分层结构”，优先保证：

- 工程可运行
- 模块职责清晰
- 后续接入 SQLite 与业务实现时改动面可控

## 2. 产品与平台范围

- 当前阶段只做 Android 单端
- 本地优先（Local-first），后续再评估云同步与多端

## 3. 技术栈

- Uni-app CLI
- Vue 3
- TypeScript
- Pinia
- SQLite（当前仅预留数据层接口）

## 4. 分层结构

### 3.1 `app`

负责应用装配、全局 store 和基础运行状态，不承载具体业务页面实现。

### 3.2 `domain`

负责核心领域类型、规则和服务，包括：

- Entry
- Draft
- 时间相关规则
- 条目与草稿服务

### 3.3 `data`

负责数据库连接抽象、schema、repository 与 mapper。

当前阶段仅提供可扩展骨架，不要求数据库真正打通。

### 3.4 `features`

按功能组织页面与 feature 内逻辑。

- home
- editor
- mailbox
- calendar
- profile

### 3.5 `shared`

放置跨模块共用的：

- 常量
- 通用类型
- 日期工具
- ID 工具
- 基础占位 UI

## 5. 依赖方向

推荐依赖方向：

`features -> domain -> data`

补充约束：

- `shared` 可被所有层复用
- `app` 负责组装，不反向承载业务规则
- `domain` 不依赖页面实现

## 6. 协作与实现边界

- Codex 负责工程、底层、数据与配置
- Gemini 负责页面与 UI 组件
- Antigravity 负责任务编排与验收
- 同一时间同一目录只允许一个 AI 写入

## 7. 当前边界

当前阶段只做：

- 根配置与运行入口
- 路由占位
- store / domain / data / shared / feature 最小骨架

当前不做：

- 正式页面实现
- 复杂状态流
- SQLite 实际连通
- Android 工具链接入
