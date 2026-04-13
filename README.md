# Eyot / 寄屿

寄屿是一款偏安静、纸感化的私人书写应用，围绕“写给未来的信、日记、随笔、信箱回看与个人照片墙”展开。当前仓库保存的是 Uni-App + Vue 3 的应用代码，以及 Android 打包产物对应的工程实现。

![寄屿应用预览](./screen.png)

## 项目概览

- 应用名称：`寄屿`
- 仓库名称：`Eyot`
- 当前版本：`v1.0.1`
- Android 包名：`com.qinghezy.jiyu`
- 技术栈：`Vue 3`、`Uni-App`、`Pinia`、`TypeScript`、`Vitest`

## 当前能力

- 致未来页面：支持未来信写作、日期选择、图片附件与纸张横线开关
- 日记与随笔：统一书写页结构、草稿持久化与图片内容记录
- 私人信箱与日历：按日期和类型回看内容，并提供条件滚动体验
- 个人主页：头像、头图、昵称、照片墙、外观设置与关于页
- 本地数据能力：包含 SQLite、本地附件、备份与恢复链路

## 目录结构

```text
src/
  app/                  应用启动与 store 装配
  data/                 SQLite / storage 仓储与数据映射
  domain/               编辑、日历、照片墙等核心规则
  features/             首页、编辑页、信箱、日历、个人主页等功能页面
  shared/               主题、i18n、通用组件与基础工具
tests/
  app/ data/ domain/    单元测试
  features/ release/    体验规则与回归测试
dist/release/apk/       Android 打包产物输出目录
```

## 本地开发

```bash
pnpm install
pnpm dev:h5
```

常用命令：

```bash
pnpm type-check
pnpm test:unit
pnpm build:h5
```

如果需要在 HBuilderX / uni-app App 端联调，请确保本地已经安装对应运行环境，并使用项目当前的 `src/manifest.json` 配置进行打包。

## Android APK

- 当前已打包 APK：`dist/release/apk/寄屿-v1.0.1-Android.apk`
- 对外发布时建议从 GitHub Releases 下载，避免直接从仓库历史中取包

## 说明

- 仓库内保留了项目运行所需源码、测试与资源文件
- 不包含 AI 工作流文档、临时计划文件和本地签名敏感文件
- `package.json` 中的内部工程名仍为 `noche`，应用展示名以 `寄屿` 为准
