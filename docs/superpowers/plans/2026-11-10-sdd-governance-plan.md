---
workId: YH-20261110-sdd-governance
status: FROZEN
spec: docs/superpowers/specs/2026-11-10-sdd-governance-design.md
codeVersion: 0.1.0-SNAPSHOT
governanceVersion: 0.2.0
knowledgeVersion: 0.1.0
approval: 用户已授权本次治理调整，沿用原始请求的范围完成文档、工具及本地安装
---

# Yuheng SDD 治理实施计划

**目标：** 让参考 Athena 组织方式的 Yuheng 技能与规则具备可发现、可执行、可验证的 SDD 链路。

**范围：** `governance/`、代理加载入口、`tools/governance/`、治理 CI 与本次设计/验证记录。实现和验证遵循原请求授权。

- [x] 记录既有工作区修改和行为基线，确认实际框架契约。
- [x] 为标准技能元数据、资源缺失、安装冲突和一致性检查补行为测试；先观察失败。
- [x] 完善治理验证器与幂等安装器；安装冲突不得覆盖已有文件。
- [x] 编写规格、计划、证据模板及统一 SDD 契约。
- [x] 更新五个既有技能，补齐流程中实际依赖的专项技能。
- [x] 从当前本地规则保留有效内容，修正规格门禁及框架契约冲突。
- [x] 接入 AGENTS.md、CLAUDE.md、标准技能目录和 CI；保留旧入口兼容指引。
- [x] 执行治理单测、bundle 检查、技能元数据检查、安装检查和临时消费端同步。
- [x] 独立情景复验并修复发现的问题，记录实测结果和验证边界。

| 任务 | 关联需求/验收 | 输出与验证 |
|---|---|---|
| T-001 | REQ-001、AC-001 | 标准入口/专项技能；元数据与资源引用检查 |
| T-002 | REQ-002、AC-002、AC-003 | 统一 SDD 契约、三份模板；独立情景验证与模板核对 |
| T-003 | REQ-003、AC-004 | 保留并定向修正规则；与已定位源码核对 |
| T-004 | REQ-004、AC-005 | 安装器、治理验证器和测试；红绿测试、幂等/冲突保护与同步 |
| T-005 | REQ-001、REQ-004、AC-001、AC-005 | AGENTS/CLAUDE、兼容入口和 CI；安装检查、bundle 与 diff 审查 |

验证命令：

```bash
python3 -m unittest discover -s tools/governance/tests -v
python3 tools/governance/verify_bundle.py . --json
python3 tools/governance/sync_agent_assets.py --check
```

官方技能结构校验器使用系统技能安装器提供的 `quick_validate.py`；本次实际路径为 `/Users/huhua/.codex/skills/.system/skill-creator/scripts/quick_validate.py`。

新增文件与职责：

- `governance/skills/*/SKILL.md`：入口与专项行为。
- `governance/skills/*/assets/`：生成工作产物时使用的模板。
- `governance/skills/yuheng-workflow-router/references/sdd-contract.md`：统一状态、路径、授权与追踪约束。
- `governance/rules/*.md`：跨技能强制规则。
- `tools/governance/sync_agent_assets.py`：受限于治理资产的本地链接与检查。
- `tools/governance/tests/`：真实目录、冲突保护和元数据契约测试。
