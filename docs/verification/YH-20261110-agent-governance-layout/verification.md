---
workId: YH-20261110-agent-governance-layout
spec: docs/superpowers/specs/2026-11-10-agent-governance-layout-design.md
plan: docs/superpowers/plans/2026-11-10-agent-governance-layout.md
codeVersion: 0.1.0-SNAPSHOT
governanceVersion: 0.2.0
knowledgeVersion: 0.1.0
status: PASS
---

# 多编码工具治理入口验证记录

## 实际变更

同步器现在将唯一治理源中的标准技能链接到 `.agents/skills/`、`.claude/skills/`、`.qoder/skills/`，不再安装通用规则副本。`--check` 只读检测三端技能链接和旧 Claude 通用规则链接；默认写入遇到旧规则链接会停止，只有显式指定 `--remove-legacy-rule-links` 才会删除解析到本仓库 `governance/rules/` 文件的符号链接。普通文件、目录和其他链接保持不变。项目入口、技能契约、维护文档及治理 CI 路径过滤已同步更新。

实施时的工作区中曾有 24 个 `.claude/rules/` 符号链接，全部解析到本仓库 `governance/rules/*.md`；显式迁移清除了这些工作区链接，并创建 18 个 Qoder 技能目录链接。后续对照 Git 基线发现，版本库原有 `.claude/rules/` 实际记录的是 20 份普通 Markdown 文件，而非符号链接；20 份均在 `governance/rules/` 有同名承接文件。两版并非逐字一致：API 响应、后端代码、前端代码、AI 工作原则、设计门禁、框架使用、阶段门禁 7 项经过较大重写，以适配已核对的源码契约及统一 SDD 流程；其余规则保留主体要求，并补充边界或验证细节。另有 4 项 SDD 治理规则为新增。当前 `.claude/rules/` 空目录已移除。

## 验证记录

| 验收 | 实际命令/操作 | 实际结果 | 结论 |
|---|---|---|---|
| AC-001 | 核查 `.agents/skills/`、`.claude/skills/`、`.qoder/skills/` | 三个入口均含 18 个标准技能链接；统一指向 `governance/skills/<name>/` | PASS |
| AC-002 | `python3 -m unittest tools.governance.tests.test_sync_agent_assets -v`；执行迁移前 `--check` 与迁移后 `--check` | 16 项安装器测试通过；预览报告 42 项变更且未写入；迁移后 `PASS: 0 asset link(s) need updating` | PASS |
| AC-003 | 验证迁移前链接目标并执行 `python3 tools/governance/sync_agent_assets.py --remove-legacy-rule-links` | 仅 24 个受管治理链接被移除；测试证明普通规则文件及治理目录外的链接保留 | PASS |
| AC-004 | `python3 -m unittest discover -s tools/governance/tests -v`；`python3 tools/governance/verify_bundle.py . --json`；`python3 tools/governance/sync_agent_assets.py --check` | 38 项单测通过；bundle 为 PASS 且 issues 为空；入口检查无漂移 | PASS |
| AC-005 | 审查入口文档、SDD 契约、技能发现说明与 `.github/workflows/governance-bundle.yml` | 三端职责和维护规则一致；CI 监听 `.qoder/**` | PASS |
| 验证范围 | 对任务修改文件运行 `git diff --check` | 通过。全仓检查另报告用户原有 `PACKAGE_NAME_CHECK.md:3` 尾随空格；未修改该文件 | PASS（范围内） |

## 限制

结构和链接验证不等于在 Codex、Claude Code、Qoder 图形客户端中逐一实测自动技能触发。本次未运行任何 Java、TypeScript 或 Vue 业务测试，且没有刷新消费端治理快照。工作区原有的其他修改均保留。
