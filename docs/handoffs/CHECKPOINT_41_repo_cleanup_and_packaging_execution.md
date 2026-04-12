# CHECKPOINT 41: Repo Cleanup And Packaging Execution

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮目标

本轮不再继续泛改功能，直接进入发布执行阶段：

1. 清理 GitHub 主仓库，只保留源码 / 必要配置 / 必要文档
2. 明确 Android 正式打包参数
3. 实际执行 APK 打包
4. 给出真机必验清单与剩余设备层风险

## 2. 仓库清理结果

### 已保留到远程仓库

- `src/`
- `public/`
- `tests/`
- 工程配置文件：`.gitignore`、`package.json`、`pnpm-lock.yaml`、`tsconfig.json`、`vite.config.ts`、`vitest.config.mts`
- 运行配置：`src/manifest.json`、`src/pages.json`
- 必要文档：`README.md`、`AGENTS.md`、`docs/README.md`、`docs/spec/**`、`docs/tech/**`、`docs/tasks/**`、`docs/handoffs/**`
- 视觉真相参考：已纳管的 `docs/stitch/**` 子目录
- 正式图标资源：根目录 `screen.png`

### 已从远程仓库移除但本地保留

- `findings.md`
- `progress.md`
- `task_plan.md`

### 已加入忽略规则的本地文件/目录

- `artifacts/`
- `.local/`
- `_doc/`
- `_documents/`
- `*.db`
- `*.sqlite`
- `*.sqlite3`
- `*.bak`
- `*.tmp`
- `*.apk`
- `*.aab`
- `codex_next_prompt_noche.md`
- `gemini_next_prompt_noche.md`
- `docs/stitch/DESIGN.md`
- `docs/stitch/code.html`
- `docs/stitch/screen.png`
- `docs/stitch/profile/`

### 本轮仓库清理提交

- commit: `0ddb5d7`
- message: `chore: clean repository for release`

### 当前远端主分支

- remote: `https://github.com/qinghe-zy/noche.git`
- branch: `main`
- pushed commit: `00a81de`

说明：

- `00a81de` 是在清理提交 `0ddb5d7` 基础上，补齐了与远端 `origin/main` 的 merge 关系后推上的最新主分支提交。

## 3. 正式打包参数现状

### 已补齐

- 应用名：`寄屿`
- manifest 路径：`src/manifest.json`
- Android 包名：`com.qinghezy.jiyu`
- 版本号：`1.0.0`
- versionCode：`100`
- release keystore（本地，仅用于打包，不入仓）：
  - 路径：`D:\Project\noche\.local\signing\jiyu-release.jks`
  - alias：`jiyu-release`

### 当前仍存在的正式打包阻塞

1. `HBuilderX cli publish app-android --type appResource` 提示：
   - `appid 不存在，请在 manifest.json 中重新获取`
2. `HBuilderX cli pack` 已能触发云端打包，但被账号区域限制拒绝：
   - `发行功能“国际区”账号暂不支持中国大陆用户使用，请使用“中国大陆地区”账号登录。`
3. `adb devices -l` 当前无设备条目：
   - `Redmi Note 11T Pro+` 还未连接到本机

## 4. 实际执行的打包命令与结果

### 新增发布硬约束

- 交付给用户的必须是**全新安装包**
- 安装包内不得残留任何测试数据、示例记录、本地数据库、备份目录或调试期素材

### 已核到的“无测试数据残留”证据

1. 默认运行时不注入 demo 数据
   - 当前代码只有显式传入 `bootstrapAppRuntime({ demoEntries })` 时才允许注入
   - 默认启动路径不会自动写入示例记录
2. 当前 `dist/build/app` 资源中未发现随包分发的本地数据文件
   - 未发现 `.db / .sqlite / .sqlite3 / .zip`
   - 当前资源中的二进制文件仅包含：
     - `manifest.json`
     - `__uniapperror.png`
     - `__uniappsuccess.png`

### 已成功执行

```powershell
pnpm.cmd exec uni build -p app
```

结果：

- 成功
- 输出目录：`dist/build/app`
- 这是 `app-plus` 本地打包资源，不是最终可安装 APK

### 已实际尝试但未成功生成 APK

```powershell
& 'D:\Develop\HBuilderX\cli.exe' pack `
  --project 'D:\Project\noche' `
  --platform android `
  --safemode true `
  --android.packagename com.qinghezy.jiyu `
  --android.androidpacktype 0 `
  --android.certalias jiyu-release `
  --android.certfile 'D:\Project\noche\.local\signing\jiyu-release.jks' `
  --android.certpassword '***' `
  --android.storepassword '***'
```

结果：

- 编译成功
- 资源压缩成功
- 云端打包请求已发出
- 最终被账号区域限制拦截，未产出 APK

## 5. 当前结论

### 代码与仓库层

- 已无 P0 级代码阻塞
- 远程主仓库已完成一次发布向清理
- 主分支可继续作为打包基线

### 打包层

- `app-plus` 资源已可稳定生成
- 正式包名 / 应用名 / 本地签名证书已准备
- 但**最终 APK 仍未产出**

### 当前最准确的阻塞归类

剩余问题属于环境与设备层，而不是主链代码未闭合：

1. DCloud `appid` 需要在 HBuilderX 中重新获取或绑定有效应用
2. 需要中国大陆地区可用的 HBuilderX 发行账号
3. 需要连接 `Redmi Note 11T Pro+` 完成安装与真机验收

## 6. 推荐下一步

1. 在 HBuilderX 中为当前项目重新获取有效 `appid`
2. 切换到可用的中国大陆地区发行账号
3. 重新执行 `cli pack`
4. 将生成的 APK 安装到 `Redmi Note 11T Pro+`
5. 按真机必验清单完成设备侧验收

### 安装前额外要求

在真机安装 release 包前，先执行一次“干净安装”：

1. 若设备上已有旧包，先卸载
2. 清理应用残留目录与系统缓存
3. 再安装这次新生成的 APK
4. 首次启动时确认没有任何历史测试记录自动出现
