# Yuheng 基线决策日志

盘点日期：2026-10-25

| 编号 | 决策 | 原因 | 影响 |
|---|---|---|---|
| BL-001 | `ruoyi-vue-pro` 作为后端兼容基线 | 当前模块、API、SQL 和测试均来自该仓库 | 首轮保留数据库、REST、JSON、错误码和 tenant_id 语义 |
| BL-002 | `yudao-ui-admin-vue3` 作为前端基线 | 该目录拥有完整 Vue3 工程、锁文件和构建配置 | 前端拆分从独立目录开始，不使用 ruoyi 内占位目录 |
| BL-003 | `yuheng-demo` 作为消费端目标工程 | 当前已建立独立 Git 工程 | 需要从空骨架接入 core 和业务模块 |
| BL-004 | `/demo` 只作为 Athena 参考母版 | README、rules、skills、sync 和 knowledge 都是 Athena 体系 | 不把 Athena demo 直接当作 Yuheng 消费端 |
| BL-005 | `yuheng-core` 先承载设计和基线文档 | 目前还没有运行时模块 | 先完成 Task 1/2，再建立 Maven/NPM 发布结构 |
| BL-006 | 数据库先以 SQL 快照事实为准 | 主模块没有应用级 Liquibase/Flyway entry | Liquibase baseline 属于后续设计，不得直接假设已存在 |
| BL-007 | 先保留 `cn.iocoder` 包名 | 降低拆仓、包名和行为同时变化的风险 | 命名空间迁移单独立项 |
| BL-008 | 不提交 Git | 用户已明确要求不提交 | 所有阶段使用工作区文件和报告交付 |
| BL-009 | Task 1 允许在依赖环境阻塞下进入 Task 2 | 基线盘点和构建环境分类已完成，Maven mirror 与前端依赖安装属于后续构建门禁 | 后续 core/demo 构建前必须重新执行后端和前端验证 |

## 下一检查点

Task 1 完成后进入 Task 2 前，需要确认：

- 是否以 MySQL 作为第一行为基线；
- 是否把现有 Athena sync 脚本迁移到 `yuheng-demo`，并保留 `/demo` 只读参考；
- 是否接受 `yuheng-core` 的第一版公开模块范围为 framework + system + infra；
- 是否允许在 `yuheng-demo` 中建立后端 bootstrap 空工程。
