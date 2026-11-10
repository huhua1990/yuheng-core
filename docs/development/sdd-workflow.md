# 在 Yuheng 使用 AI 进行 SDD 开发

SDD（Spec Driven Development）先定义可验收规格，再由 AI 按计划实施，并用实际测试与联调证据核对规格。流程参考 Athena，技术约束以 Yuheng 当前代码契约为准。

## 如何开始

在 `yuheng-core` 打开 AI 编码工具；仓库以根 `AGENTS.md` 提供共用项目入口，`CLAUDE.md` 导入该入口。Codex、Claude Code、Qoder 分别从 `.agents/skills/`、`.claude/skills/`、`.qoder/skills/` 发现技能；三个目录都是指向 `governance/skills/<name>/SKILL.md` 的链接。若当前会话尚未刷新技能，可显式要求 AI 读取治理源中的技能文件。

```text
$yuheng-workflow-router
我要新增一个可复用的字典查询能力，请先检查已有接口，再判断当前 SDD 阶段。
```

入口按手里的产物选择：

| 手里的内容 | 指令示例 |
|---|---|
| 原始需求 | `$yuheng-requirement-to-spec 根据这些需求形成规格，暂不编码。` |
| 确认过的规格 | `$yuheng-spec-to-plan 根据 docs/specs/YH-xxx.md 生成可执行计划。` |
| 确认过的计划 | `$yuheng-delivery-execution 按 docs/plans/YH-xxx.md 实施并验证。` |
| 完整实施需求 | `$yuheng-full-workflow 按以下范围从规格做到验证；未决业务选择再确认。` |

core 只承载框架共性；消费端业务在其自己的工程执行。已经确认过的规格、计划或用户消息作为授权证据，补写文件不重复索要审批。

## 产物与完成判定

同一 `workId` 默认对应：

```text
docs/specs/<workId>.md
docs/plans/<workId>.md
docs/verification/<workId>/verification.md
```

规格定义 `REQ-*`、`AC-*`，计划定义 `T-*`，验证证据把三者关联到实际命令、执行时间、退出码、日志/截图。用户已指定的旧路径可以直接沿用。模板随对应技能放在 `assets/` 中。

阶段状态为 PASS、WARN、BLOCKED、WAIVED；文档冻结状态与验证状态分别记录。开工许可不等于完成。测试未运行、数据库不可达、UI 未实际检查等必需验收缺口写为 BLOCKED，不能把预计结果写成实际结果。

## 维护技能与规则

通用规则和技能只维护在 `governance/rules/`、`governance/skills/`。技能发现目录由相对链接同步；通用规则按任务从治理源读取，不批量复制到工具规则目录。当前没有 Claude/Qoder 专属 rules 目录；确需工具专属触发适配时再创建。普通检查运行 `--check`；同步新增入口时运行默认写入模式。迁移旧 Claude 通用规则链接时，先检查预览，再显式运行 `--remove-legacy-rule-links`；它只删除可验证指向 `governance/rules/` 的链接，不删除普通文件或其他链接。

```bash
# 只有明确授权修复治理入口时运行写入模式
python3 tools/governance/sync_agent_assets.py
# 常规只读检查
python3 tools/governance/sync_agent_assets.py --check
python3 tools/governance/verify_bundle.py . --json
python3 -m unittest discover -s tools/governance/tests -v
```

安装器预检全部目标，遇到不同内容或外部路径立即报冲突，`--check` 不写文件；不使用强制覆盖。相对链接需要 Git/操作系统支持符号链接。

技能只维护在 `governance/skills/<name>/SKILL.md`，同步工具为 Codex、Claude Code、Qoder 建立目录式发现链接。新增工具时先核对其官方技能和规则发现协议，再只添加必要适配；不为工具预先复制通用规则。`.claude/skills/upstream/` 和历史备份不作为活动工作流来源。新增的专项技能按需加载，不要求用户记住全部名称。

## 消费端同步

既有同步协议仍从 `governance/rules`、`governance/skills`、`ai-knowledge-core` 复制快照。模板和参考资料位于技能目录内，一并分发；兄弟技能的相对引用在 `yuheng-skills/` 中仍有效。

消费端 AI 需先读取其入口文件，并通过 `yuheng-skills/<name>/SKILL.md` 使用技能。是否安装到该工程的代理发现目录由消费端集成决定；本次只安装 core 本地入口，不修改消费端工程。同步检查通过仅证明治理快照完整，不代表已完成一项真实业务需求的端到端验收。
