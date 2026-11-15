# MySQL 表归属审计初稿

> 2026-11-11 决策更新：五张 `yudao_demo*` 表暂归 core，独立脚本交付；Flowable 和 Quartz schema 由 Liquibase 分别管理；主快照数据作为初始化范围并单独交付，清除密码类凭据、修正旧类名；新库不创建 `system_operate_log.success`；本轮不处理已有库接续。本文下方保留决策前的审计记录，凡与此更新不一致的候选结论以本更新为准；技术验证仍未完成。

日期：2026-11-11  
状态：静态证据初审，**不是已批准的 baseline 清单**。  
逐表矩阵：[mysql-table-ownership-review-2026-11-11.tsv](mysql-table-ownership-review-2026-11-11.tsv)
种子矩阵：[mysql-seed-data-review-2026-11-11.tsv](mysql-seed-data-review-2026-11-11.tsv)

## 范围与证据

本轮只读解析 `ruoyi-vue-pro/sql/mysql/ruoyi-vue-pro.sql` 与 `quartz.sql`，并在 core、demo、业务模板的 Java 源码中检索 `@TableName` 字面值。未读取数据库、凭据或运行数据；未解析 Mapper XML、注解 SQL、动态表名、Quartz `JOB_DATA`，也未对比任何环境的实际 schema。INSERT 数量是 SQL 语句数，不是插入行数。

| 来源 | 表数 | Java 注解映射 | 尚待审定 |
|---|---:|---:|---|
| 主快照 `infra_*` / `system_*` 候选 | 43 | 43 | DDL/字段/索引、平台所有权、必要种子及环境数据分类 |
| 主快照 `yudao_demo*` 候选 | 5 | 5 | 属于 core infra 中的示例 CRUD 功能候选，须确认示例是否继续由 core 发布，或移入 demo/template |
| Quartz 快照 | 11 | 0 | 启用策略、schema 所有者，以及是否由 Liquibase 或 Quartz 初始化 |
| **合计** | **59** | **48 张主快照表有注解引用** | **没有表获准直接导入生产 baseline** |

主快照候选中有 11 张 infra 表和 32 张 system 表。逐表矩阵记录主快照 48 张表的 DDL 列数、次级索引数量、insert 语句数、Java 注解引用、Java 声明字段、`BaseDO` 继承字段及 `@KeySequence` / `@TenantIgnore` 标注。Quartz DDL 的缩进格式不同，列计数未自动解析，必须对照实际依赖版本的 Quartz 官方脚本复核。

Java 字段对比会显示差异，但有一类差异属于 MyBatis Plus 租户拦截器：未加 `@TenantIgnore` 且没有实体租户基类的表，SQL interceptor 仍可能自动加 `tenant_id` 条件；实体属性中没有 tenantId 并不能证明该列可删。demo 的 `yudao.tenant.ignore-tables` 目前为空，故每张表要同时审查 interceptor 行为和 DDL。静态列对比发现 `system_operate_log` 的快照含 `success`，当前 `OperateLogDO` 没有对应字段；旧迁移资产不能未经 Mapper/历史兼容检查直接转成新 baseline。

第二张矩阵覆盖主快照全部 48 张表的 INSERT 语句数量和候选所有者；所有非零数据目前都标记为未批准，需按行确定是否属于可重建的最小平台初始化数据。它不包含 SQL values，也不复制凭据或业务数据。

## 发现的治理冲突

1. `yudao_demo01_contact`、`yudao_demo02_category`、`yudao_demo03_course`、`yudao_demo03_grade`、`yudao_demo03_student` 五张示例表各自有 DO、Mapper、Service 和 Controller；core infra demo 目录共有 47 个 Java 文件，含 5 个 Controller、10 个 Service、11 个 Mapper 和 5 个 DO。因此这不是只有遗留 DO 的情况，而是已存在的 core 示例功能。其归属需在“core 继续发布 infra 示例及其 schema”与“将示例完整迁到 demo/template”之间决策。决策前不把这些表当成通用平台 core baseline，也不误标为当前 demo 已有业务模块。
2. demo 的 `application.yaml` 设置 `flowable.database-schema-update: true`。Flowable 表如果交由 Liquibase 管理，必须同时关闭或约束 Flowable 的 schema 更新；不能让两个迁移机制写同一组表。
3. demo local/dev 配置 Quartz JDBC JobStore。`quartz.sql` 仅是候选结构来源，不代表可以导入任务、序列化 `JOB_DATA` 或调度器运行状态。Quartz schema 应以实际 Quartz 依赖版本对应的官方脚本为结构依据，并单独确认谁负责创建和升级。
4. demo `src/main/resources` 没有 Liquibase changelog 或 Liquibase 依赖声明。`target/classes/db/changelog` 存在 2026-11-09 的构建目录残留，master 引用了 core baseline、seed、Quartz 文件和 `db/changelog/member/001-member-init.sql`；这些文件不在已跟踪源码中，且 member 路径在 target 中也缺失。该目录被 `.gitignore` 排除，不能视作可复现的迁移实现或验证证据。
5. 业务模板文档描述 `src/main/resources/sql/member-init.sql` 并给出手工执行步骤，但模板仓库当前没有任何 `.sql` 文件。模板的数据库交付描述与实际资产不一致，需要先补齐模块迁移源码和复制路径，再宣称模板可导入。
6. core 实体含 `@KeySequence`、`@TenantIgnore` 等数据库语义。字段、租户列、主键生成、索引与目标方言必须对照实体和 Mapper 审核；不能从 MySQL 快照推断其他方言。
7. main SQL 中包含大量菜单、角色菜单、字典、租户、账号、邮件/SMS、通知、任务和文件配置数据。DDL baseline 和业务/环境 seed 必须分开；账号凭据、端点地址、租户数据、运行任务、日志和历史数据不得通过整表 INSERT 快照进入通用 core baseline。
8. `system_operate_log` 快照 `success` 列在当前 `OperateLogDO` 中没有映射，当前读写 Mapper 也未按该字段过滤或赋值。新建 schema 需决定删除不再使用的旧列，或恢复兼容映射；既有库可能仍保留该列，不能在接续时假设它不存在。
9. `yuheng-module-system/src/test/resources/sql/create_tables.sql` 含 `system_user_session` 测试表，但主生产快照和当前 system Java 源码均没有该表。该 fixture 不应被拿来补全生产 baseline，且需查明其测试来源或清理策略。

## 接续判定

当前不能批准对既有数据库执行 baseline 登记：没有指定目标数据库、脱敏后的 schema/index/constraint 快照、手工变更清单或历史迁移版本证据。可继续做静态 DDL 与数据分类，也可在完全隔离的新 MySQL 实例准备 baseline；不能把现存数据库当空库处理。

既有库接续需要由维护方提供不含凭据的数据库产品/版本、`SHOW CREATE TABLE`、索引与约束清单、Liquibase history（若存在）、人工变更记录，以及 core/demo 表和数据归属。无需提供账号密码。得到这些证据后，才能生成结构差异并制定 baseline 登记或前向修复方案。

## 阶段结论

阶段 1 已完成静态表名、DDL 列数、次级索引数量、Java 声明列与继承列映射、INSERT 语句数量和 seed 审查清单；其“无未分类表、无未审计种子或运行态数据”验收仍未通过。下一步须审查具体索引定义、确认自动租户列、复核 `system_operate_log.success` 差异、逐条分类必要 seed，并决策 core infra 示例、Flowable 与 Quartz schema 所有权。

阶段 2 需要实际目标库的结构证据，目前无法完成既有库接续判定。阶段 3/4 因 baseline 与主入口均未提交为源码，也没有执行环境证据，本轮不加入能自动修改数据库的依赖或 changelog，避免让不完整的迁移入口被误认为可安全启动。
