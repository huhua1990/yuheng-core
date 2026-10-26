# 阶段 2 发布线验证

验证日期：2026-10-26（Asia/Shanghai）

## 本次交付

- 增加 core 发布兼容策略和发布检查表；
- 补齐 Maven、NPM、治理 bundle 的发布清单；
- 增加 core 构建、治理 bundle 和 consumer 检查的 GitHub Actions 入口；
- 将消费端 manifest 同步到当前 core 治理快照。

## 本地验证

```bash
python3 yuheng-core/tools/governance/verify_manifest.py \
  yuheng-core/release/yuheng-manifest.yaml --json

python3 yuheng-core/tools/governance/verify_bundle.py \
  yuheng-core --json

python3 yuheng-demo/sync/skills/sync-specs/scripts/postcheck_project.py \
  --project-root yuheng-demo --project-id yuheng-demo --json

python3 yuheng-demo/sync/skills/sync-specs/scripts/sync-specs-api.py \
  --source yuheng-core --target yuheng-demo --verify --json
```

结果：

- core manifest：`PASS`；
- core governance bundle：`PASS`；
- consumer postcheck：`PASS`；
- consumer sync verify：`PASS`；
- core governance tests：11 个通过；
- consumer sync/init tests：4 个通过；
- 三个 workflow 文件均能被 YAML 解析器读取；
- consumer UI 平台边界检查：`PASS`。

## 当前限制

- GitHub Actions 尚未在远程仓库执行，本地只完成 YAML 结构检查；
- `yuheng-ui` 尚未发布到 NPM registry，consumer UI 的完整构建继续使用临时
  tarball 验证；
- `yuheng-demo-ui` 尚未提交锁文件，registry 发布完成后再生成并锁定；
- 后端完整测试仍保留源工程已有的随机 `moduleName` 基线失败，发布前需要单独
  修复或建立明确的测试豁免。
