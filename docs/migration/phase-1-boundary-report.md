# Phase 1 core / demo 边界报告

盘点日期：2026-10-25  
后端基线：`/Users/huhua/study/ai/yuheng/ruoyi-vue-pro@128a0e3bd3`

## 当前结论

当前 Maven 根工程已经把 `yudao-dependencies`、`yudao-framework`、`yudao-module-system` 和 `yudao-module-infra` 作为激活模块；`yudao-server` 负责启动和模块聚合。业务模块仍以注释形式保留，没有加入当前有效 reactor。

因此，第一阶段可以把前四个模块视为 core 候选，把 `yudao-server` 的启动职责视为消费端候选。这个结论只描述逻辑边界，尚未表示物理代码已经迁入 `yuheng-core`。

## 依赖方向审计

使用 Python `xml.etree.ElementTree` 读取有效 XML 节点，只统计当前生效的 `<dependency>`，不把注释中的业务模块算作依赖：

| 模块 | 有效 `yudao-module-*` 依赖 | 结论 |
|---|---|---|
| `yudao-dependencies` | 无 | BOM 不引用业务模块 |
| `yudao-framework` | 无 | 没有业务模块反向依赖 |
| `yudao-module-system` | `yudao-module-infra` | core 内部依赖，需保持公开契约 |
| `yudao-module-infra` | 无 | 没有业务模块反向依赖 |
| `yudao-server` | `yudao-module-system`、`yudao-module-infra` | 启动聚合职责，后续下沉到消费端 bootstrap |

当前没有发现 core 候选模块对 BPM、支付、商城、CRM、ERP 等 `yudao-module-*` 业务模块的有效依赖。`yudao-dependencies` 中存在较多可选第三方库（例如 Spring AI、Flowable、支付和报表库），它们属于统一 BOM 的版本所有权，不能仅凭 BOM 条目判定为 core 运行时依赖。

## 已完成边界

- 保留 `cn.iocoder.yudao` 和 `cn.iocoder.boot` 包名；
- 保留 REST 路径、JSON、错误码和 `tenant_id` 语义；
- 保留 system 对 infra 的当前依赖方向；
- 明确 `yudao-server` 是启动聚合层，不把它直接当作可发布 core API；
- 记录业务模块仍未迁移，避免把注释模块误判为已完成边界。

## 临时反向依赖和风险

1. `yudao-server` 仍然把 system/infra 组装在同一个启动入口，组件扫描边界尚未隔离；
2. `yudao-module-system` 依赖 infra，拆分时必须保留 infra 的公开 DTO、Mapper 和配置元数据；
3. `yudao-dependencies` 仍然包含业务和基础设施第三方库，建立 `yuheng-dependencies` 时需要按实际 runtime 使用情况重新收敛；
4. 当前主模块没有应用级 Liquibase/Flyway entry，数据库 baseline 仍是 SQL 快照事实；
5. Maven 私有镜像和前端依赖环境尚未完成可重复构建验证。

## 本阶段没有做的事情

- 没有修改 ruoyi 的 POM、Java 包名、表名、字段、REST 路径或数据库脚本；
- 没有把注释中的业务模块重新激活；
- 没有把 `yudao-server` 复制为 `yuheng-server`；
- 没有在边界未通过前进行物理拆仓。

下一阶段应从本报告提取已证明的 core 模块，建立真正的 `yuheng-core` Maven 发布工程，再用版本化产物让 `yuheng-demo` 消费。
