# Yuheng UI 包身份统一 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 core 对外 npm 包身份统一为 `yuheng-ui`，并证明 demo 能从打包产物通过该名称安装、导入和构建。

**Architecture:** core 的 npm 包元数据是包名事实来源，发布清单、当前治理入口和工作区命令与其一致；demo 继续通过 `yuheng-ui` 公共入口消费。通过临时目录安装实际 tarball 验证包自包含，不依赖相邻 core 源码路径。

**Tech Stack:** pnpm 9、Node.js、Vue 3、Vite、Vitest、Python 3、Maven、GitHub Actions。

---

## 范围与前提

- 权威架构规格：`yuheng-core/docs/superpowers/specs/2026-11-10-yuheng-three-repository-architecture-design.md`。
- 本计划只处理 npm 包身份和发布消费验证。Java 包名、demo 扫描、治理快照同步、SQL 和业务模板导入分别设计实施；本计划不重写历史设计或验证文档。
- 工作区父目录不是 Git 仓库，core、demo、templates 各自独立；根目录 `package.json` 是工作区本地配置，不属于 core 提交。执行前对每个仓库运行 `git status --short --branch` 并保留既有改动。
- 2026-11-10 观察到 demo 有两个用户正在修改/重命名的 Java 文件。执行时重新读取，不修改或覆盖这两处 Java 改动；早前规格关于 demo 默认控制器旧 import 的描述可能已过时。
- 正式 npm 仓库及发布权限尚未核实；验证通过只证明打包与临时安装，不代表已经发布。版本继续使用当前 `0.1.0-SNAPSHOT`；不修改历史版本号。
- core 发布检查可能暴露与本计划无关的既有失败。分别记录命令、输出、原因和影响；不能把失败标成通过。

## 文件职责

| 文件 | 作用 |
|---|---|
| `yuheng-core/yuheng-ui/package.json` | 设置正式包名，保留现有 `exports`、构建和依赖契约 |
| `yuheng-core/yuheng-ui/tests/release/package-exports.test.ts` | 验证包身份及公开出口 |
| `yuheng-core/release/yuheng-manifest.yaml` | 声明正式 UI 发布坐标 |
| `yuheng-core/release/publish-manifest.yaml`、`release/compatibility-matrix.yaml` | 保持 UI 坐标与包元数据一致 |
| `yuheng-core/AGENTS.md`、`governance/rules/frontend-code-style.md`、`governance/skills/yuheng-menu-delivery/SKILL.md`、`governance/skills/yuheng-page-delivery/SKILL.md` | 更新活动治理入口中的旧包名，保留 API 以源码和类型为准的约束 |
| 工作区根 `package.json` | 修正本地 pnpm 包过滤器，不更改其他脚本 |
| `yuheng-demo/yuheng-demo-ui/package.json`、`src/main.ts`、`tests/consumer-entry.test.ts` | 核验依赖和公开导入；仅出现实际差异时修改 |
| `yuheng-core/docs/verification/yuheng-ui-package-identity/verification.md` | 记录精确版本、命令及独立消费测试结果 |

## Task 1：固定包名与发布坐标

**Files:**
- Modify: `yuheng-core/yuheng-ui/tests/release/package-exports.test.ts`
- Modify: `yuheng-core/yuheng-ui/package.json`
- Modify: `yuheng-core/release/yuheng-manifest.yaml`
- Verify: `yuheng-core/release/publish-manifest.yaml`
- Verify: `yuheng-core/release/compatibility-matrix.yaml`

- [ ] **Step 1: 添加用户可观察的包身份断言**

在 `package-exports.test.ts` 现有 `describe('release package exports', ...)` 内添加：

```ts
it('publishes under the yuheng-ui package name', () => {
  const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { name: string }
  expect(metadata.name).toBe('yuheng-ui')
})
```

- [ ] **Step 2: 运行红灯**

在 `yuheng-core/yuheng-ui` 执行：

```bash
pnpm exec vitest run tests/release/package-exports.test.ts -t 'publishes under the yuheng-ui package name'
```

预期断言失败，实际值为 `@yuheng/platform-ui`。如果缺依赖或测试运行器无法启动，先安装项目锁定的依赖并重试；启动失败不算行为红灯。若当前包名已经是 `yuheng-ui`，记录工作区变化并直接执行完整测试。

- [ ] **Step 3: 修改正式坐标**

将 `yuheng-ui/package.json` 的 `name` 改为 `yuheng-ui`；将 `release/yuheng-manifest.yaml` 的 `artifacts.ui` 改为 `yuheng-ui@0.1.0-SNAPSHOT`。核对 `release/publish-manifest.yaml` 的 `artifacts.ui` 和 `consumerContract.uiEntry`、`release/compatibility-matrix.yaml` 的 `contracts.frontend.artifact` 均为同一坐标；现有值正确时不修改。

- [ ] **Step 4: 验证身份和现有导出**

在 `yuheng-core/yuheng-ui` 执行：

```bash
pnpm exec vitest run tests/release/package-exports.test.ts
pnpm run typecheck
pnpm run build
pnpm run lint:boundary
```

预期全部成功；若导出测试依赖构建产物，先运行 build 后重跑全部命令并记录。

在 `yuheng-core` 执行：

```bash
python3 tools/governance/verify_manifest.py release/yuheng-manifest.yaml --json
python3 tools/governance/verify_bundle.py . --json
```

记录各命令的实际状态；`BLOCKED` 不能作为通过。核验 `yuheng-ui/package.json` 与三个发布清单的包名及版本一致。

## Task 2：统一活动治理入口和本地工作区过滤器

**Files:**
- Modify: `yuheng-core/AGENTS.md`
- Modify: `yuheng-core/governance/rules/frontend-code-style.md`
- Modify: `yuheng-core/governance/skills/yuheng-menu-delivery/SKILL.md`
- Modify: `yuheng-core/governance/skills/yuheng-page-delivery/SKILL.md`
- Modify: 工作区根目录 `package.json`

- [ ] **Step 1: 检查活动资产中的旧身份**

在工作区根目录执行：

```bash
rg -n '@yuheng/platform-ui' yuheng-core/AGENTS.md yuheng-core/governance yuheng-core/ai-knowledge-core yuheng-core/release yuheng-core/yuheng-ui/README.md package.json
```

逐项判断是否描述当前 npm 包身份；不替换历史事件、包外无关标识或未验证的符号名称。记录额外命中的活动文件。

- [ ] **Step 2: 修正当前规则描述**

将 `AGENTS.md` 的当前 UI 包名改为 `yuheng-ui`，保留 runtime 请求与真实导出约束。将 `frontend-code-style.md` 中包名描述改为：

```markdown
- 前端正式包名为 `yuheng-ui`；从其 `package.json`、消费端依赖和实际导出核实可用入口。业务代码复用消费端配置的请求实例，不直接引用 core 源码路径。
```

将上述两个专项 skill 中作为包身份的 `@yuheng/platform-ui` 改为 `yuheng-ui`，保留“根据源码、类型和运行上下文核实 API”的要求。对 Step 1 新发现的活动包身份引用执行同样的精确修改。

- [ ] **Step 3: 修正工作区 pnpm 过滤器**

将工作区根 `package.json` 的 `dev:platform`、`build:platform`、`test:platform`、`pack:platform` 四个脚本中的 `--filter @yuheng/platform-ui` 改为 `--filter yuheng-ui`。根目录没有 Git 元数据，使用文件差异确认只修改了这四个过滤器。

- [ ] **Step 4: 验证过滤器和治理一致性**

在工作区根执行：

```bash
pnpm --filter yuheng-ui list --depth -1
rg -n '@yuheng/platform-ui' yuheng-core/AGENTS.md yuheng-core/governance yuheng-core/ai-knowledge-core yuheng-core/release yuheng-core/yuheng-ui/README.md package.json
```

预期 pnpm 列出 core 前端包；第二条无活动包身份残留，`rg` 无结果退出码为 1。非包身份的历史说明若保留，应在验证记录中说明。

在 core 执行：

```bash
python3 tools/governance/sync_agent_assets.py --check
python3 tools/governance/verify_bundle.py . --json
python3 -m unittest discover -s tools/governance/tests -v
```

记录实际结果。`--check` 不写入发现入口；若入口缺失，按 core 的治理安装规则另行处理，不在本计划中静默同步 demo。

## Task 3：从打包产物验证 demo 独立消费

**Files:**
- Verify: `yuheng-demo/yuheng-demo-ui/package.json`
- Verify: `yuheng-demo/yuheng-demo-ui/src/main.ts`
- Verify: `yuheng-demo/yuheng-demo-ui/tests/consumer-entry.test.ts`
- Create: `yuheng-core/docs/verification/yuheng-ui-package-identity/verification.md`

- [ ] **Step 1: 构建并生成临时 tarball**

在 core 的 `yuheng-ui` 目录执行，保留终端中的临时目录路径供本任务使用：

```bash
task_pack_dir="$(mktemp -d "${TMPDIR:-/tmp}/yuheng-ui-pack.XXXXXX")"
pnpm run build
pnpm pack --pack-destination "$task_pack_dir"
printf 'package directory: %s\n' "$task_pack_dir"
```

记录输出 tarball 的准确文件名，后续将其作为 `TASK_TARBALL` 的绝对路径。不要使用仓库中旧 `vendor` tarball 作为本次构建证据。

- [ ] **Step 2: 构造隔离消费项目**

将 `yuheng-demo/yuheng-demo-ui` 复制到同一个临时目录下的 `consumer` 子目录，排除 `node_modules`、`dist` 和锁文件；保留 package.json、配置、src、tests 与 scripts。复制后，仅修改临时副本的 `package.json`：把 `dependencies.yuheng-ui` 的值设为 `file:` 加上本次 tarball 绝对路径，其他依赖不变。确保临时目录位于现有 pnpm workspace 之外。

在临时 `consumer` 目录运行：

```bash
pnpm install
pnpm test
pnpm run typecheck
pnpm run build
pnpm run lint:platform-imports
```

预期全部通过，且安装解析的 `node_modules/yuheng-ui/package.json` 的 `name` 是 `yuheng-ui`。检查临时依赖路径与构建解析结果，不得指向工作区 core 源码。网络或私有 registry 不可用时如实记录阻断，不改为通过 workspace 链接来冒充独立安装验证。

- [ ] **Step 3: 验证实际依赖而非包名字符串**

在临时 `consumer` 目录执行：

```bash
node --input-type=module -e "import('yuheng-ui').then(m => { if (typeof m.installYuhengUi !== 'function' || typeof m.registerPlatformRoutes !== 'function') process.exit(1); console.log('yuheng-ui public entry: PASS') })"
```

预期输出 `yuheng-ui public entry: PASS`。若包声明仅支持浏览器运行且 Node 导入触发浏览器全局变量错误，以临时消费项目中 Vitest 实际入口测试、类型检查和 Vite build 为主，并在记录中写明 Node 导入错误；不得把该错误隐藏为成功。

- [ ] **Step 4: 保存验证证据并检查变更**

创建 `docs/verification/yuheng-ui-package-identity/verification.md`，记录 core/demo 提交与工作区状态、包坐标、tarball 生成命令、隔离安装路径、每条测试结果及其实际输出、已知失败和发布未执行状态。

在 core 和 demo 分别执行 `git diff --check`、`git status --short --branch`；审阅真实变更，确认未覆盖用户的 demo Java 文件。此时才可声称已验证的部分完成。

## 后续计划边界

- **消费端 Java 和治理恢复：** 实施前以当时工作区为准，核验 `com.yuheng.demo`、`com.yuheng.platform.module`、Mapper 扫描、治理 manifest 和固定 core 来源。不能仅全局替换包名。
- **SQL 治理：** 先独立梳理 MySQL 等首轮支持方言、core 表与数据归属、已有数据库登记/升级方案，再编写 Liquibase 分链的单独规格和计划。
- **模板导入：** 先盘点试点模块的跨业务模块依赖、前后端资源和 SQL 来源，再为一次性复制、构建装配和运行验证编写独立规格和计划；不设计模板更新同步。
