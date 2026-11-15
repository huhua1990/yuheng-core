# MySQL SQL 治理基线盘点

> 2026-11-11 决策更新：主快照数据作为初始化范围，须先清除密码类示例凭据并修正旧类名；`yudao_demo*`、Flowable、Quartz 和初始化数据分别维护脚本，由 Liquibase 执行。下面关于 seed 的排除建议是决策前风险记录；实际转换须保留数据范围、完成凭据清洗并验证相关运行行为，Quartz 历史运行状态另行评估。

日期：2026-11-10  
范围：只读盘点 MySQL 源快照，供 core 和 demo 的 Liquibase 基线设计使用；本文件不是可执行迁移。

## 来源与校验

源仓库 `ruoyi-vue-pro` 当前提交为 `128a0e3bd3847d11b7f2f9e169dd36fce3b0b581`，检查时工作区干净。

| 文件 | SHA-256 |
|---|---|
| `sql/mysql/ruoyi-vue-pro.sql` | `888ddd5baa5488b2377d66234c8a3c9de1afd2a4c2aa73b2a15495d9d3ea7abe` |
| `sql/mysql/quartz.sql` | `4d2753e7d5ad9c6bab343531cca372598fe09b860bc526e978a4d500636ee244` |

## 结构范围

`ruoyi-vue-pro.sql` 包含 48 条 `CREATE TABLE`、48 条 `DROP TABLE IF EXISTS`、6533 条 `INSERT INTO` 语句及 6533 行 INSERT payload。独立 Quartz 文件包含 11 张表、5 条 INSERT 语句及 36 行 payload。计数由只读审计器扫描并经测试覆盖多值 INSERT、字符串括号/分号、转义引号和注释；计数仍只代表快照内容，不代表必需初始化数据。

| 表组 | 表数 | 待核对表 |
|---|---:|---|
| `infra_*` | 11 | `infra_api_access_log`、`infra_api_error_log`、`infra_codegen_column`、`infra_codegen_table`、`infra_config`、`infra_data_source_config`、`infra_file`、`infra_file_config`、`infra_file_content`、`infra_job`、`infra_job_log` |
| `system_*` | 32 | 部门、字典、菜单、角色、用户、租户、短信、邮件、社交、OAuth2、通知和日志相关表 |
| `yudao_demo*` | 5 | `yudao_demo01_contact`、`yudao_demo02_category`、`yudao_demo03_course`、`yudao_demo03_grade`、`yudao_demo03_student` |
| `QRTZ_*`（独立 Quartz 文件） | 11 | Quartz 调度器表；需结合运行配置确认是否启用和实际维护方式 |

以上前缀仅是盘点分组，并不证明所有字段、约束和初始数据都属于 core。代码中的表引用、字段和必要索引需逐表对照；本次未连接数据库，也未验证当前快照与任何现存环境一致。

对 `yuheng-module-system/src/main/java` 和 `yuheng-module-infra/src/main/java` 中写成 `@TableName("表名")` 的字面量做了初步交叉检查：提取出 23 个不同表名，均出现在上述主快照中。这不是完整映射审计：未覆盖其他模块、其他注解写法、动态 SQL、Quartz、数据库字段和索引。

## 数据与迁移风险

- 两份快照均含 `DROP TABLE`，不可直接用于已有数据库的初始化或升级。
- `infra_config` 有 28 条 INSERT，其中混有 `eam.businessCode.*` 业务配置；`infra_job` 有 33 条 INSERT，必须逐项核对任务归属与启用条件。
- `system_menu` 有 2544 条、`system_role_menu` 有 1552 条、`system_dict_data` 有 1726 条、`system_dict_type` 有 385 条 INSERT；这些数据可能混合平台、业务模块及环境配置，不能按表整体复制为 core 种子数据。
- 用户、角色、部门、租户、文件配置、短信、邮件、通知等表包含现有数据；默认账号、凭据、环境地址和实际运营记录不能未经核验作为通用种子数据。
- `quartz.sql` 含支付/交易任务、旧的 `cn.iocoder.yudao.framework.quartz.core.handler.JobHandlerInvoker` 类名、序列化任务数据和历史调度器实例状态。不得将快照中的任务或实例状态作为通用平台基线。
- 主快照 `infra_file_config` 有 11 行配置数据，包含旧 Java 配置类名及示例对象存储凭据字段；不能作为通用 seed 分发。Quartz 的 `QRTZ_JOB_DETAILS` 有 11 行旧 handler 类名及 Java 序列化 JobData；`QRTZ_LOCKS` 有 2 行锁名。以上 runtime 数据应排除在 baseline 之外，启用 Quartz 时只纳入经版本确认的结构，不恢复历史状态或任务。
- 现有 `src/test/resources/sql/create_tables.sql` 和 `clean.sql` 是测试 fixture，不证明生产 baseline 存在或完整。

审计器：`yuheng-core/tools/governance/audit_mysql_snapshot.py`。它只读取 SQL 文本并生成 TSV/JSON 结构盘点，不执行 SQL。当前解析结果没有未识别表结构；索引仍仅提取名称，未验证索引列、唯一性以外的属性、外键或 DDL 类型/default 完整性，因此逐表矩阵仍需人工复核。

## 后续转换门禁

1. 先把候选 core 表和必要平台种子数据逐项与代码、权限和租户语义核对，业务或环境数据保留在对应消费端；确认 Quartz 表由应用迁移还是其既有机制管理。
2. 对受支持的空库建立可重复验证的 Liquibase baseline，禁止将原快照中的 DROP 和运行时数据整体搬入。
3. 针对已有数据库先采集表、列、索引、约束和数据差异，制定并测试基线登记、升级失败和恢复策略；不能用忽略错误替代比对。
4. 将 core 迁移与 demo 业务迁移由 demo 的单一入口按固定顺序组合，记录 changeset 身份和执行结果；测试 fixture、人工修复 SQL 不进入生产主链。
5. 至少用隔离 MySQL 测试空库初始化、重复执行检查、旧基线升级和失败恢复。其他数据库方言分别验证，不能推断兼容。

## 盘点命令

```bash
git -C ruoyi-vue-pro rev-parse HEAD
git -C ruoyi-vue-pro status --short --branch
shasum -a 256 ruoyi-vue-pro/sql/mysql/ruoyi-vue-pro.sql ruoyi-vue-pro/sql/mysql/quartz.sql
rg -c '^CREATE TABLE `' ruoyi-vue-pro/sql/mysql/ruoyi-vue-pro.sql ruoyi-vue-pro/sql/mysql/quartz.sql
rg -c '^DROP TABLE IF EXISTS' ruoyi-vue-pro/sql/mysql/ruoyi-vue-pro.sql
rg -c '^INSERT INTO' ruoyi-vue-pro/sql/mysql/ruoyi-vue-pro.sql
rg -o --no-filename '@TableName\("[^"]+"\)' yuheng-core/yuheng-module-system/src/main/java yuheng-core/yuheng-module-infra/src/main/java
```
