# HANDOFF: Codex SQLite Repo Readiness

## 本轮目标

- 把 SQLite 相关 repository 从 TODO 占位推进到可落地边界
- 不改前端页面签名
- 不把真实 SQLite client 细节扩散到页面或 store

## 已完成

- `drafts` schema 对齐 future draft 的 `unlockDate`
- `draftRepo` 实现真实 upsert / list / delete SQL
- `entryRepo` 实现真实 query / upsert / logical destroy SQL
- `prefsRepo` 实现 preference upsert SQL
- 新增：
  - `createSQLiteDraftRepository(client)`
  - `createSQLiteEntryRepository(client)`
- 新增 fake SQLite client 单测，确保 repo / adapter 行为可回归

## 当前可依赖的数据层接口

### Draft

```ts
createSQLiteDraftRepository(client): IDraftRepository
```

支持：

- `save(draft)`
- `getBySlotKey(slotKey)`
- `getAll()`
- `deleteBySlotKey(slotKey)`

### Entry

```ts
createSQLiteEntryRepository(client): IEntryRepository
```

支持：

- `save(entry)`
- `getById(id)`
- `getByDate(recordDate)`
- `getAllActive()`
- `getByType(type)`
- `deleteById(id, options?)`
- `getCalendarMarkedDates()`

### Prefs

```ts
createPrefsRepo(client): PrefsRepo
```

支持：

- `get(key)`
- `set({ key, value })`

## 仍然不要假设的事情

- 真实 SQLite runtime 还没接上
- store 还不会自动切到 SQLite adapter
- `useSettingsStore` 还没有 hydrate / persist
- 这轮没有改 Mailbox / Calendar 的前端可消费契约

## 给前端 / Gemini 的结论

这轮没有新增页面层必须消费的新接口，也没有打碎上一轮的 `Mailbox` / `Calendar` facade。前端可以继续按上一轮 handoff 开发；SQLite 的变化目前完全停留在 data 层，不需要页面参与。

## 给后续 Codex 的建议

下一轮最自然的承接点是：

1. 做 repository provider / boot 装配
2. 让 `useSettingsStore` 接 prefs persistence
3. 再考虑 editor 的 resume/save facade 收口
