# noche 数据模型最终版

## 1. 建模目标
这份数据模型服务于第一版本地优先实现，重点解决：
- 日记按天唯一且可追加
- 随笔一天可无限多条
- 未来信按日期封存与解锁
- 草稿按类型隔离，日记按日期分槽
- 信箱排序稳定，不受 updatedAt 干扰

## 2. 内容模型总览
第一版核心对象：
- Entry：正式内容
- Draft：草稿
- Settings：设置

## 3. Entry 模型
### 3.1 EntryType
```ts
export type EntryType = 'diary' | 'jotting' | 'future'
```

### 3.2 Entry 状态
```ts
export type EntryStatus = 'saved' | 'sealed' | 'unlocked'
```

说明：
- diary：日记
- jotting：随笔
- future：未来信
- saved：普通内容已保存
- sealed：未来信已封存未解锁
- unlocked：未来信已到期可读

### 3.3 Entry 字段
```ts
interface Entry {
  id: string
  type: EntryType
  status: EntryStatus
  title: string | null
  content: string
  recordDate: string
  unlockDate: string | null
  createdAt: string
  updatedAt: string
  savedAt: string | null
  unlockedAt: string | null
  destroyedAt: string | null
}
```

字段说明：
- id：UUID
- title：自动生成标题，可为空
- content：正文
- recordDate：内容所属日期，格式 YYYY-MM-DD
- unlockDate：未来信解锁日期，仅 future 使用
- createdAt：纸张第一次被打开的时间
- updatedAt：最后编辑时间
- savedAt：正式点信封保存时间
- unlockedAt：未来信真正可读时的记录时间，可为空
- destroyedAt：第一版物理删除后通常不保留；若保留审计可用，默认可不落库

## 4. Draft 模型
### 4.1 DraftType
```ts
export type DraftType = 'diary' | 'jotting' | 'future'
```

### 4.2 Draft 字段
```ts
interface Draft {
  slotKey: string
  type: DraftType
  recordDate: string
  content: string
  cursorPosition: number | null
  unlockDate: string | null
  createdAt: string
  updatedAt: string
}
```

字段说明：
- slotKey：草稿槽唯一键
- type：草稿类型
- recordDate：该草稿所属日期
- content：草稿正文
- cursorPosition：光标位置，可为空
- unlockDate：未来信草稿的目标解锁日期，可为空
- createdAt：草稿首次创建时间
- updatedAt：草稿最后修改时间

## 5. 草稿槽策略
### 5.1 日记草稿
日记草稿必须按日期分槽。

槽位格式：
```ts
slotKey = `draft_diary_${recordDate}`
```

例如：
- draft_diary_2026-04-10
- draft_diary_2026-04-01

### 5.2 随笔草稿
第一版只保留一个“活跃随笔草稿槽”：
```ts
slotKey = 'draft_jotting'
```

说明：
- 已保存随笔不限数量
- 但同一时刻只保留一个未封存随笔草稿

### 5.3 未来信草稿
第一版只保留一个“活跃未来信草稿槽”：
```ts
slotKey = 'draft_future'
```

## 6. Settings 模型
```ts
interface Settings {
  theme: 'default'
  fontScale: 'sm' | 'md' | 'lg'
  privacyLockEnabled: boolean
  biometricEnabled: boolean
}
```

说明：
- 设置放 StorageSync，不放 SQLite 也可以
- 如果后续想统一读写，也可建 prefs 表

## 7. SQLite 表设计
### 7.1 entries
```sql
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  record_date TEXT NOT NULL,
  unlock_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  saved_at TEXT,
  unlocked_at TEXT
);
```

### 7.2 drafts
```sql
CREATE TABLE IF NOT EXISTS drafts (
  slot_key TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  record_date TEXT NOT NULL,
  content TEXT NOT NULL,
  cursor_position INTEGER,
  unlock_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 7.3 prefs（可选）
若设置统一入 SQLite：
```sql
CREATE TABLE IF NOT EXISTS prefs (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
```

## 8. 索引设计
```sql
CREATE INDEX IF NOT EXISTS idx_entries_record_date ON entries(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_unlock_date ON entries(unlock_date);
```

说明：
- 信箱排序按 recordDate
- 待启之信/已解锁未来信需要 unlockDate

## 9. 标题策略
第一版不强制用户填标题。
正式保存时自动生成标题：
- 取正文第一行前 12 到 16 个字
- 去掉首尾空白
- 若不足则取正文前若干字符
- 若正文为空，不生成记录

## 10. 排序规则
### 10.1 往日信件列表
固定按：
1. recordDate 倒序
2. 同一天内按 createdAt 倒序

绝不按 updatedAt 排序。

### 10.2 待启之信列表
按 unlockDate 升序或倒序都可，但第一版建议：
- 越快开启的越靠前（unlockDate 升序）

### 10.3 已解锁未来信
进入“往日信件”列表时，仍按 recordDate 或 unlockDate 需要二选一。
第一版保持简单：
- 已解锁未来信归入往日信件时，按 recordDate 排

## 11. 保存规则
### 11.1 空白内容
点击信封时，如果 `content.trim()` 为空：
- 不生成正式记录
- 不触发正式封存动画
- 未保存草稿直接静默丢弃
- 已保存旧内容被编辑成空白时，进入“销毁确认”流程

### 11.2 日记
- 每个自然日最多一篇正式日记
- 再次写该日记时属于追加/续写，不生成第二篇 diary

### 11.3 随笔
- 一天可保存无限多条
- 每条单独一条 Entry

### 11.4 未来信
- 未选日期时不能正式封存
- unlockDate 最小可选日期为明天
- 目标日期本地 00:00 解锁

## 12. 删除规则
删除统一走：
```ts
async function destroyEntry(id: string): Promise<void>
```

流程：
1. 读 entry
2. 清理关联资源（第一版为空 Hook）
3. 删 entry
4. 刷新信箱
5. 刷新日历标记

不做回收站。

## 13. 日历标记规则
小圆点代表：
- 该日期存在日记或随笔内容

第一版不让未来信参与日历打点。

## 14. Repository 建议接口
### 14.1 entryRepo
```ts
findById(id: string)
findDiaryByDate(recordDate: string)
findEntriesByDate(recordDate: string)
listPastEntries()
listPendingFutureLetters()
insertEntry(entry: Entry)
updateEntry(entry: Entry)
destroyEntry(id: string)
refreshFutureLetterStatus(today: string)
```

### 14.2 draftRepo
```ts
getDraft(slotKey: string)
upsertDraft(draft: Draft)
deleteDraft(slotKey: string)
listDiaryDraftsByDate?(recordDate: string)
```

### 14.3 prefsRepo
```ts
getSetting(key: string)
setSetting(key: string, value: unknown)
```

## 15. Deferred / 暂不落库
以下未在第一版数据模型中写死：
- 附件资源表
- 云同步元数据
- 回收站
- 复杂统计缓存
