# CHECKPOINT 23 - Privacy Lock Minimum Loop

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮概述

本轮继续围绕“功能验收完毕再打包”推进，优先补齐了此前明显缺失的 `隐私锁` 最小闭环。

实现目标不是一步做成复杂密码系统，而是先完成当前版本真正需要的最小能力：

1. Profile 有隐私锁入口
2. settings 可持久化隐私锁开关
3. App 从后台回到前台时，若已开启隐私锁，会先锁定界面
4. 解锁后保留原页面与原状态，不打断现有草稿恢复链

## 2. 本轮实际实现

### Settings

更新：

- `src/app/store/useSettingsStore.ts`

新增：

- `privacyLockEnabled: boolean`
- `setPrivacyLockEnabled(enabled: boolean)`

并已接入 prefs 持久化。

### App

更新：

- `src/app/store/useAppStore.ts`

新增：

- `isPrivacyLocked`
- `lockPrivacy()`
- `unlockPrivacy()`

### Root App

重写：

- `src/App.vue`

当前能力：

- App 前台展示时，如果已开启隐私锁，则覆盖显示锁定层
- App 退后台时，如果已开启隐私锁，则进入锁定态
- 解锁按钮点击后关闭覆盖层，恢复离开前页面

### Profile

更新：

- `src/features/profile/pages/ProfilePage.vue`

新增：

- 隐私锁开关 UI
- 关于 noche 行

## 3. 本轮新增测试

更新：

- `tests/app/settingsStore.test.ts`
  - 覆盖 `privacyLockEnabled` hydrate / persist

新增：

- `tests/app/appStore.test.ts`
  - 覆盖 `lockPrivacy()` / `unlockPrivacy()`

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：25 个测试文件、58 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 5. 当前状态结论

当前版本已经具备最小隐私锁链路，且这条链路没有破坏既有：

- 编辑
- 保存
- 阅读
- 续写
- 销毁
- 草稿恢复

同时，本轮继续遵守了“规则先于页面”的扩展性原则：

- 开关状态在 `settings store`
- 锁定状态在 `app store`
- 页面只承接 UI

## 6. 下一轮自然续做点

下一轮建议继续：

1. 补 `jotting` 活跃草稿冲突处理（继续上次 / 另起一张 / 取消）
2. 继续收口 future 日期选择体验
3. 若功能验收通过，再回到 APK 打包链
