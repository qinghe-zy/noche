# CHECKPOINT 24 - Jotting Conflict Flow

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮概述

本轮继续补功能矩阵中仍未完整的 `jotting` 活跃草稿冲突处理。

当前目标是让“随手记一笔”不再每次都直接进入 jotting editor，而是先判断是否已有未封存的活跃随笔草稿，再给用户明确选择。

## 2. 本轮实际实现

### Draft Store

更新：

- `src/app/store/useDraftStore.ts`

新增：

- `peekDraft()`

作用：

- 在不激活当前草稿、不强行切换 editor 的前提下，先探测某个槽位是否已有 draft

这让页面层可以先判断冲突，再决定是否继续进入编辑。

### Home

更新：

- `src/features/home/pages/HomePage.vue`

当前 `jotting` 入口行为：

1. 若没有有效活跃 jotting 草稿
   - 直接进入 jotting editor
2. 若已有有效活跃 jotting 草稿
   - 弹出三选：
     - 继续上次
     - 另起一张
     - 取消
3. 若选择“另起一张”
   - 若原 jotting 草稿已有内容，先正式收好
   - 若原 jotting 草稿为空，再安静收起
   - 然后再进入 editor

## 3. 本轮新增 / 更新测试

更新：

- `tests/app/draftStore.test.ts`

新增覆盖：

- `peekDraft()` 可探测现有 jotting draft，且不会激活当前草稿

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：25 个测试文件、59 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 5. 当前结论

`jotting` 当前已经不再缺最关键的冲突处理链路：

- 继续上次
- 另起一张
- 取消

并且“另起一张”的语义已经升级为：

- 不再粗暴丢掉原草稿
- 有内容时先自动收好原随笔
- 只有空白草稿才直接收起

并且这条逻辑仍然遵守了当前项目的扩展性原则：

- draft 探测在 store
- 草稿有效性判断复用 domain
- 页面只处理交互弹层与跳转

## 6. 下一轮自然续做点

下一轮建议继续：

1. 补 future 日期选择体验，尽量贴近“未选日期时再触发选择”
2. 继续收口 Profile 的“备份 / 关于 / 隐私锁”文案与状态细节
3. 若功能验收范围满足，再重新回到 APK 打包链
