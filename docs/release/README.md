# Release 文档

本目录用于沉淀 `寄屿` 的发版资料，目标是让后续版本更新可以沿用同一套稳定流程，而不是每次重新摸索。

## 目录说明

- [android_release_playbook.md](./android_release_playbook.md)
  - Android 正式发版执行手册
  - 覆盖 manifest、签名、构建、GitHub 发布、真机前置要求
- [version_update_checklist.md](./version_update_checklist.md)
  - 每次版本更新都要过一遍的固定检查单
  - 用于避免漏改版本号、漏传 APK、漏更新 release note
- [releases/v1.0.0.md](./releases/v1.0.0.md)
  - 当前版本 `1.0.0` 的本地 release note
  - 可直接复用为 GitHub Release 描述

## 当前已确认的正式发布基线

- 应用名：`寄屿`
- Android 包名：`com.qinghezy.jiyu`
- AppID：`__UNI__F0BA90F`
- 当前版本：`1.0.0`
- 当前 versionCode：`100`
- 当前 release APK：
  - `D:\Project\noche\dist\release\apk\__UNI__F0BA90F__20260412135557.apk`

## 使用建议

1. 每次发版前先看 `version_update_checklist.md`
2. 真正执行打包时按 `android_release_playbook.md`
3. 准备发布说明时从 `releases/` 目录复制当前版本模板
