# Yuheng AI 规格驱动编码与治理资产设计

日期：2026-10-25  
状态：已确认，待进入实施计划阶段  
范围：将 Athena 的 AI 规格驱动编码框架引入 Yuheng，并定义治理资产、消费端分发、阶段门禁、知识同步和验证证据链路。  
关联设计：[Yuheng 架构改造设计](./2026-10-24-yuheng-architecture-design.md)

## 1. 背景与目标

Athena 的 AI 编码能力不是 Spring Boot 运行时库，也不是 Vue 运行时插件，而是一套约束软件交付过程的治理产品。它把规则、技能、知识、阶段门禁、同步工具和验证证据组织成可版本化、可审计、可复用的交付资产。

Yuheng 引入这套能力的目标是：

- 让需求从规格进入计划，再进入实现和验证，减少直接从口头需求写代码；
- 让 AI 使用的规则、技能和知识有明确来源、版本和兼容范围；
- 让 `yuheng-core` 与 `yuheng-demo` 自身先使用这套流程，形成 dogfooding；
- 让后续产品项目可以通过固定版本消费治理资产，而不是复制一份无法升级的提示词和文档；
- 让测试、API/UI 验证、数据库迁移和 self-review 形成可复查的证据链；
- 保持治理资产与 Java/Vue 运行时依赖解耦，同时通过 manifest 约束兼容性。

本设计只定义治理架构、工作流、版本关系、门禁、同步和验收标准，不直接实现命令、脚本或业务模块迁移。

## 2. 已确认的总体决策

1. AI 治理能力作为 Yuheng 的标准能力，随消费端分发。
2. 完整产品化和分发能力放在第二阶段；阶段 0/1 先用最小闭环服务 Yuheng 自身迁移。
3. 首阶段不新增第三个治理 Git 仓库，采用“逻辑独立、物理同库、发布独立”。
4. `yuheng-core` 是通用规则、技能和框架知识的源头；`yuheng-demo` 保存固定快照、同步工具和业务增量。
5. 规则、技能和知识不进入 Spring Boot 或 Vue 的运行时依赖图。
6. Java/后端代码通过 Maven `pom.xml` 版本升级；Vue 代码通过 `package.json`/lock 版本升级；rules、skills、knowledge 通过同步命令升级。
7. 三条更新链路可以独立演进，但必须通过 manifest 和兼容矩阵校验，不能形成静默不兼容。
8. 公开入口只保留五个稳定入口，specialist skills 由框架内部路由，不要求用户记忆。
9. 新功能默认必须走 `spec → plan → delivery → verification`；紧急修复允许有限例外，但必须补齐最小规格和验证证据。
10. 治理资产、运行时代码、消费端 overlay 和交付证据分别维护，不能相互覆盖。

## 3. 目标结构

### 3.1 yuheng-core

`yuheng-core` 同时承担框架代码和治理资产源头，但治理目录不作为运行时依赖：

```text
yuheng-core/
├── governance/
│   ├── rules/                 # 通用规则、阶段门禁和任务入口约束
│   └── skills/                # 公开入口和内部 specialist skills
├── ai-knowledge/              # 框架知识源和生成输入
├── ai-knowledge-core/         # 可消费的框架知识包
├── tools/
│   └── governance/            # 生成、校验、打包、发布和兼容性检查
├── release/
│   └── yuheng-manifest.yaml  # 代码、治理和知识版本事实
└── docs/superpowers/specs/    # 治理设计和交付规格
```

规则和技能沿用 Athena 的设计思想，Yuheng 首版提供稳定的公开命名：

- `yuheng-workflow-router`
- `yuheng-full-workflow`
- `yuheng-requirement-to-spec`
- `yuheng-spec-to-plan`
- `yuheng-delivery-execution`

原有 Athena 名称可以在迁移期保留兼容别名，但消费端文档和新项目以 `yuheng-*` 为准。

### 3.2 yuheng-demo / 产品项目

```text
yuheng-demo/
├── yuheng-rules/              # core 规则快照，只能通过同步升级
├── yuheng-skills/             # core 入口和 specialist 快照
├── ai-knowledge-core/         # 与 codeVersion 对齐的知识快照
├── sync/                      # 初始化、同步、健康检查和 postcheck
├── consumer-overlay/          # 产品增量规则、领域术语、schema 和知识
├── docs/
│   ├── specs/                 # 需求规格
│   ├── plans/                 # 实施计划
│   └── verification/         # 测试与验证证据
└── yuheng-manifest.yaml       # 消费端版本锁定文件
```

`consumer-overlay` 只能新增产品规则和领域知识，不能静默替换 core 的同名规则、技能或知识条目。冲突使用唯一 ID 和 manifest 校验发现。

## 4. 版本和发布模型

### 4.1 三类主要版本

消费端使用 `yuheng-manifest.yaml` 锁定以下版本：

```yaml
codeVersion: 1.0.0
artifacts:
  server: com.yuheng:yuheng-server:1.0.0
  ui: yuheng-ui@1.0.0
governanceVersion: 1.0.0
knowledgeVersion: 1.0.0
overlayVersion: product-2026.10.25
compatibility:
  code: '>=1.0.0 <2.0.0'
  governance: '>=1.0.0 <2.0.0'
  knowledge: '>=1.0.0 <2.0.0'
sourceCommit: 9f3e8c1
generatedAt: 2026-10-25T12:00:00+08:00
```

- `codeVersion` 表示 Yuheng 运行时发布线；后端实际坐标由 Maven `pom.xml`/BOM 锁定，前端实际坐标由 NPM manifest/lock 锁定。
- `governanceVersion` 表示 rules、skills 和同步工具版本。
- `knowledgeVersion` 表示 `ai-knowledge-core` 快照版本。
- `overlayVersion` 表示消费端业务增量的版本。
- `compatibility` 明确可消费范围；不能依赖目录名称或人的记忆判断兼容性。

### 4.2 独立更新和联动更新

代码和治理资产可以独立更新：

- 代码更新：修改 `pom.xml`、`package.json` 或 lock 文件，构建和测试后验证现有治理资产仍兼容。
- 治理更新：通过 `sync --check`、`sync --apply`、`sync --verify` 更新 rules、skills、knowledge 和工具，通常不重建运行时。
- 联动更新：先读取目标 manifest，再同时更新 `codeVersion`、`governanceVersion` 和 `knowledgeVersion`。

如果规则或知识引用了新代码契约、API、目录或工具能力，`sync --verify` 必须阻断旧代码与新治理资产的组合。

### 4.3 仓库边界的后续演进

阶段 2 只做治理资产独立发布和同步，不新增第三个 Git 仓库。可以随 core 发布非运行时的 `yuheng-governance-bundle`，其中包含规则、技能、知识包、同步工具和 manifest。

当满足以下任一条件时，再评估拆出 `yuheng-governance` 仓库：

- 有两个以上独立产品消费 Yuheng；
- rules/skills 的发布频率明显高于 core 代码；
- 治理资产有独立维护团队、权限和审计边界；
- 需要独立回滚和生命周期管理；
- 治理资产对 core 仓库的评审和发布噪声已经形成实际负担。

拆库时优先使用版本化发布包和 manifest，不以 Git submodule 作为首选消费方式。

## 5. 用户入口与标准工作流

### 5.1 默认路由

用户可以只描述目标，不需要选择 specialist skill。`yuheng-workflow-router` 根据输入判断阶段并且只推荐一个公开入口。

| 输入情况 | 前置动作 | 推荐入口 |
|---|---|---|
| 新工程、模板复制、刚刷新快照 | `yuheng-init-project-postcheck` | 再判断当前阶段 |
| 依赖升级、规则同步、知识版本不确定 | `yuheng-consumer-health-check` | 修复 ERROR 后再路由 |
| 原始需求、口头想法、会议纪要 | 无 | `yuheng-requirement-to-spec` |
| 已有规格，需要视觉对齐 | 检查规格完整性 | 由 router 内部调用 `yuheng-prototype-generator`（可选） |
| 规格和原型已确认 | 检查规格与菜单需求 | `yuheng-spec-to-plan` |
| 已有计划 | 检查计划证据要求 | `yuheng-delivery-execution` |
| 报错、异常、接口或页面不正常 | 先执行日志排查 | `yuheng-delivery-execution` |

其中 `yuheng-prototype-generator`、`yuheng-init-project-postcheck` 和 `yuheng-consumer-health-check` 是内部 specialist 入口，不计入公开入口。

`yuheng-full-workflow` 负责串行执行：

```text
yuheng-requirement-to-spec
→ prototype（可选）
→ yuheng-spec-to-plan
→ yuheng-delivery-execution
→ verification / release-check
```

### 5.2 工作产物

每个工作项使用一个 `workId`，并在以下目录产生可关联文档：

- `docs/specs/`：需求目标、角色、范围、页面、接口、权限、数据、异常和验收标准；
- `docs/plans/`：任务拆解、输入输出、影响模块、依赖、TDD、API/UI 验证方式和完成标准；
- `docs/verification/`：命令输出、测试、接口响应、页面证据、失败说明、self-review 和发布结果。

文档至少记录：

```text
workId, route, phase, codeVersion, governanceVersion, knowledgeVersion
```

## 6. 阶段门禁和强制程度

### 6.1 分阶段强度

| 级别 | 阶段 | 约束 |
|---|---|---|
| L0 观察 | 阶段 0：定义契约 | 建立最小字段；失败默认 WARN，不阻碍基线盘点 |
| L1 必需 | 阶段 1：core/demo 内部试用 | 缺少规格、知识版本或验证证据时阻断；允许有期限豁免 |
| L2 发布门 | 阶段 2/3：分发与业务迁移 | manifest 不兼容不得发布；业务新功能必须 spec → plan → delivery |
| L3 质量演进 | 阶段 4：指标和评测 | 增加知识新鲜度、命中率、规则回归和模型输出评测 |

### 6.2 检查维度

1. **上下文与知识**：init、sync、health-check 是否完成，版本是否兼容，必需知识轨道是否存在。
2. **规格与计划**：范围、接口、数据、权限、异常和验收项是否完整，任务是否绑定验证方式。
3. **交付验证**：TDD、API、UI、数据库迁移和 self-review 是否有证据。
4. **发布兼容**：manifest、锁文件、API 清单、数据库模型和运行配置是否满足矩阵。

统一结果为 `PASS`、`WARN`、`BLOCKED`、`WAIVED`。缺失证据、版本不兼容、重复 ID、规则冲突和安全边界未满足时直接 `BLOCKED`。

### 6.3 豁免和紧急修复

临时例外必须记录 `governance-waiver.yaml`：

```yaml
waiverId: YH-W-001
scope: yuheng-demo-business-module
reason: legacy migration requires a staged rollout
risk: verification coverage is incomplete for one legacy path
owner: yuheng-platform-team
expiresAt: 2026-11-30T23:59:59+08:00
approval: architecture-review-board
followupTask: YH-PLAN-042
```

豁免必须有期限和责任人，过期自动变为 `BLOCKED`。阶段 1 可以允许历史迁移暂时 `WARN`，进入阶段 2 后必须收敛。

生产紧急修复可以跳过完整规格，但不能跳过回滚影响评估、最小风险记录和最小验证；在同一个 `workId` 下必须补齐规格、验证和复盘，不能形成第二套常规流程。

## 7. 知识生成、发布和同步

### 7.1 源头和生成

可复用知识只在 `yuheng-core` 定义。生成输入包括：

- `governance/rules/` 和 `governance/skills/`；
- `ai-knowledge/` 中的框架说明；
- server、UI、runtime、data、extension 的代码/API/DB/UI 契约；
- 经过验证的规格、计划和交付证据。

生成过程需要输出索引、引用关系、覆盖统计、来源提交和生成时间。规则、技能或知识不能只存在于不可追踪的提示词中。

### 7.2 发布校验

发布前至少检查：

- 规则 ID 和技能入口没有重复；
- 链接、路径、引用和依赖可解析；
- 必需知识轨道完整；
- 生成内容与 `codeVersion` 兼容；
- manifest 字段完整；
- 生成结果可以在干净消费端复现。

治理 bundle 可以独立于运行时代码发布，但必须通过兼容矩阵。

### 7.3 消费端同步

同步工具提供以下语义：

- `sync --check`：只预览新增、删除、变更、冲突和兼容问题；
- `sync --apply`：原子更新 rules、skills、knowledge、工具和 manifest；
- `sync --verify`：只执行版本、引用、冲突和兼容性校验；
- `postcheck`：同步或初始化后执行目录、工具、构建和知识健康检查。

同步不能覆盖：

- `docs/specs/`；
- `docs/plans/`；
- `docs/verification/`；
- 业务模块；
- `consumer-overlay/`。

同步必须保留上一份 manifest、同步报告和完整快照，失败时可回滚。

## 8. 消费端初始化、升级和回滚

标准生命周期为：

```text
init
→ postcheck
→ preflight
→ apply
→ verify
→ rollback（失败时）
```

### 8.1 初始化

初始化选择一个 yuheng-core release，生成目录、manifest、规则快照、技能快照、知识快照和同步工具。初始化完成后必须先执行 postcheck，不能直接开始业务编码。

### 8.2 升级前预检

`preflight` 读取目标 manifest，检查：

- 当前 code、governance、knowledge 和 overlay 版本；
- 目标版本的兼容范围；
- 规则、技能、知识和业务 overlay 的冲突；
- API、数据库、UI 和运行配置契约变化；
- 需要重新执行的测试和验证。

### 8.3 执行和验证

代码升级修改 Maven/NPM 版本；治理升级走同步命令。可以独立执行，也可以在同一变更中联动执行。所有变更完成后执行 health-check、构建、测试、契约验证和 postcheck。

### 8.4 回滚

任一阶段失败时恢复上一份 manifest 和治理快照，保留失败报告和差异。代码依赖回滚与治理快照回滚可以分别执行，但最终必须重新通过完整 release-check。

## 9. 测试、验证和证据

### 9.1 标准验证链

```text
preflight
→ TDD（红灯到绿灯）
→ API verification
→ UI verification（涉及页面时）
→ self-review
→ release-check
```

### 9.2 变更到验证映射

- `core/server`：单元、集成、认证、权限、`tenant_id`、数据库迁移和 API 契约；
- `rules/skills/knowledge`：入口解析、链接路径、重复 ID、知识覆盖、manifest 兼容和同步幂等性；
- API/data：正常、失败、权限、租户隔离、分页、错误码和旧接口回归；
- UI：构建、登录、布局、动态菜单、关键页面和浏览器交互证据。

### 9.3 verification 文档

每个 `workId` 至少关联一份 `verification.yaml`：

```yaml
workId: YH-2026-001
specId: YH-SPEC-2026-001
planId: YH-PLAN-2026-001
phase: delivery
codeVersion: 1.0.0
governanceVersion: 1.0.0
knowledgeVersion: 1.0.0
checks:
  - command: mvn -pl yuheng-demo-server-bootstrap test
    result: PASS
    evidence: docs/verification/YH-2026-001/maven-test.log
status: PASS
reviewer: yuheng-platform-team
```

原始测试输出、API 响应、截图或页面录屏、数据库结果和 release report 必须保留路径。失败记录包含失败类型、影响范围、临时措施、修复提交和下一次重跑范围。

### 9.4 失败处理

| 状态 | 处理 |
|---|---|
| `BLOCKED` | 修复后重跑受影响检查，最后完整执行 release-check；不允许发布 |
| `WARN` | 记录风险、责任人和期限；是否允许继续由阶段门禁决定 |
| `PASS` | 归档 verification，进入下一阶段 |
| `WAIVED` | 关联 waiver、过期时间和补偿任务；过期自动阻断 |

修复后可以先重跑受影响范围，但最终仍需完整门禁。不使用忽略全部错误、删除失败证据或手工修改结果的方式获得假通过。AI 只能基于可复查证据输出完成或通过结论，发布前需要人工审阅验证证据和豁免。

## 10. 分阶段实施路线

### 阶段 0：最小 AI 契约

- 定义 `workId`、`spec`、`plan`、`verification`、`manifest` 和 `waiver` 最小字段；
- 在 `yuheng-core` 和 `yuheng-demo` 建立最小目录；
- 实现 router、spec、plan、delivery、verification 的最小规则；
- 默认输出 WARN，不影响架构基线盘点。

门禁：字段、路径、版本关系和最小示例齐全。

### 阶段 1：内部 dogfooding

- Yuheng 架构迁移、core/demo 分层和业务迁移任务使用完整闭环；
- 实现 init/postcheck、health-check、sync verify 的最小能力；
- 产出真实规格、计划和验证证据；
- 建立错误分类、豁免和回滚样例。

门禁：缺少规格、知识版本或关键验证证据时阻断。

### 阶段 2：治理资产分发

- 随 core 发布治理 bundle；
- 消费端通过 manifest 和同步命令绑定版本；
- 实现差异报告、冲突检测、原子更新和回滚；
- 在干净环境验证仅通过版本化 core 产物和治理快照即可初始化 demo。

门禁：manifest、code/governance/knowledge 兼容矩阵和同步报告通过。

### 阶段 3：业务迁移强制闭环

- BPM、支付、商城、CRM、ERP 等业务模块迁移必须走 `spec → plan → delivery → verification`；
- 数据库、API、UI 和菜单变更都必须有对应证据；
- 历史模块的临时豁免按期限收敛。

门禁：业务模块没有完整证据不能进入正式发布。

### 阶段 4：质量演进和按需拆库

- 增加知识新鲜度、覆盖率、命中率、规则回归集和模型输出评测；
- 统计 WARN、BLOCKED、WAIVED 和紧急修复的类型与趋势；
- 根据多产品复用、组织边界和发布节奏评估是否拆出 `yuheng-governance` 仓库；
- 插件扩展必须服从相同 manifest 和门禁。

## 11. 风险与控制

| 风险 | 控制 |
|---|---|
| 治理资产与代码版本漂移 | manifest + compatibility matrix + sync verify |
| 消费端复制后形成静默分叉 | core 快照只读；overlay 独立命名和冲突检测 |
| 同步覆盖业务交付记录 | 同步工具限制可写路径；同步前差异预览 |
| AI 直接越过规格进入编码 | workflow router 和阶段门禁；缺少 spec 直接阻断 |
| 规则过早强制导致迁移停滞 | 阶段 0/1 使用 WARN；阶段 2/3 再逐步阻断 |
| 失败被“忽略错误”掩盖 | 保留原始输出；release-check 只认可复查证据 |
| 治理仓库过早拆分 | 阶段 2 先独立 bundle；达到触发条件再拆库 |
| 代码知识过期 | 记录来源提交和生成时间；契约变化触发重生成检查 |

## 12. 完成标准

设计进入实施计划前，必须满足：

1. `yuheng-core` 与 `yuheng-demo` 的治理资产归属明确；
2. 五个公开入口和内部 specialist 路由明确；
3. 阶段 0/1/2/3/4 的门禁强度和豁免规则明确；
4. `codeVersion`、`governanceVersion`、`knowledgeVersion`、`overlayVersion` 的关系明确；
5. 代码升级和治理资产升级的独立路径、联动路径和兼容校验明确；
6. 初始化、升级、健康检查、同步、验证和回滚流程明确；
7. 规格、计划、验证证据和 manifest 的关联字段明确；
8. core、治理资产、业务 overlay 和交付记录的覆盖边界明确；
9. 测试、API/UI 验证、数据库迁移和 release-check 的证据要求明确；
10. 尚未决定的实现细节可以进入实施计划，但不得改变上述边界和版本原则。

## 13. 首轮不做

- 不在 Spring Boot 或 Vue 运行时中嵌入 AI 治理依赖；
- 不在阶段 1 直接新增第三个治理 Git 仓库；
- 不把所有业务规则和业务知识上收进 `yuheng-core`；
- 不以复制目录代替版本化同步；
- 不把所有阶段一开始都设置为阻断；
- 不允许无规格、无计划、无验证证据的常规业务编码；
- 不引入与现有 Yuheng 架构无关的微服务、插件宿主或多数据库改造。
