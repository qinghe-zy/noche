# noche 架构说明最终版

## 1. 目标
noche 是一个 Android-only、长期迭代的私人写信式记录 App。第一阶段采用本地优先架构，优先保证：
- 写得顺
- 存得稳
- 找得到
- 以后能继续长功能而不推倒重来

当前核心能力：
- 日记
- 随笔
- 未来信
- 信箱回看
- 日历跳转
- 个人中心

## 2. 技术选型
### 2.1 客户端
- 框架：Uni-app CLI
- 视图层：Vue 3
- 语言：TypeScript
- 状态管理：Pinia
- 日期处理：dayjs
- ID 方案：UUID
- 包管理：pnpm
- 运行环境：Android APK

### 2.2 本地数据层
- 核心内容存储：SQLite
- 轻量设置存储：uni.setStorageSync
- 资源层：第一版不做附件仓库，但删除逻辑预留资源清理 Hook

### 2.3 开发方式
- 编辑器：VS Code
- 工程方式：CLI 项目
- Android 工具链：后续补齐 HBuilderX / Android Studio / Android SDK / adb

## 3. 架构原则
1. Local-first。先保证本地完整可用，再考虑同步。
2. 规则先于页面。业务规则只能写在 domain，不写进页面组件。
3. 页面不直接访问 SQLite。页面只调用 store / service / repository。
4. 草稿与正式内容分离。草稿永远不直接当正式记录。
5. 类型先行。所有关键结构先定义类型与状态，再写实现。
6. 删除统一入口。所有删除都走 destroyEntry()，不能直接裸删数据库。
7. 可替换存储。未来如果接云同步，尽量不改页面层。

## 4. 目录结构
```text
noche/
├── docs/
│   ├── spec/
│   ├── tech/
│   ├── tasks/
│   └── handoffs/
├── logs/
├── scripts/
├── .codex/
├── .gemini/
├── .vscode/
├── src/
│   ├── manifest.json
│   ├── pages.json
│   ├── uni.scss
│   ├── App.vue
│   ├── main.ts
│   ├── app/
│   │   ├── store/
│   │   └── providers/
│   ├── domain/
│   │   ├── entry/
│   │   ├── draft/
│   │   ├── time/
│   │   └── services/
│   ├── data/
│   │   ├── db/
│   │   ├── repositories/
│   │   └── mappers/
│   ├── features/
│   │   ├── home/
│   │   ├── editor/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── composables/
│   │   ├── mailbox/
│   │   ├── calendar/
│   │   └── profile/
│   └── shared/
│       ├── ui/
│       ├── utils/
│       ├── constants/
│       ├── types/
│       └── assets/
```

## 5. 分层职责
### 5.1 src/app
负责应用级调度。
- Pinia store
- 全局生命周期
- 全局 provider
- 跨模块状态协调

禁止：
- 不在这里直接写 SQL
- 不在这里写页面细节

### 5.2 src/domain
负责纯业务规则。
- entry/types.ts：Entry、Draft、FutureLetter 等类型
- entry/rules.ts：空内容校验、未来信解锁判断等纯函数
- draft/rules.ts：草稿槽位命名规则、恢复规则
- time/rules.ts：recordDate 锁定、跨天判断、日期合法性判断
- services/：组合多个规则后的业务动作

要求：
- 不依赖 UI
- 不依赖 SQLite
- 不依赖 uni API

### 5.3 src/data
负责和设备存储打交道。
- db/sqlite.ts：连接、建表、执行 SQL
- db/schema.ts：建表语句与迁移版本
- repositories/：entry / draft / prefs 等增删改查
- mappers/：数据库行与领域对象互转

要求：
- 不直接处理页面文案
- 不直接做 UI 跳转

### 5.4 src/features
负责页面和业务模块 UI。
- home：主页
- editor：编辑页与阅读态
- mailbox：信箱
- calendar：日历
- profile：个人中心

editor 模块必须进一步拆分：
- pages/
- components/
- composables/

### 5.5 src/shared
负责跨模块复用。
- ui：纯 UI 组件
- utils：工具函数
- constants：枚举与常量
- types：共享类型
- assets：字体、图标、全局样式资源

边界：
- shared/ui 只能放无业务语义的组件
- 业务语义组件放 features/*/components

## 6. Store 规划
第一版不要做一个超级 store，至少拆为：
- useAppStore：应用级状态、前后台、隐私锁状态
- useEntryStore：正式记录列表与详情
- useDraftStore：草稿恢复与暂存
- useSettingsStore：主题、隐私锁、偏好设置

后续可扩展：
- useCalendarStore
- useMailboxStore

## 7. 页面与数据流
### 7.1 主页
- 负责入口，不承担复杂状态展示
- 从 store 拉取今日状态与快捷入口状态

### 7.2 编辑页
- 读取对应草稿或正式内容
- 输入过程触发静默暂存
- 点信封触发 save usecase

### 7.3 信箱页
- 按 recordDate 展示内容
- 分 tab：往日信件 / 待启之信
- 不直接读数据库，走 repository + store

### 7.4 日历页
- 按日期聚合记录存在性
- 点日期后由 service 决定：直开内容 / 进当天归档列表 / 新建该日日记

### 7.5 个人中心
- 只读设置与统计
- 不承担写作入口主逻辑

## 8. 持久化策略
### 8.1 SQLite 存储正式内容
用于：
- 日记
- 随笔
- 未来信
- 草稿表
- 统计缓存（可选）

### 8.2 StorageSync 存轻状态
用于：
- 主题
- 字体大小
- 隐私锁开关
- 是否启用生物识别
- 轻量 UI 偏好

### 8.3 删除入口
所有删除统一走：
- destroyEntry(id)

职责：
1. 读取该条记录
2. 解析潜在资源引用
3. 清理关联资源（第一版可为空实现，但接口必须存在）
4. 删除数据库记录
5. 触发日历标记与列表刷新

## 9. 日期与时间策略
### 9.1 recordDate
recordDate 在“打开纸张”的瞬间锁定，不在正式保存时决定。

适用：
- 日记
- 随笔
- 未来信草稿

### 9.2 unlockDate
未来信只存日期，不存复杂分钟级倒计时。
- 格式：YYYY-MM-DD
- 解锁时刻：目标日期本地时间 00:00:00

### 9.3 时间判断
所有第一版判断基于设备本地日期。
第一版不对抗用户手动修改系统时间。

## 10. 扩展性预留
### 10.1 未来可加
- 图片附件
- 音频附件
- 标签
- 搜索
- 导出备份
- 云同步
- 统计
- 提醒

### 10.2 现在要提前预留的点
- destroyEntry() 资源清理 Hook
- repository 层隔离
- mappers 层隔离
- UUID 主键
- 领域规则与页面解耦

## 11. 当前明确不做
- 不做复杂富文本编辑器
- 不做多人协作
- 不做回收站
- 不做复杂提醒系统
- 不做服务端优先架构
- 不做多端同步优先版本

## 12. Deferred / 暂不拍板
以下点当前不写死进正式实现：
- 漏洞 13：App 存活状态下跨天唤醒的全局刷新策略
- 我方自提但用户未最终确认的 15、16、17、19、20、21、22

这些后续如要实现，应单独开任务卡，不在第一版默认上线。
