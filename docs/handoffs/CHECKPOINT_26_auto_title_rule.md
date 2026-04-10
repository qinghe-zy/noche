# CHECKPOINT 26 - Auto Title Rule

主验收设备：`Redmi Note 11T Pro+`

## 1. 本轮概述

本轮继续补功能矩阵中的 P1 能力：自动标题。

当前目标不是让用户手填标题，而是在 formal save 时，如果标题为空，自动从正文首行取出一段可读标题，避免信箱与归档页继续出现大量空标题条目。

## 2. 本轮实际实现

### Domain

更新：

- `src/domain/services/entryService.ts`

新增：

- `deriveEntryTitle()`

当前规则：

1. 取正文中首个非空行
2. 截取前 13 个字
3. 若正文为空，则返回 `null`

并已接入：

- `createEntryFromDraft()`

这意味着：

- formal save 时，若用户没写标题，但正文存在
- entry 会带上自动标题，而不是 `null`

## 3. 本轮新增 / 更新测试

更新：

- `tests/domain/entryService.test.ts`

新增覆盖：

- 标题为空时，从正文首行生成自动标题

## 4. 本轮验证结果

已实际执行：

- `pnpm.cmd run test:unit`
  - 通过
  - 结果：25 个测试文件、61 个测试通过

- `pnpm.cmd run type-check`
  - 通过

- `pnpm.cmd run build:h5`
  - 通过

- `pnpm.cmd exec uni build -p app`
  - 通过
  - 产物：`dist/build/app`

## 5. 当前结论

当前信箱、归档和阅读链路在正式保存后，标题表现更接近可用版本：

- 用户可手填标题
- 用户不填标题时，也能获得自动标题

这一规则仍然被放在 domain，而不是页面里单独拼接，后续若需要改成 12 字、16 字或更复杂的截断策略，改动面仍然集中。

## 6. 下一轮自然续做点

下一轮建议继续：

1. 做一次“功能矩阵对照验收”，确认剩余真正没补完的能力
2. 若功能面足够，切回 APK 打包链与安装验证
