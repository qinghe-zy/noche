# HANDOFF: Codex -> Gemini

## 本轮目标

- Mailbox / Calendar 的后端 facade 已补齐到可并行开发状态
- future unlock transition 已统一收口到后端读取边界
- 当前仍基于 memory repository，不暴露 SQLite 细节

## 可依赖目录

- 可读：
  - `src/app/store/useMailboxStore.ts`
  - `src/app/store/useCalendarStore.ts`
  - `src/app/store/useEntryStore.ts`
  - `src/domain/entry/types.ts`
  - `src/shared/constants/routes.ts`
  - `src/shared/constants/draftKeys.ts`
- 不要改：
  - `src/domain/**`
  - `src/data/**`
  - `src/app/store/**` 的状态结构与方法签名

## 已稳定接口

### Mailbox

```ts
interface MailboxStore {
  pastEntries: Entry[];
  sealedFutureEntries: Entry[];
  pendingFutureEntries: Entry[];
  isLoading: boolean;
  error: string | null;
  fetchPastEntries(): Promise<void>;
  fetchSealedFutureEntries(): Promise<void>;
  fetchEntryById(entryId: string): Promise<Entry | null>;
  refreshMailbox(): Promise<void>;
}
```

语义说明：

- `pastEntries`
  - 包含 `diary`
  - 包含 `jotting`
  - 包含已解锁 `future`
- `sealedFutureEntries / pendingFutureEntries`
  - 只包含未解锁 `future`
- 排序按 `recordDate` 倒序

### Calendar

```ts
type CalendarResolveResult =
  | { kind: "entry"; entryId: string }
  | { kind: "entry-list"; recordDate: string }
  | { kind: "new-diary"; recordDate: string };

interface CalendarStore {
  markedDates: string[];
  isLoading: boolean;
  error: string | null;
  fetchMarkedDates(): Promise<void>;
  resolveDate(recordDate: string): Promise<CalendarResolveResult>;
}
```

语义说明：

- `markedDates` 当前包含 calendar 可见记录日期
- sealed future 不会单独把日期打进 calendar
- unlocked future 会作为可见记录参与 resolve
- `resolveDate()` 只返回三分流，不额外返回 repository 细节

## 已统一的后端规则

- future sealed/unlocked 的判定不应再写在页面里
- 当前统一由后端读取链路处理：
  - `src/domain/services/entryQueryService.ts`
  - `src/app/store/entryReadFacade.ts`

前端只需要消费最终列表和 resolve 结果，不需要自己判断 future 是否已解锁。

## 仍未完成 / 不要假设

- editor 正式保存流程还没有完全收口成单一 facade
- 读取已有 entry 后进入 editor read mode 的完整页面接线还没做完
- Day Archive 正式页面和对应导航链路仍未完成
- SQLite persistence 仍未接入

## 页面实现建议

- Mailbox 页：
  - past tab 直接吃 `pastEntries`
  - pending future tab 直接吃 `sealedFutureEntries` 或 `pendingFutureEntries`
  - loading / error / empty 状态都从 store 状态出发
- Calendar 页：
  - 打点只吃 `markedDates`
  - 点击日期后一律调用 `resolveDate(recordDate)` 再决定跳转
  - 不要在页面里自己判断 “单条 / 多条 / 新建日记”
