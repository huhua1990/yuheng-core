# Yuheng AI / SDD 开发入口

在本仓库执行任务前，先确认目录、Git 状态与已有修改。此处为框架仓库；业务功能放消费端，公共能力变更须评估消费端影响。

## 资产来源

- 规则唯一来源：`governance/rules/`。
- 技能唯一来源：`governance/skills/<name>/SKILL.md`。
- 共用项目入口：`AGENTS.md`；Claude Code 入口 `CLAUDE.md` 导入本文件。
- 技能发现入口：`.agents/skills/`、`.claude/skills/`、`.qoder/skills/`，均链接到同一治理技能来源。
- 目前不维护工具专属 rules 目录；只有确需 Claude/Qoder 专属触发适配时，才创建对应 `.claude/rules/` 或 `.qoder/rules/`，不复制通用规则。Codex 的项目约束维护在本文件，不另建 `.codex/rules/` 副本。
- 框架知识：`ai-knowledge-core/`。知识与源码冲突时记录差异，以已验证契约定位，不编造 API。
- SDD 契约：`governance/skills/yuheng-workflow-router/references/sdd-contract.md`。

先读 `yuheng-ai-operating-principles`、`yuheng-task-entry`、`yuheng-phase-gate`、`yuheng-sdd-traceability`；再按任务从 `governance/rules/` 加载相关技术规则。技能发现目录是链接入口，不是额外维护副本。

## 四个入口

| 当前输入 | 使用技能 |
|---|---|
| 原始需求、想法、会议纪要 | `yuheng-requirement-to-spec` |
| 已确认的规格 | `yuheng-spec-to-plan` |
| 已确认的开发计划 | `yuheng-delivery-execution` |
| 阶段不明确 | `yuheng-workflow-router` |

用户要求从需求完整实施时使用 `yuheng-full-workflow`。创建页面、生成 CRUD 也先判断阶段，不能直接绕过规格。新工程/快照刷新先做 `yuheng-init-project-postcheck`；故障先读 `debug-log-first`。

## 规格驱动

`需求 → 规格（REQ/AC）→ 计划（T）→ 测试先行实现 → API/UI/迁移验证 → 自检`

同一工作沿用 `workId` 和代码/治理/知识版本。默认产物：

- `docs/specs/<workId>.md`
- `docs/plans/<workId>.md`
- `docs/verification/<workId>/verification.md`

用户指定路径优先。已有批准/实施授权持续有效；技术拆解与产物补录不重复审批。业务范围、行为或高风险操作存在未决问题时仅确认对应差异；不把生成文档当用户确认。用户只要求分析或计划时止于该阶段。

## 必须保留的技术边界

- 保持已有 HTTP 方法、路径、VO 和 Service 分层，禁止批量改为 POST 或强制 `ServiceImpl`。
- UI 当前包名 `@yuheng/platform-ui`；复用 runtime 请求实例和真实导出，普通请求返回已解包业务数据。
- 不假定存在静态 `request`、`useMenuStore` 或某个组件；从源码与类型检查。
- 数据库先定位真实工具/配置/迁移入口，保留数据库保护与历史迁移不可改写约束。
- 后端行为变更先有行为断言红灯，再最小实现转绿；启动/编译失败不算红灯。
- 每个 AC 都有实际验证证据；未执行、失败或服务不可达不能判 PASS 或声称全部完成。
- 保留用户已有改动，只修改任务相关内容。提交、推送、发布按用户授权执行。

## 治理检查

```bash
python3 tools/governance/sync_agent_assets.py --check
python3 tools/governance/verify_bundle.py . --json
python3 -m unittest discover -s tools/governance/tests -v
```

缺本地入口时报告缺失；只有用户授权修复治理安装时才运行 `python3 tools/governance/sync_agent_assets.py`，并先确认无冲突。普通 postcheck 使用 `--check`，不安装入口或刷新消费端快照。业务测试/构建从真实 POM 和 package scripts 选择，不将治理检查当业务验收。

详细用法见 `docs/development/sdd-workflow.md`。
