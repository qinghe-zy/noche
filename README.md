# noche / 寄屿

`noche` 是 `寄屿` 的源码仓库。它是一个基于 Uni-app CLI + Vue 3 + TypeScript + Pinia 的 Android-only、local-first 私人写信 / 日记应用。

## 当前状态

- 代码层主链已收口，可进入 APK 打包与 `Redmi Note 11T Pro+` 真机验收
- 当前优先保证离线可用、本地保存、本地恢复、本地图片附件与本地备份
- 剩余主要风险集中在设备层验证，不再是主链路未闭合

## 技术栈

- Uni-app CLI
- Vue 3
- TypeScript
- Pinia
- dayjs
- uuid
- SQLite + 本地文件能力

## 常用命令

```bash
pnpm install
pnpm dev:h5
pnpm type-check
pnpm test:unit
pnpm build:h5
pnpm exec uni build -p app
```

## 打包说明

- H5 构建输出：`dist/build/h5`
- app-plus 资源输出：`dist/build/app`
- Android APK 发行依赖 HBuilderX / `cli.exe` 完成最终打包

## 目录约定

- `docs/`：产品、交互、技术、协作与 checkpoint 文档
- `src/app`：应用装配与全局 store
- `src/domain`：核心领域类型与规则
- `src/data`：数据访问、仓储与映射
- `src/features`：业务页面与功能模块
- `src/shared`：通用常量、工具、基础 UI
- `tests/`：单元测试与 release 验收测试

## 当前边界

- 当前阶段保持 Android-only、local-first、离线可用
- 不接远程 API、不接登录系统、不接云同步
- `docs/stitch/**` 仅作为视觉参考，不作为运行时代码依赖
