# Yuheng 兼容策略

Yuheng 将运行时代码、治理资产和知识资产作为三条可以独立演进的版本线：

| 版本线 | 来源 | 消费方式 | 主要校验 |
| --- | --- | --- | --- |
| `codeVersion` | Maven 与 NPM 发布物 | `yuheng-server`、`yuheng-ui` | 编译、类型、API 和数据库契约 |
| `governanceVersion` | `governance/rules`、`governance/skills` | `sync --check/apply/verify` | manifest、引用、资产 ID 和门禁 |
| `knowledgeVersion` | `ai-knowledge-core` | 消费端知识快照 | 知识轨道、来源提交和兼容范围 |

代码版本由 Maven POM 和 `yuheng-ui/package.json` 驱动。治理与知识版本由
`yuheng-manifest.yaml` 驱动。一次发布必须同时记录三者的实际版本，即使其中
一条版本线没有变化。

## 兼容范围

- 补丁版本必须保持现有 API、数据库字段、请求头、错误码、租户语义和公开 UI
  契约兼容。
- 次版本可以增加公开能力，但不能删除或改变已有字段含义；新增能力必须补充
  API、UI 或治理验证证据。
- 主版本允许删除能力、改变契约或调整迁移语义，必须提供迁移说明和回滚方案。
- `codeVersion`、`governanceVersion` 或 `knowledgeVersion` 超出 manifest 声明的
  范围时，发布状态为 `BLOCKED`。

## 发布组合

消费端只接受 manifest 中声明的组合。代码、治理和知识可以分别发布，但每次
同步或启动前必须执行：

```bash
python3 yuheng-core/tools/governance/verify_manifest.py \
  yuheng-demo/yuheng-manifest.yaml --json

python3 yuheng-demo/sync/skills/sync-specs/scripts/sync-specs-api.py \
  --source yuheng-core \
  --target yuheng-demo \
  --verify --json

python3 yuheng-demo/sync/skills/sync-specs/scripts/postcheck_project.py \
  --project-root yuheng-demo \
  --project-id yuheng-demo --json
```

`--apply` 只更新消费端托管的 rules、skills、knowledge 和 manifest 快照，不得
覆盖 `docs/specs`、`docs/plans`、`docs/verification`、业务源码或
`consumer-overlay`。

## 版本提升规则

1. 先更新源仓库中的版本和兼容矩阵。
2. 运行 core build、UI build、manifest/bundle 校验。
3. 发布 Maven、NPM 和治理 bundle。
4. 在消费端执行同步、postcheck、构建和 API/UI 回归。
5. 将组合版本写入消费端 manifest，并保留验证报告。

无法证明兼容性的组合保持 `BLOCKED`，不得通过手工修改 manifest 绕过门禁。
