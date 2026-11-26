# Liquibase SQL 治理实施计划

> 2026-11-11 实施更新：MySQL core/demo 主链已建立，并在用户授权的 `yuheng_demo` 空库执行 5 个 changeset、重复执行 0 个。详情和未完成验收见 [验证记录](../../verification/liquibase-sql-governance/2026-11-11-mysql-baseline.md)。下方保留早期计划，凡描述尚未建立入口或未执行数据库的内容均为历史状态。

> 后续用户决定保留历史用户密码散列；第 6 个追加 changeset 已执行，按用户身份与空密码条件恢复，未修改历史 changeset。其他凭据继续清除。后面的“清除密码类凭据”是当时的旧决定，不适用于历史用户密码。

日期：2026-11-11  
状态：用户已确认首版空库的示例表、框架 schema 和历史数据范围；旧库接续不在本轮范围。生产 changeset 尚未生成，仍需完成数据清洗、框架版本核对和隔离数据库验证。  
关联设计：[三仓库架构与 SQL 治理设计](../specs/2026-11-10-yuheng-three-repository-architecture-design.md)  
只读证据：[MySQL SQL 治理基线盘点](../baseline/mysql-sql-governance-inventory-2026-11-10.md)
逐表审计：[MySQL 表归属审计初稿](../baseline/mysql-table-ownership-review-2026-11-11.md)

## 目标

建立由 `yuheng-demo` 唯一执行的 Liquibase 主入口，按固定顺序组合 `yuheng-core` 平台迁移和 demo 业务迁移。数据库变更可追踪、追加、可重复验证；测试 fixture 与运维脚本不能进入生产迁移链。

首个实施方言为 MySQL。未取得实际运行验证前，不声明 PostgreSQL、DM 或其他方言支持。

## 已知事实与限制

- `ruoyi-vue-pro` 主快照有 48 张表、48 条 `DROP TABLE`、6533 条 `INSERT` 语句；Quartz 快照另有 11 张表和 5 条 `INSERT` 语句。两份快照总计 6538 条 INSERT 语句。
- 主快照的数据混有平台、业务、环境配置和运营状态；Quartz 快照包含业务任务、旧 Java 类名及调度器实例状态。
- core 代码当前没有可确认的、受版本控制的应用级 Liquibase changelog 与 Maven 依赖配置。demo `src/main/resources` 也未发现 Liquibase 配置；`target/classes` 中出现的 changelog 是被忽略的构建产物，不能作为源码证据。
- core 测试目录现有 `create_tables.sql` / `clean.sql` 是测试 fixture，不作为生产 baseline。
- 没有连接实际数据库，也没有可供接续的已执行 changeset 历史和 schema/data 快照。
- 首轮逐表矩阵覆盖 48 张主快照表和 11 张 Quartz 表：主表记录 DDL 列数、索引数、Java 声明/继承列和 INSERT 数；5 张 `yudao_demo*` 表在 core infra 中各有完整示例 CRUD 层，属于待决策的 core 示例功能。`system_operate_log.success` 列与当前 DO 有静态字段差异。矩阵全部标注 pending，尚无表获准进入 baseline。
- demo 配置 Flowable 自动升级 schema，并在 dev/local profile 配置 Quartz JDBC JobStore；这两类框架表必须确定单一 schema 所有者。
- 业务模板 README 记录 `src/main/resources/sql/member-init.sql`，但模板仓库当前找不到任何 SQL 文件；导入契约要等模板迁移资产真实存在后验证。

## 2026-11-11 已确认决策

- 五张 `yudao_demo*` 表暂由 core 发行，使用独立迁移脚本。
- Flowable 和 Quartz 的 schema 由 Liquibase 管理，各自使用独立迁移脚本；关闭框架自动建表和自动升级，并确认具体版本及启动顺序。
- 平台初始化数据以历史主快照为范围，使用独立脚本；旧类名改为可解析的当前 `com.yuheng` 类名，清除密码类示例凭据，不得原样发布其他密钥。数据保留和清洗须可审计，不能未经检验把非空凭据改为 NULL。Quartz 运行状态和序列化数据需要独立评估，不把文本替换视作兼容验证。
- 空库 `system_operate_log` 不创建 `success` 列。既有库接续不在本轮范围，不执行已有库列删除。
- 当前仅在 BOM 声明 Flowable 8.0.0，`yuheng-server` 和 demo 均未声明 Flowable 运行依赖；设计或验证 Flowable 迁移时不得声称引擎已接入。Quartz 由 Spring Boot 3.5.15 管理为 2.5.2，官方 MySQL 脚本存在于本地 jar，应与实际启用配置核对。

历史快照包含密码散列、邮件密码、OAuth client secret、短信及社交客户端密钥以及 JSON 配置中的凭据。转换时须按列和 JSON 字段清洗，保留必要关联并验证非空约束、账号初始化及配置读取；不能直接整体复制快照。不得将原始 DROP 语句纳入迁移或对已有库执行空库 baseline。

## 实施阶段

### 1. 建立迁移资产清册

- 盘点所有 SQL 文件、数据源配置、Quartz 启用配置、表映射、动态 SQL 和测试 fixture。
- 将表、字段、索引、必要种子数据分别归为 core、demo、模板复制资产、环境/运营数据、测试数据或人工运维数据。
- 对 48 张主快照表逐表记录 Java/MyBatis 引用、租户语义、数据归属和保留依据；Quartz 表单独判定由 Liquibase 还是 Quartz 初始化机制管理。
- 已输出 DDL 列数、索引计数、Java 字段和注解对比矩阵及冲突清单；索引定义、字段类型/空值/default、外键和完整所有权仍需审查。

当前状态：静态初审矩阵已完成。示例表和框架 schema 所有权已确定，具体结构与 seed 清洗仍须验证。矩阵标记的 `tenant_id` 字段差异需结合 `TenantDatabaseInterceptor` 处理，不能简单作为实体列缺失；新库明确移除 `system_operate_log.success`。

### 2. 决定既有库接续策略

- 先获取将要接入环境的 schema、索引、约束、数据库版本和敏感数据清单；不得读取或输出凭据。
- 明确目标环境是否为空库、是否已有 core 表、是否运行过人工 SQL，以及实际基线版本。
- 针对空库初始化与既有库接续分别设计路径。既有库只可在结构/数据比对通过后，用 Liquibase 的受控基线登记方式接续；不能执行空库 baseline 来“试试看”。
- 定义迁移失败后的恢复边界、备份要求和前向修复策略。

当前状态：用户明确本轮不需要已有库接续。隔离 MySQL 空库可用于 baseline 验证，但不能代表既有库已完成接续审计。

验收：有可重复的结构差异报告、接续判定规则和可验证恢复流程；未满足则只允许在隔离空库继续。

### 3. 建立 core 平台迁移链

- 在 core 版本化发布的资源目录建立 Liquibase changelog 和 MySQL 平台 baseline。
- 只纳入经阶段 1 审计通过的表结构、索引、约束和必要平台种子数据。
- baseline 不包含 `DROP TABLE`、业务模板表或原始凭据；历史主快照数据按已确认范围清洗后放在独立 seed 脚本，Quartz 运行数据单独评估。
- 后续平台变更使用唯一 changeset id 和作者标识追加；已执行 changeset 不得修改。

验收：新建隔离 MySQL 空库可初始化；第二次执行无变化；历史 changeset 校验和稳定；内容没有 fixture/运维脚本。

### 4. 建立 demo 唯一主入口和业务链

- 在 demo 配置 Liquibase Maven 依赖与唯一应用 master changelog。
- master changelog 固定先 include core 发布包提供的 changelog，再 include demo 自有业务迁移目录。
- 业务模板迁移被一次性复制到 demo 后，更新由 demo 管理；模板仓库不成为运行时或迁移时依赖。
- 所有应用启动方式共享同一迁移入口，禁止再以 SQL init、Spring `schema.sql` 或手工脚本并行创建相同生产 schema。

验收：测试能检查 core 与 demo 两条链的 include 顺序、唯一 master 入口和 changeset id 不重复；演示模块可随 demo 迁移链完整初始化。

### 5. 迁移验证与升级门禁

- 使用隔离 MySQL 实例验证空库初始化、重复执行、指定旧 baseline 升级和中途失败行为。
- 验证初始化数据的最小性、权限/租户关系、外键与索引；用脱敏数据跑后端启动和核心读写 smoke test。
- 增加静态检查：生产 master 可达性、changeset id 唯一、已发布 changeset 不可编辑、生产链不包含测试 fixture/人工运维目录、目标方言标注完整。
- 将 core 版本、core changelog 版本、demo 业务迁移版本和验证环境写入验证记录。

验收：各场景保存 Liquibase 输出和 schema 检查证据；恢复步骤按文档在隔离环境实测。没有实测的方言不得列为支持。

## 本轮允许的变更

当前已完成的工作包括只读审计和决策记录。Liquibase 依赖、入口骨架、生产 changeset 和数据库运行验证均未添加。下一步准备版本匹配的结构与经清洗 seed，并在隔离空库测试；不能指向开发者现有库或共享环境。

## 交付记录

实施验证记录应放在 `docs/verification/liquibase-sql-governance/`，至少链接基线审计矩阵、接续决策、空库/升级测试输出、Liquibase 执行记录和验证环境版本。目前尚无 Liquibase 执行证据。

2026-11-11：`tools/governance/prepare_mysql_schema.py` 从受审主快照只提取 CREATE TABLE，生成 43 张平台表和 5 张独立示例表的临时候选文件，并仅移除 `system_operate_log.success`。使用无端口映射的临时 MySQL 8.0.33 容器导入两份候选，查询得到 48 张表、目标列数量为 0；容器随后删除。这仅验证 DDL 可执行，尚未验证 Liquibase、seed、Flowable/Quartz 或应用启动，临时候选不作为正式迁移交付。
