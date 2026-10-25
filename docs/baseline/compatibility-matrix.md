# Yuheng 基线兼容矩阵

盘点日期：2026-10-25  
基线输入：

- 后端：`ruoyi-vue-pro@128a0e3bd3`
- 前端：`yudao-ui-admin-vue3@050bac1ec`
- 消费端：`yuheng-demo@2ab34ae`
- core：`yuheng-core@54600e6`

## 当前兼容事实

| 维度 | 当前事实 | Yuheng 首轮要求 | 状态 |
|---|---|---|---|
| Java 包名 | `cn.iocoder.yudao` / `cn.iocoder.boot` | 暂不重写，后续独立迁移 | 已确认 |
| 后端版本 | `2026.09-SNAPSHOT` | 由 `yuheng-server` 和 BOM 统一发布 | 待实现 |
| 前端版本 | `2026.09-snapshot` | 发布 `yuheng-ui`，消费端锁定 NPM 版本 | 待实现 |
| 数据库基线 | 多方言 SQL 快照 | 先选 MySQL 行为基线，再设计增量迁移 | 待确认 |
| 应用迁移工具 | 主模块未发现 Liquibase/Flyway entry | 目标方案需要独立验证 | 待设计 |
| API | system/infra 路由和 JSON 已存在 | 保持路径、字段、错误码和分页契约 | 待快照 |
| 租户 | framework 中有 tenant 配置、上下文和拦截器 | 保留共享库行级 `tenant_id` | 待集成验证 |
| 前端 | Vue3 + Element Plus | 平台与业务拆分 | 待边界清单 |
| 治理资产 | Athena demo 已有规则、技能、同步和知识样例 | Yuheng 使用独立 manifest 和 bundle | 待实现 |
| 消费端 | `yuheng-demo` 只有 README | 只依赖版本化 core，不引用源码 | 待实现 |

## 版本关系

```text
codeVersion
├── Maven: com.yuheng:yuheng-server
└── NPM: yuheng-ui

governanceVersion
├── yuheng-rules
├── yuheng-skills
└── sync/postcheck/verify

knowledgeVersion
└── ai-knowledge-core
```

三类版本可以独立提升，但必须由 manifest 的兼容范围校验。治理或知识引用了新代码能力时，旧 codeVersion 与新资产组合必须阻断。

## 未决兼容项

1. 首轮是否只发布 MySQL，还是同时为 PostgreSQL、Oracle、DM 保留初始化验证；
2. 现有 SQL 快照转换为增量 changelog 的具体工具和历史数据策略；
3. `yuheng-ui` 的平台页面边界，以及业务前端是否继续以独立仓库发布；
4. core 公开 DTO、事件、SPI 和配置键的稳定性等级；
5. Maven 私有镜像、NPM registry 和治理 bundle 的发布位置。
