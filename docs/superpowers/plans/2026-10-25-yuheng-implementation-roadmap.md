# Yuheng Architecture and AI Governance Implementation Plan

> **For agentic workers:** Use this plan task-by-task with explicit checkpoints. Do not commit or create a pull request unless the user later authorizes it.

**Goal:** 将 `ruoyi-vue-pro` 逐步演进为可发布的 `yuheng-core` + 消费端体系，并把 Athena 的 AI 规格驱动编码能力落成可同步、可验证、可回滚的治理资产。

**Architecture:** 先在基线仓库中确认模块、API、数据库和前端契约，再完成 core/demo 的逻辑分层；治理资产在 `yuheng-core` 中维护，消费端通过 manifest 和同步工具获取快照。运行时代码升级走 Maven/NPM，rules、skills、knowledge 走治理同步，三者通过兼容矩阵校验。

**Tech Stack:** Java/Maven/Spring Boot/MyBatis/Liquibase、Vue 3 + Element Plus、Python 3 治理脚本、Markdown/YAML manifest、现有 Athena rules/skills/knowledge 资产。

---

## 1. 当前完整性判断

两份设计已经形成完整的**目标蓝图**：

- `2026-10-24-yuheng-architecture-design.md` 定义运行时架构、模块边界、数据/API/租户语义、迁移阶段和完成标准；
- `2026-10-25-yuheng-ai-governance-design.md` 定义 AI 入口、规则/技能/知识版本、同步、门禁、证据和回滚。

它们还不是可以直接执行的完整功能框架，实施前必须补齐：

1. 当前 ruoyi 后端、数据库、API、前端和启动配置的冻结基线；
2. `yuheng-core` 和消费端的真实项目身份；当前 `yuheng-core` 只有文档，`/Users/huhua/study/ai/yuheng/yuheng-demo` 是消费端空工程，`/Users/huhua/study/ai/yuheng/demo` 仍然是 Athena 母版参考工程；
3. `yuheng-manifest.yaml`、兼容矩阵和治理 bundle 的可执行格式；
4. sync、postcheck、health-check、verify、rollback 的脚本实现；
5. core 对外的 Maven/NPM 发布结构和消费端干净环境构建；
6. 数据库、API、前端路由和权限租户行为的回归证据；
7. 发布流水线、artifact registry、版本提升和人工审核流程。

前端基线已经独立恢复在 `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`，包含 `package.json`、`pnpm-lock.yaml`、Vite 配置和完整 `src`；后续从该目录提取 `yuheng-ui`，不再使用 ruoyi 仓库内的占位目录。

## 2. 实施顺序和不可越过的原则

- 先盘点和冻结，再迁移；不把重命名、拆仓、包名重写和行为改造叠加到第一步。
- 先让 `yuheng-core`/消费端的 AI 最小闭环跑通，再用它约束后续迁移，形成 dogfooding。
- 先完成 system/infra 基座，再迁移一个业务模块试点，最后批量迁移业务域。
- 先以版本化发布包消费 core，暂不使用源码引用；治理资产也以 bundle 和 manifest 消费。
- 阶段 0/1 以 WARN 为主，阶段 2/3 才对新功能和发布启用 BLOCKED。
- 所有阶段保留现有数据库、API、JSON、错误码和共享库 `tenant_id` 语义。
- 不提交 Git、不创建 PR；每个检查点只输出可审阅的文件、报告和命令结果。

## 3. Task 1：建立仓库身份和基线快照

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/baseline/repository-identity.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/baseline/backend-module-inventory.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/baseline/database-contract-inventory.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/baseline/api-contract-inventory.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/baseline/frontend-contract-inventory.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/baseline/compatibility-matrix.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/baseline/decision-log.md`

- [x] **Step 1: 固定当前仓库身份**

记录以下事实：

```text
source repository: /Users/huhua/study/ai/yuheng/ruoyi-vue-pro
framework target: /Users/huhua/study/ai/yuheng/yuheng-core
current consumer candidate: /Users/huhua/study/ai/yuheng/yuheng-demo
frontend source: /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3
athena reference demo: /Users/huhua/study/ai/yuheng/demo
athena reference: /Users/huhua/study/ai/yuheng/athena-core
```

明确并固定项目身份：保留 `/Users/huhua/study/ai/yuheng/demo` 的 Athena 参考身份，使用已经建立的 `/Users/huhua/study/ai/yuheng/yuheng-demo` 作为 Yuheng 消费端，避免两种母版混在一个生命周期中。

- [x] **Step 2: 导出后端模块和依赖基线**

运行：

```bash
find /Users/huhua/study/ai/yuheng/ruoyi-vue-pro -name pom.xml -print | sort
rg -n 'module|artifactId|groupId|version' /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/pom.xml
rg -n 'artifactId|dependency' /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-server/pom.xml /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-module-system/pom.xml /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-module-infra/pom.xml
```

将实际结果写入 `backend-module-inventory.md`，标出 core 候选模块、业务候选模块、启动入口和跨边界依赖。

- [x] **Step 3: 导出 API、数据库和前端证据**

使用仓库实际存在的 controller、DTO、Liquibase/SQL、路由和 Store 文件生成清单。前端基线不完整时，在 `frontend-contract-inventory.md` 明确记录阻断原因，不补写猜测内容。

- [x] **Step 4: 建立兼容矩阵和决策日志**

`compatibility-matrix.md` 至少包含：数据库表/字段、核心 API 路径、JSON 字段、错误码、租户字段、启动参数、前端路由和版本来源。`decision-log.md` 记录每个暂缓决策的原因和重新评估条件。

- [x] **Step 5: 执行基线验证（依赖环境阻塞已分类）**

运行：

```bash
git -C /Users/huhua/study/ai/yuheng/ruoyi-vue-pro status --short
git -C /Users/huhua/study/ai/yuheng/ruoyi-vue-pro rev-parse HEAD
mvn -DskipTests validate -f /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/pom.xml
```

如果 Maven 私有镜像不可用，记录完整下载错误和已下载依赖；不把网络失败误判为代码失败。Task 1 的门禁是基线文件齐全、仓库身份明确、构建环境问题已分类。

## 4. Task 2：落地 AI 最小契约和治理验证器

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/release/yuheng-manifest.schema.yaml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/release/compatibility-matrix.yaml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/rules/yuheng-ai-operating-principles.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/rules/yuheng-task-entry.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/rules/yuheng-phase-gate.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/skills/yuheng-workflow-router/SKILL.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/skills/yuheng-requirement-to-spec/SKILL.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/skills/yuheng-spec-to-plan/SKILL.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/skills/yuheng-delivery-execution/SKILL.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/governance/skills/yuheng-full-workflow/SKILL.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/verify_manifest.py`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/verify_bundle.py`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/tests/test_verify_manifest.py`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/tests/test_verify_bundle.py`

- [x] **Step 1: 先写 manifest 的失败用例**

测试必须覆盖：缺少 `codeVersion`、缺少 `governanceVersion`、重复 overlay ID、版本范围不满足和合法 manifest。

运行：

```bash
python3 -m unittest discover -s /Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/tests -v
```

预期：在实现验证器前出现导入或断言失败。

- [x] **Step 2: 实现最小 manifest 验证器**

验证器只负责字段完整性、版本格式、兼容范围、来源提交、生成时间和 overlay 冲突；不读取业务代码，不调用 AI 模型。

- [x] **Step 3: 实现 bundle 校验器**

校验规则和技能入口唯一、Markdown 引用路径存在、必需知识轨道存在、manifest 中的版本与目录元数据一致。

- [x] **Step 4: 实现 PASS/WARN/BLOCKED/WAIVED 输出**

输出 JSON 和人类可读报告，包含状态、失败项、证据路径、修复建议和版本组合。

- [x] **Step 5: 重跑测试并归档最小证据**

```bash
python3 -m unittest discover -s /Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/tests -v
```

预期：manifest 和 bundle 的正向、反向用例全部通过；失败用例必须显示确定性错误，不允许吞掉异常。

## 5. Task 3：把现有 Athena 同步能力改造成 Yuheng 消费端能力

**Files:**

- Source: `/Users/huhua/study/ai/yuheng/demo/sync/skills/sync-specs/`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/sync/skills/sync-specs/SKILL.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/sync/skills/sync-specs/scripts/sync-specs-api.py`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/sync/skills/sync-specs/scripts/postcheck_project.py`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/sync/skills/sync-specs/scripts/init-project.py`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-manifest.yaml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/.yuheng/project.yaml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/docs/verification/governance-sync/README.md`
- Test: `/Users/huhua/study/ai/yuheng/yuheng-demo/sync/skills/sync-specs/scripts/test_sync_specs_api.py`
- Test: `/Users/huhua/study/ai/yuheng/yuheng-demo/sync/skills/sync-specs/scripts/test_init_project.py`

- [x] **Step 1: 先保留 Athena 兼容入口**

保留现有 `athena-rules`、`athena-skills`、`ai-knowledge-core` 的读取兼容，但在 manifest 中声明它们属于旧名称空间；新同步路径写入 `yuheng-rules`、`yuheng-skills` 和 `ai-knowledge-core`。

- [x] **Step 2: 为同步增加 check/apply/verify 语义**

`--check` 只生成差异，`--apply` 暂存后原子替换托管目录，`--verify` 不修改文件。失败时保留当前快照和报告。

- [x] **Step 3: 保护消费端目录**

同步脚本必须拒绝覆盖：

```text
docs/specs
docs/plans
docs/verification
业务源码
consumer-overlay
```

- [x] **Step 4: 增加初始化后体检**

postcheck 验证项目身份、manifest、治理目录、版本兼容、知识轨道和脚本版本；ERROR 阻断后续路由，WARN 写入报告。

- [x] **Step 5: 运行同步与初始化测试**

```bash
python3 -m unittest discover -s /Users/huhua/study/ai/yuheng/yuheng-demo/sync/skills/sync-specs/scripts -p 'test_*.py' -v
```

预期：现有 Athena 协议测试保持通过，同时新增 Yuheng manifest 和保护路径用例。

## 6. Task 4：在 ruoyi 仓库内完成逻辑分层

**Files:**

- Modify: `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro/pom.xml`
- Modify: `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-dependencies/pom.xml`
- Modify: `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-framework/pom.xml`
- Modify: `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-module-system/pom.xml`
- Modify: `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-module-infra/pom.xml`
- Modify: `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-server/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/migration/phase-1-boundary-report.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/verification/phase-1-core-demo-boundary.md`

- [x] **Step 1: 只调整依赖所有权，不重写包名（审计确认现有有效模块已满足候选边界，未改源 POM）**

把 `yudao-dependencies`、`yudao-framework`、`yudao-module-system` 和 `yudao-module-infra` 标记为 core 候选；把 `yudao-server` 的启动职责和业务模块标记为消费端候选。保留 `cn.iocoder.boot` 包名。

- [x] **Step 2: 建立依赖方向检查**

检查 core 候选模块不依赖 BPM、支付、商城、CRM、ERP 等业务模块；业务模块只能依赖公开的 framework/system/infra 契约。

- [x] **Step 3: 加入结构级回归**

使用 Maven dependency tree、ArchUnit 或等价静态检查验证：

```text
business -> yuheng-server/public-contract
core -X-> business
```

- [x] **Step 4: 保持启动和数据库行为不变（本阶段未改运行时）**

先不改表名、字段、错误码、tenant_id、Liquibase changeset 和 REST 路径；使用现有启动入口验证 system/infra API。

- [x] **Step 5: 生成阶段 1 边界报告**

报告列出已完成边界、临时反向依赖、组件扫描风险、Liquibase 入口和未迁移模块。边界报告未通过前不拆仓。

## 7. Task 5：建立真正的 yuheng-core 发布工程

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-dependencies/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-framework/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-module-system/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-module-infra/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-server/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/release/publish-manifest.yaml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/release/core-consumption.md`

- [x] **Step 1: 从阶段 1 边界报告复制模块，不改变业务行为**

只迁移已经证明属于 core 的代码和资源；每个模块保留测试、配置元数据、Mapper XML、Liquibase baseline 和公开 DTO。

- [x] **Step 2: 建立统一 BOM 和版本线**

`yuheng-dependencies` 管理 Spring Boot、MyBatis、Redis、任务、消息、监控和测试依赖；`yuheng-server` 作为消费端稳定入口。

- [ ] **Step 3: 验证 core 独立构建（依赖环境阻塞，已归档证据）**

```bash
mvn -DskipTests package -f /Users/huhua/study/ai/yuheng/yuheng-core/pom.xml
mvn test -f /Users/huhua/study/ai/yuheng/yuheng-core/pom.xml
```

预期：core 不需要业务模块源码即可构建，测试报告中没有跳过关键模块的隐性成功。

- [ ] **Step 4: 发布本地测试产物（等待 Maven 依赖环境恢复）**

使用本地 Maven repository 验证消费端只通过 `com.yuheng:yuheng-server` 和同版本 BOM 构建，不使用 core 源码引用。

## 8. Task 6：恢复前端基线后拆分 yuheng-ui

**Files:**

- Source: `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/package.json`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/src/index.ts`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-ui/docs/public-contract.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/verification/frontend-core-boundary.md`

- [ ] **Step 1: 先恢复 package.json、构建配置和完整入口**

前端基线已经具备；先依据 `package.json`、`pnpm-lock.yaml`、Vite 配置和完整 `src` 导出依赖、路由和 Store 清单，再开始拆分。

- [ ] **Step 2: 盘点平台和业务职责**

平台进入 `yuheng-ui`：登录、布局、路由守卫、权限、Store、请求层、通用组件、system/infra 页面。业务 API、页面和路由留在消费端。

- [ ] **Step 3: 建立 NPM 公共入口**

公共入口只暴露稳定 Store、请求层、布局和组件契约；业务页面不能导入 yuheng-ui 内部实现路径。

- [ ] **Step 4: 验证构建和关键页面**

执行项目真实 package manager 的 install、typecheck、lint、build 和浏览器 smoke；将关键页面证据写入 `frontend-core-boundary.md`。

## 9. Task 7：建立 yuheng-demo 消费端和业务试点

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-demo-server-bootstrap/pom.xml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/yuheng-manifest.yaml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/docs/specs/`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/docs/plans/`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/docs/verification/`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/business/`

- [ ] **Step 1: 只消费版本化 core 产物**

bootstrap 只依赖 `com.yuheng:yuheng-server`、`yuheng-ui` 和 manifest 指定的治理快照，不引用 yuheng-core 源码。

- [ ] **Step 2: 组合 core 和业务 Liquibase**

core baseline 和业务 changelog 由唯一入口按固定顺序组合；已执行 changeset 不修改，升级失败保留原始错误和回滚报告。

- [ ] **Step 3: 选择一个低风险业务模块试点**

优先选择边界清晰、依赖 system/infra、数据库和页面数量可控的模块。试点必须完整走 spec、plan、delivery、verification，并记录迁移时间、反向依赖和兼容问题。

- [ ] **Step 4: 在干净环境启动消费端**

只安装 Maven 版本化产物和治理快照，执行初始化、postcheck、数据库初始化、启动和核心 API 回归；前端继续使用独立目录 `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`，直到 `yuheng-ui` / `yuheng-demo-ui` 拆分完成。

## 10. Task 8：发布、CI 和质量指标

**Files:**

- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/.github/workflows/core-verify.yml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/.github/workflows/governance-bundle.yml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-demo/.github/workflows/consumer-verify.yml`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/release/compatibility-policy.md`
- Create: `/Users/huhua/study/ai/yuheng/yuheng-core/docs/release/release-checklist.md`

- [ ] **Step 1: core pipeline**

执行依赖边界检查、Maven build/test、manifest 校验、bundle 校验和治理资产打包。

- [ ] **Step 2: consumer pipeline**

执行 sync verify、postcheck、core artifact consumption、数据库迁移、API 回归、前端构建和 verification 归档。

- [ ] **Step 3: 发布检查**

发布前必须同时检查 codeVersion、governanceVersion、knowledgeVersion、锁文件、API 清单、数据库模型和运行配置契约。

- [ ] **Step 4: 建立质量指标**

先记录 WARN、BLOCKED、WAIVED、紧急修复和同步失败；阶段 4 再加入知识新鲜度、覆盖率、命中率和规则回归评测。

## 11. 阶段出口条件

### 阶段 0：基线盘点

- 仓库身份明确：`demo` 保留为 Athena 参考，`yuheng-demo` 作为 Yuheng 消费端；
- `yudao-ui-admin-vue3`、backend、database、API、启动和依赖基线齐全；
- Maven 私有镜像或离线依赖策略已验证；
- 前端基线使用 `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`，不再从 ruoyi 仓库内占位目录猜测。

### 阶段 1：内部 dogfooding

- manifest、verify、postcheck、sync verify 可执行；
- core/demo 自身的迁移任务留下规格、计划和验证证据；
- WARN/BLOCKED/WAIVED 和回滚路径有真实样例。

### 阶段 2：发布线外置

- `yuheng-core` 可以独立构建并发布 server/ui/bundle；
- 消费端只使用版本化产物；
- 干净环境可以初始化和启动消费端；
- manifest 兼容矩阵和同步回滚通过。

### 阶段 3：业务迁移

- 至少一个业务模块完整迁移并通过 API、UI、数据库、权限和租户验证；
- 业务模块不引用 core 内部实现；
- 迁移报告可以复现。

### 阶段 4：质量演进

- 多产品消费、独立治理发布或组织边界已经出现；
- 指标能说明规则、知识和验证质量；
- 以数据决定是否拆出 `yuheng-governance` 仓库或引入插件扩展。

## 12. 计划自检

- 运行时架构、AI 治理、同步、版本、门禁、验证和回滚均有对应任务；
- 前端缺失基线被明确记录为前置阻断，而不是通过猜测继续；
- 代码版本和治理资产版本的独立更新路径有单独任务；
- 当前没有提交、推送、合并或创建 PR 的步骤；
- 计划中的每个任务都有明确文件、命令、验收条件和执行边界。
