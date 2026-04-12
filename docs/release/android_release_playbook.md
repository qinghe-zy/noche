# Android 正式发版手册

本文档只描述 `寄屿` 当前仓库的 Android 发版链路，不讨论功能开发。

## 1. 当前固定发布信息

- 应用名：`寄屿`
- Android 包名：`com.qinghezy.jiyu`
- AppID：`__UNI__F0BA90F`
- manifest 文件：
  - `src/manifest.json`
- release keystore：
  - `D:\Project\noche\.local\signing\jiyu-release.jks`
- alias：
  - `jiyu-release`

## 2. 发布前必须确认

1. `src/manifest.json` 已写入：
   - `name`
   - `appid`
   - `versionName`
   - `versionCode`
   - `app-plus.distribute.android.packagename`
   - Android 图标路径
   - 启动页配置
2. 当前打给用户的必须是全新安装包：
   - 不携带测试数据
   - 不携带本地数据库
   - 不携带备份目录
3. release 证书存在且可读：
   - `D:\Project\noche\.local\signing\jiyu-release.jks`
4. HBuilderX 登录态有效，并且能通过 `cli pack`

## 3. app-plus 资源构建

先生成 `app-plus` 资源：

```powershell
pnpm.cmd exec uni build -p app
```

成功后资源输出到：

```text
D:\Project\noche\dist\build\app
```

## 4. 正式 APK 打包命令

```powershell
& 'D:\Develop\HBuilderX\cli.exe' pack `
  --project 'D:\Project\noche' `
  --platform android `
  --safemode true `
  --android.packagename com.qinghezy.jiyu `
  --android.androidpacktype 0 `
  --android.certalias jiyu-release `
  --android.certfile 'D:\Project\noche\.local\signing\jiyu-release.jks' `
  --android.certpassword 'JiyuRelease2026!' `
  --android.storepassword 'JiyuRelease2026!'
```

说明：

- `androidpacktype 0` 表示使用自有证书
- 这条链路产出的是 release APK

## 5. 当前 APK 输出位置

当前已成功打出的 APK：

```text
D:\Project\noche\dist\release\apk\__UNI__F0BA90F__20260412135557.apk
```

后续同类打包默认输出目录：

```text
D:\Project\noche\dist\release\apk\
```

## 6. GitHub 发布步骤

1. 确认本地文档已更新：
   - `README.md`
   - `docs/release/`
   - 当前版本 release note
2. 提交并推送到 `main`
3. 在 GitHub 创建对应版本 tag，例如：
   - `v1.0.1`
4. 上传 APK 作为 release asset
5. 将 `docs/release/releases/v1.0.1.md` 内容作为 release 描述

## 7. 真机前的干净安装要求

1. 如果设备上已有旧包，先卸载
2. 清理应用数据与残留目录
3. 再安装本次新的 release APK
4. 首次启动时确认没有历史测试数据自动出现
