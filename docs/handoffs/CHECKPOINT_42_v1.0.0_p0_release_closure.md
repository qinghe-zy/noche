# CHECKPOINT 42: v1.0.0 P0 Release Closure

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮目标

围绕真机已复现的 P0 问题做最小闭环修复，并把当前版本收口为正式发布的 `v1.0.0`：

1. 修复深色模式在真机上不生效的问题
2. 修复图片添加后阅读态与重进查看不可见的问题
3. 修复 Profile 相册不显示图片的问题
4. 修复本地备份导出失败的问题
5. 将首页右上角改为清晰可点的 `个人主页`
6. 优化 Diary / Jotting / Future 的键盘稳定性与写作手感

## 2. 本轮关键根因

### 深色模式

- `settingsStore.theme` 本身可切换
- 主题变量也能下发到根节点
- 真正导致真机仍像浅色页的主因是：大量页面与共享弹层仍写死浅色值，没有真正吃统一主题变量
- `system` 模式在原实现里也没有优先读取 `uni.getSystemInfoSync().theme`

### 图片阅读态 / 相册

- 图片添加链路可以写入 attachment
- 真正断点在 `saveActiveDraftAsEntry()`
- 正式保存后调用草稿删除逻辑时，把草稿附件对应的本地文件也一起删掉了
- 结果是：entry 里还有 attachment 记录，但本地文件已不存在，所以阅读态和相册都只能拿到空路径资源

### 本地备份导出

- 备份文件写入路径前缀不一致，资源没有稳定落到 `noche-backups/<backupId>/...`
- 导出过程手动关闭 SQLite 后，客户端没有正确检测数据库已关闭并重新打开
- 后续页面查询会出现真机里的 `Not Open...` 错误

## 3. 代码修复结果

### 主题

- `src/shared/theme.ts`
  - `system` 主题优先读取 `uni.getSystemInfoSync().theme`
- `src/App.vue`
  - 补齐深色模式语义变量
  - 监听 `onThemeChange`
- 已把 Home / Prelude / Future / Mailbox / Calendar / Profile / Album / Dialog / Sheet 等主视觉面切到语义变量

### 图片与相册

- `src/app/store/useDraftStore.ts`
  - formal save 时删除 draft 记录但不再误删已转正附件文件
- `src/features/editor/components/DiaryPreludeGlyph.vue`
  - Prelude 图标切到本地 `static` SVG
- `static/prelude-glyphs/*`
  - 天气 / 心情图标本地资源入仓

### 备份导出

- `src/features/profile/localBackup.ts`
  - 统一备份目标路径
  - 修正 manifest / db / prefs / draft-shadow / asset 的读写位置
- `src/data/db/sqlite.ts`
  - 数据库已被外部关闭时，允许重新打开

### 主页入口与写作手感

- `src/features/home/pages/HomePage.vue`
  - 右上角入口改为 `个人主页`
- `src/features/editor/components/DiaryEditorShell.vue`
- `src/features/editor/components/JottingEditorShell.vue`
- `src/features/editor/components/FutureLetterEditorShell.vue`
  - 调整正文行距、首行落点与信纸横线节距

## 4. 验证结果

已通过：

- `pnpm type-check`
- `pnpm test:unit`
- `pnpm build:h5`

当前代码侧状态：

- 单测：`192` 项通过
- H5 构建：通过

## 5. 当前版本信息

- 版本号：`1.0.0`
- versionCode：`100`
- 包名：`com.qinghezy.jiyu`

## 6. 下一步执行顺序

1. 基于当前代码生成新的 Android release APK
2. 在 `Redmi Note 11T Pro+` 真机上验收主题、图片、相册、备份、编辑器键盘与写作手感
3. 本地 commit
4. 推送 GitHub
5. 创建 `v1.0.0` Release 并上传 APK
