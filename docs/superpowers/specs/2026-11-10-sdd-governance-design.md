---
workId: YH-20261110-sdd-governance
status: FROZEN
codeVersion: 0.1.0-SNAPSHOT
governanceVersion: 0.2.0
knowledgeVersion: 0.1.0
approval: 用户于2026-11-10明确要求参考athena-core调整yuheng-core的skill及rule以支持AI进行SDD编码
---

# Yuheng SDD 技能与规则设计

本次目标：参考 Athena 的四个公开入口、专项技能编排和前后置门禁，使 AI 能在 Yuheng 中执行 Spec Driven Development。用户已授权调整 skill/rule，本次修改限于治理资产、加载入口和验证工具。

## 现状与选择

- Athena 使用 `<skill-name>/SKILL.md`，规格、计划、交付和知识路由相互引用。
- Yuheng 的 `governance/skills/` 只有五份简略说明，缺少标准 `name/description`；`.claude/skills/` 是另一套平铺文档，缺少被引用的 `yuheng-spec-to-plan`。
- 规则中的全 POST、静态 `request`、`useMenuStore` 与源码不符。框架兼容基线要求保留原路由和请求响应行为。

选择以 `governance/` 为统一维护来源，安装到 `.agents/skills/`、`.claude/skills/` 和 `.claude/rules/`。仅修补平铺文档会保留两套来源；直接复制 Athena 会带入错误的技术契约，因此均不采用。原有技术规则先保留有效约束，再定向修正错误内容。

## 产物契约

每项工作使用同一个 `workId`，关联 `codeVersion`、`governanceVersion`、`knowledgeVersion`。规格保存在 `docs/specs/<workId>.md`，计划保存在 `docs/plans/<workId>.md`，证据保存在 `docs/verification/<workId>/`。

需求使用 `REQ-*`，验收使用 `AC-*`，计划使用 `T-*`，验证记录建立三者与测试、命令、日志之间的对应关系。共享模板随技能打包。

规格和计划区分草稿、待评审、冻结；冻结须记录用户确认或既有授权的具体来源。用户仅要求分析时不扩展为编码；用户明确授权实施时，范围内的技术细节和文档补录不反复要求审批。未确定的业务行为、破坏性变更和实际未完成验证不能靠 AI 自行宣布通过。

## 流程与边界

四个公开入口为 requirement-to-spec、spec-to-plan、delivery-execution、workflow-router；full-workflow 为串联入口。专项技能覆盖需求探索、任务拆解、知识路由、后端、页面、菜单权限、API/UI 验证、初始化检查、TDD 和交付审查。

业务任务必须识别属于 core 还是消费端。现有 HTTP 方法、VO/DO、Service 接口、请求解包行为与权限模型以源码契约为依据；知识与源码冲突需记录并纠正，禁止把 Athena 约定机械套用到 Yuheng。

每阶段记录 PASS/WARN/BLOCKED/WAIVED。缺失必需证据为 BLOCKED；未运行测试不得标记 PASS。原型按页面复杂度和既有设计判断，不强制所有局部修改创建原型。

## 安装、兼容与验证

本地安装器采用相对链接，避免维护三份技能副本；规则复制与迁移须保留工作区已有修改。既有平铺技能改为兼容指引，实际执行读取标准技能。消费端同步仍使用现有 `governance/skills`、`governance/rules` 协议，技能之间的链接使用相对兄弟路径。

验证包括现有治理单测、标准技能元数据和资源引用检查、本地安装一致性检查、临时消费端快照同步，以及独立代理的情景验证。验证工具不调用模型、不修改运行时代码，不把结构检查解释为实际业务端到端验收。

## 需求与验收编号

| 需求 | 范围 |
|---|---|
| REQ-001 | 标准技能可发现，四入口及专项技能串成 SDD 流程 |
| REQ-002 | 规格、计划、证据的路径、版本、确认和追踪一致 |
| REQ-003 | 技术规则符合 Yuheng 实际契约并保留有效保护约束 |
| REQ-004 | 来源统一、本地安装与消费端快照可核验 |

| 验收 | 需求 | 可观测结果 |
|---|---|---|
| AC-001 | REQ-001 | 全部标准技能通过元数据校验，内部技能/资源引用存在 |
| AC-002 | REQ-001、REQ-002 | 情景验证正确处理原始需求、已有计划、验证缺证据与授权延续 |
| AC-003 | REQ-002 | 三份模板包含同一 workId、三类版本和 REQ/AC/T 对应字段 |
| AC-004 | REQ-003 | 规则与检查过的 Controller、Service、UI 导出、请求解包契约一致 |
| AC-005 | REQ-004 | 治理测试、bundle、安装一致性与临时消费端同步验证通过；用户原有无关修改保留 |
