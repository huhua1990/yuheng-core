---
workId: YH-20261110-sdd-governance
spec: docs/superpowers/specs/2026-11-10-sdd-governance-design.md
plan: docs/superpowers/plans/2026-11-10-sdd-governance-plan.md
codeVersion: 0.1.0-SNAPSHOT
governanceVersion: 0.2.0
knowledgeVersion: 0.1.0
status: PASS
---

# Yuheng SDD 治理驗證證據

## 實際變更

新增18个标准技能、24份规则和三个 SDD 模板，提供统一工作流契约、根 `AGENTS.md` / `CLAUDE.md` 入口及受冲突保护的本地链接安装器。技能通过目录式链接发现，不保留旧平铺兼容文件。bundle 校验器现检查标准技能元数据、发现层级与资源引用；CI 接入治理单测和入口一致性检查，治理版本升为 `0.2.0`。定向修正规则与实际 HTTP 方法、`@yuheng/platform-ui` 包名、runtime 请求解包、Store 导出、Service 接口/Impl 及迁移入口之间的冲突。未修改 Java/TypeScript/Vue 运行时代码。

## 验证记录

| 验收 | 任务 | 类型 | 实际命令/操作 | 执行时间（Asia/Shanghai） | 实际结果 | 证据 | 结论 |
|---|---|---|---|---|---|---|---|
| AC-001 | T-001 | 官方技能元数据 | 临时 Python 3.9 虚拟环境中的 `quick_validate.py` 逐一检查 `governance/skills/*` | 2026-11-10 14:47 CST | 18 个标准技能全部输出 `Skill is valid!`，退出码 0 | 工作区命令输出 | PASS |
| AC-001 | T-001 | Markdown 引用 | 检查治理规则/技能标准目录中的全部本地相对链接；消费端同步后再检查复制的链接 | 2026-11-10 14:40 CST | 初次情景检查 94 个目标、0 失效；消费端文件均可解析 | 前向验证临时产物 `/var/folders/qy/zdng4xqs4bv9xz738cf74l7w0000gn/T/yuheng-sdd-forward-82dezlyx/evidence/artifact-check.json` | PASS |
| AC-002 | T-002 | 独立情景前向验证 | 对 A 原始需求、B 已授权实施、C 测试未运行及 DB 不可达运行新技能流程 | 2026-11-10 14:37 CST | A 生成 READY_FOR_REVIEW 规格；B 在指定文件不可读时保留授权并如实 BLOCKED；C 拒绝声称完成、标注 BLOCKED。前端分页读取解包后的 `page.list/page.total` | `/var/folders/qy/zdng4xqs4bv9xz738cf74l7w0000gn/T/yuheng-sdd-forward-82dezlyx/`；场景仅用于流程验证，不是本仓库需求证据 | PASS |
| AC-003 | T-002 | 模板身份/追踪字段 | 逐份检查规格、计划、验证模板 | 2026-11-10 14:46 CST | 三份模板具备 `workId`、代码/治理/知识版本和 REQ/AC/T 追踪字段 | 工作区文件检查 | PASS |
| AC-004 | T-003 | 源码契约比对 | 阅读 Controller、CommonResult、PageResult、Service、UI `package.json` / `src/index.ts` / runtime request 和 POM | 2026-11-10 14:24 CST | 技术规则与已核对契约一致；旧全 POST、静态 request、`useMenuStore`、固定 `ServiceImpl` 规则已定向更正 | 源码位置见规则 `yuheng-framework-usage.md` | PASS |
| AC-005 | T-004 | TDD 治理测试 | 对新安装器边界、元数据/布局验证测试先运行并确认失败，再实现修复，随后 `python3 -m unittest discover -s tools/governance/tests -v` | 2026-11-10 14:55 CST | 最终 34 tests、全部通过；含源文件保护、外部目录、父路径文件/链接、软链接环、旧链接、嵌套布局、YAML 类型、frontmatter 和引用验证 | 命令标准输出 | PASS |
| AC-005 | T-004/T-005 | bundle 与安装一致性 | `python3 tools/governance/verify_bundle.py . --json`；`python3 tools/governance/sync_agent_assets.py --check` | 2026-11-10 14:55 CST | bundle `PASS`、issues 空；安装 `PASS: 0 asset link(s) need updating` | 命令标准输出 | PASS |
| AC-005 | T-005 | 消费端同步演练 | 临时目录调用消费端 `sync_bundle` 的 apply/check/verify，将所有治理快照同步并检查相对链接，预先写入 consumer `docs/specs/existing.md` | 2026-11-10 14:54 CST | 3 种模式均 `PASS`；18 技能、24 规则、3 模板可读；相对链接全解析；已有业务规格保留 | 临时目录随进程清理；脚本断言输出 | PASS |
| AC-005 | T-005 | diff 与运行时代码范围 | 本次范围 `git diff --check`；检查跟踪的 Java/TypeScript/Vue/XML diff | 2026-11-10 14:55 CST | 治理范围空白检查通过；无运行时代码 diff | 命令标准输出 | PASS |

## 自检与修正

独立审查实测发现并修正：目标软链接可能指回并覆盖治理来源；父目录为文件时可能发生部分安装；遗留活动链接可能未检查；嵌套技能会被 bundle 接受但无法被安装；非法 YAML 类型/空描述会误判；技能重复名称未按发现 ID 去重。以上边界均增加行为测试，问题修复后重跑最终治理单测。

独立技能情景验证还促使契约明确：`UNKNOWN` 文档/授权状态、`PENDING_ASSESSMENT` 原型状态、分析阶段的阶段性 AC 追踪，以及已有实现但要求验收时不因证据阻塞而擅自改业务代码。旧日志规则中记录整个请求对象的示例已改为不打印敏感请求参数。

## 限制

本验证证明治理内容、技能发现结构、安装/快照传递和流程场景符合本次验收。不证明任何真实业务功能已通过 API、浏览器、数据库或生产迁移验收。本次情景中 B 指定文件和 C 业务产物不在仓库，均明确作为情景输入而非实际工程事实。全仓 `git diff --check` 发现用户原有 `PACKAGE_NAME_CHECK.md:3` 尾随空格；未改动该用户文件。未做业务服务启动、生产发布或真实环境写操作。
