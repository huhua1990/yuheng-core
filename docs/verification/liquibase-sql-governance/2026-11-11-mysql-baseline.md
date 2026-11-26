# MySQL Liquibase 基线验证

> 后续更新：用户要求保留历史用户密码，已追加并执行第 6 个 changeset，仅对 ID、用户名和租户匹配且密码仍为空的用户恢复快照中的密码散列；验证库 21 个账号均已恢复非空散列。旧 changeset 未改动，外部服务密钥仍保持清除。demo 默认包扫描配置也已修正，使用默认扫描路径启动成功。以下原始验证记录保留当时结果。

进一步验证：demo 的 dev profile 使用 Quartz `LocalDataSourceJobStore` 启动成功；33 条历史任务均为暂停状态。Flowable 8.0.0 在独立 classpath 下设置 `databaseSchemaUpdate=false`，成功创建 ProcessEngine、Identity 和 Event Registry 引擎并关闭；demo 当前仍未实际集成该引擎。快照关联检查发现 56 条未删除的角色菜单记录找不到菜单、2 条未删除的用户角色记录找不到用户或角色、1 条未删除的租户记录找不到套餐；3 个租户中 2 个已过期。未修改这些历史业务数据。

历史用户密码恢复后，校验 21 个密码散列与历史快照一致；使用快照管理员账号和测试租户登录接口成功并取得令牌。此登录在 `yuheng_demo` 写入登录日志与令牌。第 6 个 changeset 执行后再次运行 Liquibase，待执行数量为 0。

2026-11-12 重新验证：使用独立 MySQL 8.0.33 临时容器、空库及隔离 Demo JAR，启用实际 Liquibase 主入口并关闭 Quartz 自动启动。首次启动成功，台账 8 项（7 个 EXECUTED，008 因列不存在为 MARK_RAN），总表数 106，其中 Quartz 11 张、Flowable `ACT_` 39 张、示例 5 张；`system_operate_log.success` 不存在，21 个历史用户密码均非空，Liquibase 锁释放。停止并重启同一隔离实例，Liquibase 明确报告无待执行 changeset，应用和租户名称查询接口正常。与现有 `yuheng_demo` 台账只读比较，7 项校验值相同；005 新库值 `9:1fce28a12d21d036e61292653db6c5d0`，现有库值 `9:62b79a8db7f496e7b8f10784bd7437f8`，后者已列在 changelog 的 `validCheckSum`。本次没有改动现有数据库或历史 changeset；未验证失败恢复、实际任务执行或其他数据库方言。

2026-11-12 失败恢复试验：在另一独立 MySQL 8.0.33 容器完成上述 8 项迁移后，使用外部临时 changelog 执行一个向不存在表插入的测试 changeset。应用以错误码 1 退出，Liquibase 报告 SQL 错误并释放锁；台账仍为 8 项，失败项未登记，21 个用户仍在。仅修改尚未成功执行的临时测试 changeset 为 `SELECT 1` 后重启，应用启动成功，台账为 9 项且测试项为 EXECUTED，锁释放，租户查询接口正常。临时文件和 changeset 不属于正式迁移；既有已执行 changeset 未改动。此实验只覆盖单条 SQL 无副作用失败后的重试，不证明 MySQL 多语句或 DDL 中途失败会自动回滚；部分执行需先检查实际 schema 和数据、备份并制定修复方案。

2026-11-12 DDL 部分执行试验：在独立 MySQL 8.0.33 空库，临时 changeset 先创建 `yuheng_partial_probe`，再向不存在的表插入。应用退出码为 1，失败项未登记、锁已释放，但探针表及其主键仍然存在，证明不能依靠事务回滚清除已执行的 MySQL DDL。核对探针表结构后，将尚未成功执行的临时测试 changeset 改为 `CREATE TABLE IF NOT EXISTS`，并在其前包含正式 core changelog；重启后 core 8 项及测试项完成登记，锁释放，应用启动，租户查询返回成功，21 个历史用户密码非空，操作日志 `success` 列不存在。此恢复仅适用于已核对的简单探针表，`IF NOT EXISTS` 不验证已有表的结构，不能作为通用恢复方案；本次未修改正式 changeset 或现有业务库。

发生实际迁移失败时，应先停止自动重试并备份，记录失败日志、Liquibase 台账和锁状态，再逐项对照迁移脚本检查已产生的表、列、索引及数据，制定并在隔离副本演练修复方案。不要仅凭 changeset 未登记就假设无变更，也不要直接标记成功或清除校验和。已成功执行的正式 changeset 保持不变；修复方式应根据各环境的真实状态选择，并通过追加迁移和明确的前置检查管理后续变更。

2026-11-11，使用用户授权的本地 MySQL 8.0.33 `yuheng_demo` 空库。执行前只读检查无表、例程、触发器和事件；已有的 `yuheng-demo` 库不在本次迁移范围。

- core 的 `yuheng-server` 资源提供 MySQL changelog；demo master 先包含 core，再包含 demo 自有业务链。
- 结构分为平台表、core 示例表、Quartz 2.5.2 和 Flowable 8.0.0；初始化数据独立为第五个 changeset。Flowable 脚本来自 8.0.0 的 common、identity、engine、history 和 event registry MySQL create 脚本；Quartz 源自 2.5.2 `tables_mysql_innodb.sql`，移除了 DROP。
- Liquibase 4.31.1 首次执行 5 个 changeset，第二次执行 0 个；表数 106（包含 Liquibase 两张表），台账 5 条且锁释放。`system_operate_log.success` 不存在。
- 导入源快照 6533 条 INSERT，按列清除密码和已识别的客户端密钥；文件配置的旧类名改为 `com.yuheng.platform`，已核对用户密码和文件配置中的 accessKey、accessSecret、password 非空数均为 0。此检查不是对所有可能嵌套秘密的穷尽证明。
- 清理 demo 构建目录后重新打包，确认旧的 target 生成 SQL 不再进入制品。以临时隔离 Redis、显式 `yudao.info.base-package=com.yuheng.platform` 和测试数据库配置启动 demo，Liquibase 报告无待执行 changeset，应用启动成功；进程和临时 Redis 随后停止。

## 未完成项

- 历史账号密码散列已恢复，管理员登录已验证；外部服务凭据需要部署时配置。快照密码随 seed 发布，部署环境应按自身要求更换。
- 主快照保留了历史业务、租户、菜单、任务和环境数据，需验证实际使用场景和部署适配。Quartz 历史任务、序列化数据和调度器实例状态未导入。
- demo 当前未实际依赖 Flowable；独立引擎启动和 Quartz JDBC 调度器启动已验证，任务触发和 Flowable 在 demo 中集成尚未验证。MySQL 之外的数据库方言尚未验证。
- demo 默认包扫描已调整并验证启动。已有数据库接续不在本次范围。
- 以上变更已在本地验证库执行，后续修正应追加 changeset，不能修改已执行内容或校验和。单条无副作用 SQL 和简单 DDL 部分执行后的隔离恢复已验证；真实历史库升级、权限菜单和业务读写验收仍未完成。
