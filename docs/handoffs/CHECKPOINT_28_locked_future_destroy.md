# CHECKPOINT 28 - Locked Future Destroy

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮概述

本轮继续补一个此前还不完整的 P0 行为：

**未解锁 future 也应该可以销毁。**

此前 `Mailbox` 中点未解锁 future 只会弹出只读提示，用户无法直接销毁。现在这条缺口已经补齐。

## 2. 本轮实际实现

更新：

- `src/features/mailbox/pages/MailboxPage.vue`

当前 sealed future 行为：

1. 点击卡片
2. 弹出提示：
   - 知道了
   - 销毁
3. 若用户选择销毁：
   - 走 `useEntryStore().destroyEntry()`
   - 刷新 `Mailbox`
   - toast 提示“已销毁”

## 3. 验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：26 个测试文件、64 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 4. 当前结论

当前 `future` 的关键行为已经更完整：

- 未解锁时不能看全文
- 未解锁时仍可销毁
- 已解锁后可进入阅读态

这条链现在与功能矩阵更一致。

## 5. 下一轮自然续做点

下一轮直接建议进入：

1. 功能矩阵对照验收
2. 若对照后无 P0/P1 真缺口，再切回 APK 打包链
