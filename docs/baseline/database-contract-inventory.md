# Yuheng 数据库契约基线清单

盘点日期：2026-10-25  
源仓库：`/Users/huhua/study/ai/yuheng/ruoyi-vue-pro`  
基线提交：`128a0e3bd3`

## 当前数据库交付形态

当前仓库以 SQL 快照和数据库工具为主，`sql/` 下存在以下方言目录：

```text
mysql
postgresql
opengauss
oracle
oceanbase
sqlserver
kingbase
highgo
dm
db2
```

每个主要方言通常包含 `ruoyi-vue-pro.sql` 和 `quartz.sql`。数据库工具位于 `sql/tools/`，包括 Docker Compose、各数据库 schema 创建脚本和 SQL 转换脚本。

## 迁移工具现状

在 `yudao-framework`、`yudao-module-system`、`yudao-module-infra` 和 `yudao-server` 的主代码及资源中，没有发现应用级 Liquibase 或 Flyway entry changelog。Liquibase 相关代码主要位于：

```text
sql/dm/flowable-patch-6.8.0/
sql/dm/flowable-patch-tests/
```

这些内容用于 Flowable/达梦补丁和测试，不能直接当作 Yuheng 应用的 core baseline 迁移链。

因此，架构设计中的“core baseline + demo business Liquibase”属于目标方案，实施前必须单独设计并验证从现有 SQL 快照到可增量迁移链的转换方式。不能在没有差异评估的情况下把所有 SQL 快照直接改写成 Liquibase。

## 已发现的数据库风险

- 多数据库方言的字段类型、索引、序列和布尔值语义需要逐方言验证；
- Flowable 依赖自身 schema/update 机制，不能用应用级迁移开关掩盖启动问题；
- 业务模块测试资源中存在各自的 `create_tables.sql` / `clean.sql`，迁移到 demo 后需要明确测试数据库边界；
- 共享库租户模型必须继续核对表字段、唯一索引和 SQL 拦截器，不能只凭 `tenant_id` 字符串搜索完成确认。

## 下一步数据库基线任务

1. 选择首轮支持方言，建议先以 MySQL 作为行为基线，同时保留其他方言快照；
2. 从 `sql/mysql/ruoyi-vue-pro.sql` 提取表、字段、索引、初始数据和模块归属；
3. 对 system/infra 表建立 core baseline 清单；
4. 对业务表建立 demo 增量清单；
5. 选定迁移技术后，对首次初始化、重复执行、升级失败和回滚进行验证；
6. 将已有 changeset 或 SQL 快照标记为不可修改的历史输入。
