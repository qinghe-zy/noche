# noche Codex / Gemini 分离开发协作文档（正式版）

版本：v1  
状态：可直接落库  
适用阶段：Android-only / Local-first / 第一版 MVP  

---

## 1. 文档目的

本文档用于把 `noche` 项目的 AI 协作方式改为**严格分离开发**：

- **Gemini** 只负责界面设计、页面实现、交互呈现、前端视觉层与页面级组件。
- **Codex** 负责除前端界面实现之外的所有内容，包括工程、文档、领域规则、数据层、仓库层、状态层、路由接线、验证、构建与交付。

本文件同时承担以下三类作用：

1. **协作文档**：明确谁能改什么，谁不能改什么。
2. **功能清单**：把第一版功能拆到模块与页面，避免漏项。
3. **接口文档**：给 Gemini 一套稳定的页面调用契约，确保可以脱离底层实现并行开发。

目标不是“分工大概不冲突”，而是让两边**可以同时推进且互不踩脚**。

---

## 2. 当前结论

### 2.1 已确认的协作原则

从本版本开始，项目不再采用“一个 AI 调另一个 AI”的模式。

改为：

- **Codex** = 总控 / 工程 / 文档 / 业务规则 / 数据 / 状态 / 集成
- **Gemini** = 界面设计 / 页面实现 / 页面交互 / UI 组件 / 样式 / 视觉收口

### 2.2 当前核心约束

1. 同一时间同一路径只允许一个 AI 写入。
2. Gemini 不得直接改动底层规则、存储、仓库、store 骨架、工程配置。
3. Codex 不直接承担正式页面设计与页面视觉实现。
4. 所有跨边界变更必须先改接口文档，再改代码。
5. 任何页面都不能直接访问 SQLite。
6. 任何业务规则都不能直接写死在页面里。

---

## 3. 项目范围

### 3.1 第一版产品目标

`noche` 是一个“写给自己”的私人记录 App。

当前核心能力：

1. 写日记
2. 写随笔
3. 写未来信
4. 查看信箱
5. 按日历跳转记录
6. 个人设置与隐私锁

### 3.2 当前明确不做

1. 不做复杂富文本编辑器
2. 不做多人协作
3. 不做社交分享
4. 不做复杂云同步
5. 不做复杂提醒系统
6. 不做附件正式功能
7. 不做回收站

---

## 4. 技术边界与基础事实

### 4.1 技术栈

- Uni-app CLI
- Vue 3
- TypeScript
- Pinia
- dayjs
- uuid
- SQLite（正式内容）
- `uni.setStorageSync`（轻量设置）

### 4.2 当前目录结构

```text
src/
  app/
    store/
    providers/
  domain/
    entry/
    draft/
    time/
    services/
  data/
    db/
    repositories/
    mappers/
  features/
    home/
    editor/
      pages/
      components/
      composables/
    mailbox/
    calendar/
    profile/
  shared/
    ui/
    utils/
    constants/
    types/
    assets/
```

### 4.3 页面清单

第一版正式页面：

1. Home
2. Editor
3. Mailbox
4. Calendar
5. Profile

辅助页面：

6. Day Archive List（某日多条内容时进入）
7. Privacy Lock（若后续单独页面化）

---

## 5. 角色分工总表

## 5.1 Codex 负责的内容

### A. 文档与协作
- `docs/spec/**`
- `docs/tech/**`
- `docs/tasks/**`
- `docs/handoffs/**`
- README、任务卡、checkpoint、handoff、接口变更记录

### B. 工程与基础设施
- `package.json`
- `pnpm-lock.yaml`
- `vite.config.ts`
- `tsconfig.json`
- `.gitignore`
- `.env.example`
- 工程脚本与构建验证

### C. App 组装与状态层
- `src/main.ts`
- `src/App.vue`（只允许应用装配，不写页面视觉）
- `src/app/**`
- 路由注册、全局 provider、全局状态装配

### D. 业务规则与数据层
- `src/domain/**`
- `src/data/**`
- SQLite schema、repo、mapper、service、规则函数

### E. 非视觉型共享层
- `src/shared/constants/**`
- `src/shared/types/**`
- `src/shared/utils/**`

### F. 集成与验证
- 路由接线
- store 与 page 契约接线
- 类型检查
- 构建检查
- Android/H5 验证

## 5.2 Gemini 负责的内容

### A. 页面与页面级交互
- `src/features/home/**`
- `src/features/editor/**`
- `src/features/mailbox/**`
- `src/features/calendar/**`
- `src/features/profile/**`

### B. 视觉共享层
- `src/shared/ui/**`
- `src/shared/assets/**`

### C. 页面内部内容
- 页面布局
- 视觉层级
- 页面样式
- 页面状态展示
- 页面动效
- 与用户直接接触的文案呈现
- 页面级组件拆分与复用

## 5.3 双方都可以读，但默认由 Codex 维护

- `src/pages.json`
- `src/manifest.json`
- `src/uni.scss`
- 全局路由名称、页面挂载、导航常量

规则：
- Gemini 如需新增页面路由或调整页面挂载，不直接修改这些文件。
- Gemini 通过 handoff 提交“需要的路由/入口变更”。
- Codex 统一改动并回填。

---

## 6. 严格写入边界

## 6.1 Codex 禁止事项

1. 不直接重做正式页面 UI。
2. 不直接决定视觉风格。
3. 不在 `src/features/**` 中实现最终页面视觉稿，除非只是占位壳或接口接线。
4. 不在 `src/shared/ui/**` 中产出带业务视觉语义的大量组件。
5. 不在没有 Gemini 交付设计稿 / 页面稿时擅自补页面细节。

## 6.2 Gemini 禁止事项

1. 不改 `src/domain/**`
2. 不改 `src/data/**`
3. 不改 `src/app/store/**` 的状态结构与方法签名
4. 不改 `package.json`、构建配置、工程脚本
5. 不直接新增数据库字段、repo 方法、service 规则
6. 不在页面内直接写 SQLite / StorageSync 访问
7. 不把业务规则硬编码成页面 if/else 真相来源

## 6.3 例外处理

如确需跨边界：

1. 先提接口变更申请
2. 先改本文档里的契约
3. 再由对应负责人修改代码

不允许“先改了再说”。

---

## 7. 协作顺序

## 7.1 标准推进顺序

### 阶段 A：Codex 先稳定底座
输出：
- 文档真相集
- 类型定义
- store 契约
- service 契约
- repository 契约
- 页面路由骨架
- 页面调用接口说明

### 阶段 B：Gemini 按契约做页面
输出：
- 页面布局
- 组件树
- 交互细节
- 空态 / 错误态 / 加载态 / 阅读态 / 编辑态
- 页面级文案呈现

### 阶段 C：Codex 回来集成
输出：
- 路由挂载
- store 与 page 接线
- 类型修正
- 构建验证
- 回归检查

## 7.2 禁止的推进方式

1. Gemini 在底层接口未定时直接写依赖底层的页面逻辑
2. Codex 在页面设计未定时直接把页面写满
3. 双方同时改同一页面文件
4. 双方同时改同一个 store / service / component 文件

---

## 8. 分离开发要维护的文档集

为保证可独立推进，以下文档必须存在并保持同步：

### 8.1 产品真相文档
- `docs/spec/product_spec_v2.md`
- `docs/spec/interaction_rules.md`

### 8.2 技术真相文档
- `docs/tech/architecture.md`
- `docs/tech/data_model.md`
- `docs/tech/ai_workflow.md`

### 8.3 本次新增建议文档
- `docs/tech/codex_gemini_split_dev_spec.md` ← 推荐使用本文档
- `docs/tech/front_contracts.md` ← 若后续拆分页面接口文档
- `docs/tech/route_contracts.md` ← 若后续拆分路由契约

### 8.4 任务与交接文档
- `docs/tasks/T-xxx_*.md`
- `docs/handoffs/HANDOFF_Codex_to_Gemini_*.md`
- `docs/handoffs/HANDOFF_Gemini_to_Codex_*.md`
- `docs/handoffs/CHECKPOINT_*.md`

---

## 9. 第一版功能清单（P0 / P1）

## 9.1 P0 必做功能

### A. 今日信纸入口
- 打开今日信纸
- 判断今日日记草稿是否存在
- 判断今日日记正式记录是否存在
- 根据规则恢复 / 打开 / 新建

### B. 日记
- 按天唯一
- 可续写
- 可补写历史日期
- 正式保存后切阅读态

### C. 随笔
- 新建随笔
- 恢复活跃随笔草稿
- 一天可多条正式记录
- 正式保存后进入阅读态

### D. 未来信
- 创建未来信草稿
- 恢复未来信草稿
- 未选日期时点信封弹日期选择
- 封存后不可编辑
- 到期自动转可读

### E. 草稿系统
- 日记草稿按 `draft_diary_{recordDate}` 分槽
- 随笔草稿 `draft_jotting`
- 未来信草稿 `draft_future`
- 输入静默暂存
- 退后台强制暂存

### F. 信箱
- 往日信件列表
- 待启之信列表
- 列表排序
- 点记录进入阅读态
- 未解锁未来信不显示全文

### G. 日历
- 仅从信箱页进入
- 按日期打点
- 点有记录日期跳转
- 点空白历史日期补日记
- 点今天空白日期进入今日日记

### H. 销毁
- 阅读态销毁入口
- 统一走 `destroyEntry(id)`
- 删除后刷新信箱与日历

### I. 个人中心
- 主题 / 字号 / 隐私锁入口
- 备份入口占位
- 关于占位

### J. 隐私锁基础链路
- 退后台先暂存
- 回前台先解锁
- 解锁后恢复原状态

## 9.2 P1 推荐功能

1. 当天归档列表页
2. 页面轻反馈与过渡动画
3. 后台缩略图隐私遮罩
4. 已解锁未来信在往日信件中的更细展示
5. 个人中心设置的完整持久化

## 9.3 Deferred

1. App 驻留跨天后的全局刷新策略
2. 复杂时区与系统时间变化处理
3. 附件、搜索、云同步、统计

---

## 10. 页面职责拆解

## 10.1 Home 页面

### Gemini 负责
- 页面骨架
- 入口卡视觉
- 今日状态呈现
- 头像入口
- 交互动效

### Codex 提供
- 今日状态数据
- 各入口动作方法
- 首页 view model

### 页面不得自决的规则
- 今日入口打开什么内容
- 日记是否存在
- 草稿恢复逻辑

## 10.2 Editor 页面

### Gemini 负责
- 编辑态 / 阅读态 UI
- 信纸视觉
- 输入区样式
- 信封按钮、续写入口、销毁入口的呈现
- 空态 / 锁定态 / 封存反馈呈现

### Codex 提供
- 页面 mode
- 当前 entry / draft 数据
- 自动暂存方法
- save / seal / destroy / continueWrite 等动作
- 未来信日期合法性校验结果

### 页面不得自决的规则
- `recordDate` 锁定逻辑
- 是否允许封存
- 是否允许编辑
- 是否销毁正式内容

## 10.3 Mailbox 页面

### Gemini 负责
- tab 布局
- 列表卡样式
- 空态与锁定态显示
- 待启之信视觉呈现

### Codex 提供
- 往日信件列表
- 待启之信列表
- 排序后的 view model
- openEntry / openLockedFuturePreview 等动作

### 页面不得自决的规则
- 排序规则
- 锁定状态判断
- 未来信归类规则

## 10.4 Calendar 页面

### Gemini 负责
- 日历视觉
- 打点呈现
- 月份切换交互
- 回到今天按钮
- 选中态与空态视觉

### Codex 提供
- 日期是否有内容
- 某日内容数量
- 点击某日后的跳转决策结果

### 页面不得自决的规则
- 空白日期能否新建随笔
- 多条内容是否直开或进列表
- 日历打点是否包含未来信

## 10.5 Profile 页面

### Gemini 负责
- 分组样式
- 设置项视觉
- 页面结构

### Codex 提供
- 设置数据读取与保存动作
- 隐私锁开关状态
- 备份能力占位状态

---

## 11. 页面可依赖的统一接口策略

为了让 Gemini 可以不关心底层实现，页面层只能依赖**前端契约层**，不能直接吃 repo / domain。

建议由 Codex 提供以下三层接口：

1. **共享类型层**：`src/shared/types/**`
2. **页面动作层**：`src/app/store/**`
3. **页面适配层**：`src/features/*/composables/useXxxPage.ts` 或 `src/app/providers/**`

规则：
- Gemini 只消费页面适配层与 store 暴露的稳定方法。
- repo、schema、domain rule 的存在对 Gemini 应该透明。

---

## 12. 路由与页面契约

## 12.1 路由命名建议

```ts
export const ROUTES = {
  HOME: '/features/home/pages/HomePage',
  EDITOR: '/features/editor/pages/EditorPage',
  MAILBOX: '/features/mailbox/pages/MailboxPage',
  CALENDAR: '/features/calendar/pages/CalendarPage',
  PROFILE: '/features/profile/pages/ProfilePage',
  DAY_ARCHIVE: '/features/mailbox/pages/DayArchivePage',
  PRIVACY_LOCK: '/features/profile/pages/PrivacyLockPage',
} as const
```

> 最终路径与常量名以 Codex 维护版本为准，Gemini 不直接改全局路由常量。

## 12.2 Editor 路由参数契约

```ts
export type EditorMode = 'diary' | 'jotting' | 'future' | 'read'

export interface EditorRouteParams {
  mode: EditorMode
  entryId?: string
  recordDate?: string
  slotKey?: string
  source?: 'home' | 'mailbox' | 'calendar' | 'profile' | 'deep-link'
}
```

说明：
- `mode='diary'`：打开/恢复/新建某日日记
- `mode='jotting'`：打开活跃随笔草稿或新建
- `mode='future'`：打开活跃未来信草稿或新建
- `mode='read'`：只读打开正式内容

## 12.3 Mailbox 路由参数契约

```ts
export type MailboxTab = 'past' | 'pending-future'

export interface MailboxRouteParams {
  initialTab?: MailboxTab
}
```

## 12.4 Calendar 路由参数契约

```ts
export interface CalendarRouteParams {
  focusDate?: string // YYYY-MM-DD
  source?: 'mailbox' | 'system'
}
```

## 12.5 Day Archive 路由参数契约

```ts
export interface DayArchiveRouteParams {
  recordDate: string // YYYY-MM-DD
}
```

---

## 13. 共享类型契约

以下类型由 Codex 维护，Gemini 只读使用。

## 13.1 Entry 摘要类型

```ts
export type EntryType = 'diary' | 'jotting' | 'future'
export type EntryStatus = 'saved' | 'sealed' | 'unlocked'

export interface EntrySummaryVM {
  id: string
  type: EntryType
  status: EntryStatus
  title: string | null
  excerpt: string
  recordDate: string
  createdAt: string
  updatedAt: string
  unlockDate: string | null
  isLocked: boolean
  badge: 'diary' | 'jotting' | 'future-locked' | 'future-opened' | null
}
```

## 13.2 Editor 页面模型

```ts
export interface EditorPageVM {
  mode: 'diary' | 'jotting' | 'future' | 'read'
  entryId: string | null
  slotKey: string | null
  title: string | null
  content: string
  recordDate: string
  unlockDate: string | null
  isDirty: boolean
  isLocked: boolean
  isReadonly: boolean
  canSave: boolean
  canSeal: boolean
  canContinueWrite: boolean
  canDestroy: boolean
  placeholder: string
}
```

## 13.3 Calendar 打点模型

```ts
export interface CalendarDayMarkerVM {
  date: string
  hasDiaryOrJotting: boolean
  entryCount: number
}
```

## 13.4 Settings 模型

```ts
export interface SettingsVM {
  theme: 'default'
  fontScale: 'sm' | 'md' | 'lg'
  privacyLockEnabled: boolean
  biometricEnabled: boolean
}
```

---

## 14. 页面动作接口文档

本节是给 Gemini 最关键的“别乱猜”部分。

## 14.1 Home 页面动作契约

```ts
export interface HomePageActions {
  openTodayDiary(): Promise<void>
  openJotting(): Promise<void>
  openFutureLetter(): Promise<void>
  openMailbox(): Promise<void>
  openProfile(): Promise<void>
}
```

```ts
export interface HomePageState {
  todayDate: string
  todayDiaryExists: boolean
  todayDiaryDraftExists: boolean
  pendingFutureCount: number
}
```

## 14.2 Editor 页面动作契约

```ts
export interface EditorPageActions {
  updateContent(content: string): void
  updateCursorPosition(cursorPosition: number | null): void
  requestSave(): Promise<EditorSaveResult>
  requestSealFutureLetter(): Promise<EditorSealResult>
  continueWrite(): Promise<void>
  requestDestroy(): Promise<DestroyResult>
  discardCurrentDraftIfEmpty(): Promise<void>
  setFutureUnlockDate(date: string): void
  refreshFromSource(): Promise<void>
}
```

```ts
export type EditorSaveResult =
  | { type: 'saved'; entryId: string }
  | { type: 'sealed'; entryId: string }
  | { type: 'empty-discarded' }
  | { type: 'need-unlock-date' }
  | { type: 'confirm-destroy' }
  | { type: 'blocked'; reason: string }

export type EditorSealResult =
  | { type: 'sealed'; entryId: string }
  | { type: 'need-unlock-date' }
  | { type: 'blocked'; reason: string }

export type DestroyResult =
  | { type: 'destroyed' }
  | { type: 'cancelled' }
  | { type: 'blocked'; reason: string }
```

说明：
- 页面只根据返回结果做展示。
- 页面不能自己决定“空白时是丢弃还是销毁”。
- 页面不能自己决定“未来信能否封存”。

## 14.3 Mailbox 页面动作契约

```ts
export interface MailboxPageState {
  activeTab: 'past' | 'pending-future'
  pastEntries: EntrySummaryVM[]
  pendingFutureEntries: EntrySummaryVM[]
  isLoading: boolean
}
```

```ts
export interface MailboxPageActions {
  switchTab(tab: 'past' | 'pending-future'): void
  openEntry(entryId: string): Promise<void>
  openCalendar(): Promise<void>
  refreshMailbox(): Promise<void>
  previewLockedFutureLetter(entryId: string): Promise<LockedFuturePreviewVM>
}
```

```ts
export interface LockedFuturePreviewVM {
  entryId: string
  unlockDate: string
  message: string
}
```

## 14.4 Calendar 页面动作契约

```ts
export interface CalendarPageState {
  focusedMonth: string // YYYY-MM
  selectedDate: string | null
  markers: CalendarDayMarkerVM[]
  isTodayVisible: boolean
}
```

```ts
export interface CalendarPageActions {
  goToToday(): void
  goToMonth(month: string): void
  selectDate(date: string): Promise<CalendarDateSelectionResult>
  refreshMarkers(): Promise<void>
}
```

```ts
export type CalendarDateSelectionResult =
  | { type: 'open-entry'; entryId: string }
  | { type: 'open-day-archive'; recordDate: string }
  | { type: 'create-diary'; recordDate: string }
  | { type: 'blocked'; reason: string }
```

## 14.5 Profile 页面动作契约

```ts
export interface ProfilePageState {
  settings: SettingsVM
  buildVersion: string | null
  backupEnabled: boolean
}
```

```ts
export interface ProfilePageActions {
  setTheme(theme: 'default'): Promise<void>
  setFontScale(scale: 'sm' | 'md' | 'lg'): Promise<void>
  setPrivacyLockEnabled(enabled: boolean): Promise<void>
  setBiometricEnabled(enabled: boolean): Promise<void>
  openAbout(): Promise<void>
  openBackupSettings(): Promise<void>
}
```

---

## 15. Store 契约建议

以下内容由 Codex 实现，Gemini 只可依赖，不可改签名。

## 15.1 useAppStore

```ts
export interface AppStoreState {
  isForeground: boolean
  isLocked: boolean
  lastOpenedRoute: string | null
}

export interface AppStoreActions {
  markAppForeground(): void
  markAppBackground(): Promise<void>
  lockApp(): void
  unlockApp(): Promise<void>
  restoreLastRoute(): Promise<void>
}
```

## 15.2 useEntryStore

```ts
export interface EntryStoreActions {
  getEntryById(id: string): Promise<EntrySummaryVM | null>
  listPastEntries(): Promise<EntrySummaryVM[]>
  listPendingFutureLetters(): Promise<EntrySummaryVM[]>
  saveDiary(input: SaveDiaryInput): Promise<EditorSaveResult>
  saveJotting(input: SaveJottingInput): Promise<EditorSaveResult>
  sealFutureLetter(input: SealFutureLetterInput): Promise<EditorSealResult>
  destroyEntry(id: string): Promise<DestroyResult>
  refreshFutureLetterStatus(today: string): Promise<void>
}
```

## 15.3 useDraftStore

```ts
export interface DraftStoreActions {
  getDraft(slotKey: string): Promise<DraftVM | null>
  upsertDraft(input: UpsertDraftInput): Promise<void>
  deleteDraft(slotKey: string): Promise<void>
  resolveDiaryDraftSlot(recordDate: string): string
  resolveJottingDraftSlot(): string
  resolveFutureDraftSlot(): string
}
```

## 15.4 useSettingsStore

```ts
export interface SettingsStoreActions {
  getSettings(): Promise<SettingsVM>
  patchSettings(input: Partial<SettingsVM>): Promise<void>
}
```

---

## 16. Repo 契约建议（仅 Codex 维护）

本节不是给 Gemini 写实现，而是为了避免 Gemini 误判底层能力边界。

## 16.1 entryRepo

```ts
findById(id: string): Promise<Entry | null>
findDiaryByDate(recordDate: string): Promise<Entry | null>
findEntriesByDate(recordDate: string): Promise<Entry[]>
listPastEntries(): Promise<Entry[]>
listPendingFutureLetters(today: string): Promise<Entry[]>
insertEntry(entry: Entry): Promise<void>
updateEntry(entry: Entry): Promise<void>
destroyEntry(id: string): Promise<void>
refreshFutureLetterStatus(today: string): Promise<void>
```

## 16.2 draftRepo

```ts
getDraft(slotKey: string): Promise<Draft | null>
upsertDraft(draft: Draft): Promise<void>
deleteDraft(slotKey: string): Promise<void>
```

## 16.3 prefsRepo

```ts
getSetting(key: string): Promise<unknown>
setSetting(key: string, value: unknown): Promise<void>
```

---

## 17. 目录所有权矩阵

| 路径 | 负责人 | 说明 |
|---|---|---|
| `docs/spec/**` | Codex | 产品真相文档 |
| `docs/tech/**` | Codex | 技术真相文档与协作文档 |
| `docs/tasks/**` | Codex | 任务卡 |
| `docs/handoffs/**` | Codex | 交接文档与 checkpoint |
| `src/app/**` | Codex | 应用装配与 store |
| `src/domain/**` | Codex | 业务规则真相来源 |
| `src/data/**` | Codex | 数据层真相来源 |
| `src/shared/constants/**` | Codex | 非视觉共享常量 |
| `src/shared/types/**` | Codex | 类型真相来源 |
| `src/shared/utils/**` | Codex | 工具函数 |
| `src/shared/ui/**` | Gemini | 纯视觉共享组件 |
| `src/shared/assets/**` | Gemini | 图标、图片、视觉资源 |
| `src/features/**` | Gemini | 页面与页面级组件 |
| `src/pages.json` | Codex | 页面注册统一由 Codex 维护 |
| `src/manifest.json` | Codex | 工程配置 |
| `src/uni.scss` | Codex 主维护 / Gemini 可提议 | 全局视觉变量建议走 handoff |
| `package.json` | Codex | 依赖与脚本 |

---

## 18. 交接格式要求

## 18.1 Codex → Gemini 必须交付的内容

每次交给 Gemini 前，至少提供：

1. 本轮目标页面
2. 当前可用路由
3. 页面可用数据结构
4. 页面可用动作方法
5. 禁止触碰目录
6. 待补充状态说明
7. 视觉约束与产品规则提醒

推荐格式：

```md
# HANDOFF: Codex -> Gemini

## 本轮目标
- 实现 Home / Editor / Mailbox 页面正式 UI

## 可用文件与目录
- 可写：src/features/home/**
- 可写：src/features/editor/**
- 可写：src/features/mailbox/**
- 可写：src/shared/ui/**
- 不可写：src/domain/**
- 不可写：src/data/**
- 不可写：src/app/store/**

## 已稳定接口
- HomePageState
- HomePageActions
- EditorPageVM
- EditorPageActions
- MailboxPageState
- MailboxPageActions

## 产品硬规则
- 不允许点击正文直接进入编辑态
- 未来信未解锁不得展示全文
- 删除文案统一为“销毁”

## 本轮验收点
- 页面可独立渲染
- loading / empty / error / readonly 状态完整
- 不把业务规则写死在页面层
```

## 18.2 Gemini → Codex 必须交付的内容

每次交还给 Codex 时，至少提供：

1. 改了哪些路径
2. 页面组件树概览
3. 依赖了哪些接口
4. 缺了哪些数据字段 / 方法
5. 哪些地方需要 Codex 接线
6. 哪些视觉实现仍是占位
7. 不确定项列表

推荐格式：

```md
# HANDOFF: Gemini -> Codex

## 已完成
- HomePage.vue 正式布局
- EditorPage.vue 编辑态 / 阅读态 UI
- MailboxPage.vue 双 tab 列表 UI

## 依赖的接口
- EditorPageVM.placeholder
- EditorPageVM.canDestroy
- MailboxPageState.pendingFutureEntries
- LockedFuturePreviewVM

## 需要 Codex 补线
- openTodayDiary()
- requestSave()
- previewLockedFutureLetter()
- Calendar 路由跳转

## 未解决
- Day Archive 页面尚未实现
- Profile 备份入口仍为视觉占位
```

---

## 19. 变更管理

## 19.1 哪些变更必须先改文档

以下任一变化出现时，必须先改本文件或拆分契约文档，再改代码：

1. 页面新增或删除
2. 路由参数变更
3. store 方法签名变更
4. 页面 VM 字段变更
5. repo 接口变更
6. 新增共享组件目录职责变更
7. 目录所有权变更

## 19.2 推荐变更记录格式

```md
## Change Log
- 2026-04-10: 初版建立，明确 Codex / Gemini 严格分离
- YYYY-MM-DD: 新增 DayArchiveRouteParams
- YYYY-MM-DD: EditorPageActions 增加 requestDiscardDraft
```

---

## 20. 验收清单

## 20.1 分离开发验收

1. Gemini 是否可以不看 SQLite 细节就完成页面实现
2. Codex 是否可以不碰页面视觉就完成底层实现
3. 页面是否只依赖 store / page adapter / types
4. 业务规则是否没有写死在页面里
5. 双方是否没有并发写同一路径

## 20.2 页面验收

1. Home 是否只做入口，不做信息瀑布流
2. Editor 是否清楚区分编辑态与阅读态
3. Mailbox 是否正确区分往日信件与待启之信
4. Calendar 是否只作为跳转页，不承担主导航
5. Profile 是否只承接设置，不抢主功能入口

## 20.3 规则验收

1. 日记是否按天唯一
2. 随笔是否允许多条
3. 未来信是否未到期不可读
4. `recordDate` 是否按打开纸张时锁定
5. 空白内容是否不生成正式记录
6. 删除是否统一走 `destroyEntry(id)`
7. 日历补写是否只允许日记

---

## 21. 推荐落地方式

推荐直接把本文档保存为：

```text
docs/tech/codex_gemini_split_dev_spec.md
```

然后同步执行以下动作：

1. 用本文档替换旧 `docs/tech/ai_workflow.md` 中关于 Antigravity 和“互相调用”的描述
2. 在 `docs/tech/README.md` 中增加本文档入口
3. 后续每次 handoff 都引用本文档中的目录边界与接口契约
4. 如项目继续扩展，再拆出：
   - `docs/tech/front_contracts.md`
   - `docs/tech/route_contracts.md`
   - `docs/tech/view_model_contracts.md`

---

## 22. 一句话执行规则

从现在开始，`noche` 项目默认按以下方式协作：

- **Gemini 只做界面设计、页面实现、视觉组件与前端交互。**
- **Codex 负责其余所有内容，包括文档、架构、规则、数据、状态、路由、构建、验证与集成。**
- **双方靠本文档约定的目录所有权、功能清单与接口契约并行开发，不互相跨界写代码。**

