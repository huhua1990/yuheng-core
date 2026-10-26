# Yuheng 发布检查表

## Core 发布

- [ ] 工作区干净，发布提交已记录。
- [ ] `release/yuheng-manifest.yaml` 的 `codeVersion`、`governanceVersion`、
      `knowledgeVersion` 与实际产物一致。
- [ ] `release/publish-manifest.yaml` 的 Maven、NPM 和治理资产入口完整。
- [ ] `verify_manifest.py` 返回 `PASS`。
- [ ] `verify_bundle.py` 返回 `PASS`。
- [ ] `mvn -DskipTests package` 成功。
- [ ] `yuheng-ui` 的测试、类型检查、构建和边界检查成功。
- [ ] 发布物可以在临时目录安装，不依赖 core 源码路径。

## Consumer 验证

- [ ] `sync --check` 没有未处理差异。
- [ ] `sync --verify` 返回 `PASS`。
- [ ] `postcheck_project.py` 返回 `PASS`。
- [ ] 消费端只声明版本化 `yuheng-server` 和 `yuheng-ui`。
- [ ] core baseline 与业务 Liquibase 按固定顺序组合。
- [ ] 后端构建、前端类型检查和前端构建成功。
- [ ] 登录、租户上下文、菜单、权限、system 和 infra 路由完成 smoke 验证。
- [ ] 失败时保留同步快照、manifest 和验证报告。

## 业务试点

- [ ] 需求、规格、计划、交付和验证文档齐全。
- [ ] 业务模块没有引用 `yuheng-ui/src/**` 或 core 内部源码。
- [ ] API、数据库、权限、租户和 UI 契约均有证据。
- [ ] 已知基线失败已记录 owner、影响范围和修复计划。
- [ ] 回滚步骤已经在临时消费端验证。

发布完成后，将本检查表和验证报告一起归档到对应版本目录。
