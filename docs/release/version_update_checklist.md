# 版本更新检查单

每次版本更新都按这个顺序过一遍，避免漏项。

## 1. 版本信息

- `src/manifest.json`
  - `versionName`
  - `versionCode`
- 如版本有变化，同步更新：
  - `docs/release/releases/` 下当前版本说明
  - `README.md` 中的下载与版本描述

## 2. 发布资产

- 重新执行：
  - `pnpm.cmd exec uni build -p app`
  - `HBuilderX cli pack ...`
- 确认 release APK 成功落盘
- 记录 APK 文件名和完整路径

## 3. 数据与发布洁净度

- 确认默认启动不会注入 demo 数据
- 确认安装包不带 `.db / .sqlite / 备份文件 / 调试产物`
- 确认交付包是本次新生成的 release APK

## 4. GitHub 侧动作

- 提交本地文档与 README 改动
- 推送到 `main`
- 创建或更新当前版本的 GitHub Release
- 上传 APK 资产
- release 标题、tag、说明与版本号一致

## 5. 用户可见信息

- README 已面向用户更新
- release note 已说明：
  - 版本号
  - 主要能力
  - 安装说明
  - 已知限制
