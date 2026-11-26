---
workId: YH-20261110-agent-governance-layout
plan: docs/superpowers/plans/2026-11-10-agent-governance-layout.md
status: FROZEN
codeVersion: 0.1.0-SNAPSHOT
governanceVersion: 0.2.0
knowledgeVersion: 0.1.0
approval: 用户已确认本设计文档
---

# 多编码工具的规则与技能目录设计

## 目标

让 Codex、Claude Code、Qoder 及后续接入的编码工具遵循同一套 Yuheng SDD 工作流和工程约束，同时保留各工具原生的规则与技能发现能力。通用规则和技能只有一个维护来源，不因工具数量增加而形成多套内容副本。

本设计限于治理文件布局、发现入口、同步校验和维护文档，不涉及 Java、TypeScript、Vue 运行时代码，也不改变现有 SDD 阶段、产物格式或业务技术契约。

## 现状

- `governance/rules/` 和 `governance/skills/<name>/SKILL.md` 已作为规则、技能的维护来源。
- `.agents/skills/` 与 `.claude/skills/` 通过目录符号链接发现标准技能。
- `AGENTS.md` 是项目共用入口，`CLAUDE.md` 导入 `AGENTS.md`。
- `tools/governance/sync_agent_assets.py` 当前安装 `.agents/skills/`、`.claude/skills/` 和 `.claude/rules/`。它会把全部通用规则链接到 Claude 原生规则目录，但没有 Qoder 技能入口。
- `.codex/rules/` 不是 Codex 的通用项目指令发现入口；本仓库不应为同一批通用规则再维护一份 Codex 副本。

## 目录与职责

```text
AGENTS.md                         # 所有兼容工具共用的项目入口与基础约束
CLAUDE.md                         # Claude Code 入口，导入 AGENTS.md
governance/
  rules/<name>.md                 # 通用详细规则的唯一来源
  skills/<name>/SKILL.md          # 通用技能的唯一来源，可含 references/assets/scripts

.agents/skills/<name>             # Codex 等遵循 Agent Skills 约定的发现入口
.claude/skills/<name>             # Claude Code 原生技能发现入口
.qoder/skills/<name>              # Qoder 原生技能发现入口

.claude/rules/<name>.md           # 仅 Claude 专属加载行为所需的规则适配
.qoder/rules/<name>.md            # 仅 Qoder 专属加载行为所需的规则适配
```

通用规则由 `AGENTS.md` 指明读取原则和 `governance/rules/` 位置；任务入口按需加载详细规则。不得把全部规则分别复制进工具目录。只有某项约束确实依赖工具专属的自动触发、路径匹配或 frontmatter 时，才添加该工具的适配规则；适配文件应尽量只承载触发元数据并指向通用规则正文。

Codex 使用根 `AGENTS.md` 及 `.agents/skills/`。Claude Code 使用 `CLAUDE.md` 导入共用入口，并从 `.claude/skills/` 发现技能。Qoder 使用共用 `AGENTS.md`，并从 `.qoder/skills/` 发现技能；`.qoder/rules/` 仅承载无法由 `AGENTS.md` 或技能按需加载表达的 Qoder 特有规则。

## 同步行为

扩展现有同步工具，使其从 `governance/skills/` 安装相对目录符号链接到 `.agents/skills/`、`.claude/skills/` 和 `.qoder/skills/`。通用 `governance/rules/` 不再整体链接至 `.claude/rules/`；工具特有规则由各工具原生目录独立管理，并必须引用或映射到通用规则来源，避免复制维护。

同步器继续执行完整预检：遇到冲突、过期的受管链接、越界路径或不安全父目录时，在任何写入前停止；`--check` 保持只读。同步器不自动删除目录中已有的非受管文件或工具专属规则。测试须覆盖 Qoder 技能入口、三端一致性、冲突保护和过期链接检查。

## 用户与维护者体验

- 用户只需记住 `AGENTS.md` 的少量入口和阶段选择；技能详情按任务加载。
- 修改通用规则或技能时，只编辑 `governance/`，再运行同步和 bundle 检查。
- 新增支持工具时，先确认其官方发现路径和格式，再增加最小适配；不改变通用治理模型。
- 文档明确区分“内容维护来源”和“工具发现入口”，不把符号链接目录描述为额外副本。

## 需求与验收

| 需求 | 描述 |
|---|---|
| REQ-001 | 通用规则和技能继续由 `governance/` 单一维护，工具入口不保存平行副本。 |
| REQ-002 | Codex、Claude Code、Qoder 均有各自已确认的原生技能发现入口，且链接到同一技能来源。 |
| REQ-003 | 通用规则按任务从治理源读取；原生规则目录只容纳工具专属触发适配，不再默认注入全部通用规则。 |
| REQ-004 | 同步工具安全、可重复、只读检查有效，并能报告三种工具入口的缺失或漂移。 |
| REQ-005 | 维护文档说明目录职责、添加新工具的方法以及各检查命令。 |

| 验收 | 可观测结果 |
|---|---|
| AC-001 | `.agents/skills/`、`.claude/skills/`、`.qoder/skills/` 中每项标准技能均指向对应 `governance/skills/<name>`，且资源和 `SKILL.md` 可读取。 |
| AC-002 | `sync_agent_assets.py --check` 检查三个技能入口；干净安装后报告无漂移，模拟缺失或错误链接时报告漂移/冲突而不写入。 |
| AC-003 | 同步器不再为通用规则创建 `.claude/rules/` 链接；测试确认用户已有 Claude/Qoder 专属规则不会被删除或覆盖。 |
| AC-004 | bundle 校验和治理单测通过；AGENTS、CLAUDE、SDD 工作流文档对单一来源与工具适配职责表述一致。 |

## 风险与验证边界

- 符号链接对不同操作系统和工具扫描器的支持可能不同。保持现有安装器的链接约定，并在仓库环境验证目标工具能列出技能；文件系统单测不能替代真实客户端发现验证。
- Claude Code 对 `AGENTS.md` 的读取取决于版本和项目说明设置，因此 `CLAUDE.md` 必须继续显式导入 `AGENTS.md`。
- 本设计只确认发现结构与治理一致性，不证明真实需求可自动触发正确技能，也不证明业务实现验收通过。

## 官方依据

- Codex 项目指令与 Agent Skills：[`AGENTS.md` 指南](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[OpenAI Skills](https://developers.openai.com/plugins/concepts/skills)。
- Claude Code 项目指令与技能发现：[`CLAUDE.md` / `AGENTS.md` 记忆规则](https://code.claude.com/docs/en/memory)、[Claude Code Skills](https://code.claude.com/docs/en/skills)。
- Qoder 项目规则与技能发现：[Qoder Rules](https://docs.qoder.com/user-guide/rules)、[Qoder Skills](https://docs.qoder.com/extensions/skills)。

## 范围外

- 重写 SDD 技能内容、编号体系、模板或版本模型。
- 为尚未确认发现协议的其他 AI 工具提前建立目录。
- 把工具特有部署、构建或发布策略塞入通用规则。
- 运行消费端同步或刷新消费端治理快照。
