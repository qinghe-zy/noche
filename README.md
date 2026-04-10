# noche

`noche` 是一个基于 Uni-app CLI + Vue 3 + TypeScript + Pinia 的私人写信 / 日记 App 工程骨架。

## 当前状态

- 已完成最小可运行工程初始化
- 已补齐基础文档、路由占位页和底层代码骨架
- 当前不包含正式页面实现、完整数据库打通和 Android 工具链

## 技术栈

- Uni-app CLI
- Vue 3
- TypeScript
- Pinia
- dayjs
- uuid
- SQLite（结构预留，当前未打通）

## 常用命令

```bash
pnpm install
pnpm dev:h5
pnpm type-check
pnpm build:h5
```

## 目录约定

- `docs/`：产品、交互、技术、协作文档
- `src/app`：应用装配与全局 store
- `src/domain`：核心领域类型与规则
- `src/data`：数据访问、仓储与映射骨架
- `src/features`：页面占位与未来功能模块
- `src/shared`：通用常量、工具、基础 UI

## 当前边界

- 只提供可安装、可运行、可继续开发的最小工程
- 不包含正式业务逻辑与正式 UI
- 数据层仅保留可扩展接口和 Hook 预留
