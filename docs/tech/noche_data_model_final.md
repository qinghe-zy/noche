# noche data model final

## 1. 文档目标

本文档定义 `noche` 当前阶段的概念数据模型，用于指导后续 TypeScript 类型设计、Pinia 状态建模以及未来 SQLite 表结构设计。

## 2. 说明

当前尚未接入数据库，因此本文件描述的是“领域层概念模型”，不是最终数据库脚本。

## 3. 核心实体

### 3.1 Entry

表示一个正式条目，是系统中的核心内容单元。

建议字段：

- `id`: 全局唯一标识，建议使用 `uuid`
- `title`: 标题
- `content`: 内容正文
- `summary`: 摘要，可选
- `status`: 状态，例如草稿、已完成、已归档
- `createdAt`: 创建时间
- `updatedAt`: 更新时间
- `occurredAt`: 业务发生时间，可选
- `source`: 来源，可选
- `tags`: 标签集合

### 3.2 Draft

表示编辑中的临时稿件，用于承接未提交内容。

建议字段：

- `id`: 草稿标识
- `entryId`: 对应正式条目 ID，可空
- `title`: 当前编辑标题
- `content`: 当前编辑内容
- `isDirty`: 是否存在未保存修改
- `lastEditedAt`: 最近编辑时间

### 3.3 TimeBucket

表示按时间归档或组织内容的逻辑单元。

建议字段：

- `key`: 时间桶键值，例如日、周、月
- `type`: 粒度类型
- `startAt`: 开始时间
- `endAt`: 结束时间

### 3.4 UserProfile

表示本地用户偏好与展示配置。

建议字段：

- `id`: 用户标识
- `displayName`: 显示名
- `timezone`: 时区
- `weekStart`: 每周起始日
- `preferences`: 偏好配置对象

## 4. 关系约定

- 一个 `Entry` 可以由一个 `Draft` 演变而来。
- 一个 `Draft` 可以对应零个或一个 `Entry`。
- 一个 `Entry` 可关联零个或多个标签。
- 一个 `Entry` 可被归入一个或多个 `TimeBucket` 视图。
- `UserProfile` 主要影响展示规则，不直接承载内容实体。

## 5. 状态模型建议

### 5.1 EntryStatus

建议值：

- `draft`
- `active`
- `archived`

### 5.2 DraftState

建议值：

- `idle`
- `editing`
- `saving`
- `conflict`

## 6. 类型设计建议

- 领域实体类型放在 `src/domain/*` 下。
- 跨模块共享的轻量类型放在 `src/shared/types`。
- 数据库存储模型与领域模型分离，后续由 `src/data/mappers` 负责转换。

## 7. SQLite 演进建议

未来接入 SQLite 时，建议至少拆分以下表：

- `entries`
- `drafts`
- `entry_tags`
- `user_profile`

如后续需要支持日历视图缓存或时间索引，可再增加：

- `entry_time_index`

## 8. 当前明确未落地的部分

- SQLite 建表语句
- 数据迁移方案
- 数据同步策略
- 软删除与审计字段
- 多用户协作模型
