# Task 2 治理契约验证记录

验证日期：2026-10-25  
范围：manifest、兼容范围、治理 bundle、规则、技能和知识轨道

## 已交付

- `release/yuheng-manifest.schema.yaml`
- `release/yuheng-manifest.yaml`
- `release/compatibility-matrix.yaml`
- `governance/rules/`
- `governance/skills/`
- `governance/metadata.json`
- `ai-knowledge-core/metadata.json`
- `ai-knowledge-core/server/`
- `ai-knowledge-core/ui/`
- `ai-knowledge-core/data/`
- `tools/governance/verify_manifest.py`
- `tools/governance/verify_bundle.py`
- `tools/governance/tests/`

## 验证命令

```bash
python3 -m unittest discover \
  -s /Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/tests -v

python3 /Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/verify_manifest.py \
  /Users/huhua/study/ai/yuheng/yuheng-core/release/yuheng-manifest.yaml --json

python3 /Users/huhua/study/ai/yuheng/yuheng-core/tools/governance/verify_bundle.py \
  /Users/huhua/study/ai/yuheng/yuheng-core --json
```

结果：

- 9 个单元测试全部通过；
- manifest 验证结果为 `PASS`；
- core bundle 验证结果为 `PASS`；
- 校验器支持 `PASS`、`WARN`、`BLOCKED`、`WAIVED` 四种状态，并对声明的 warning/waiver 保留原始内容；
- 失败用例覆盖缺少 `codeVersion`、缺少 `governanceVersion`、重复 overlay ID、版本范围不满足、重复资产 ID 和断链；
- 校验器只读取 manifest、治理资产和知识目录，不读取业务源码，也不调用 AI 模型。

## 当前边界

本任务只建立最小契约和确定性校验器。消费端同步、原子替换、保护目录和 postcheck 留在 Task 3；Java/Vue 运行时拆分留在后续任务。
