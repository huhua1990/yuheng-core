# yuheng-ui 包身份验证

日期：2026-11-11  
core 基线：`afbd19e`，记录包含本轮未提交工作区变更。  
demo 基线：`b9c4906`，包含用户已有的 Java 重命名及未暂存修改；未编辑或暂存 Java 文件。

## 执行环境

- Node.js `22.23.2`、pnpm `9.15.9`。
- core UI 独立安装依赖，没有使用锁文件；安装报告视频播放器和 ECharts 的 peer 版本警告。
- 构建并打包 `yuheng-ui@0.1.0-SNAPSHOT` 到 `/tmp/yuheng-ui-0.1.0-SNAPSHOT.tgz`。tarball 包含 `compat/assets` 作为内部随包资源，但不再通过 `./compat/assets/*` 对消费者公开。
- demo UI 副本位于 `/tmp/yuheng-ui-final.lnDQ98`，从该 tarball 通过 `file:` 安装；没有解析到 core 工作树。

## 结果

| 检查 | 结果 | 证据 |
|---|---|---|
| 包身份回归 | PASS | 修改前断言收到 `@yuheng/platform-ui` 并失败；修改后 `tests/release/package-identity.test.ts` 1 项通过 |
| core UI build | PASS | `pnpm run build` 成功，Vite 处理 1461 个模块；存在动态导入不能分块的警告 |
| core UI boundary | PASS | `pnpm run lint:boundary` 输出 `yuheng-ui boundary: PASS` |
| core UI 全量测试 | PASS | `pnpm test`：22 suites、100 项测试通过 |
| core UI 全量类型检查 | PASS | `pnpm run typecheck` 退出码 0 |
| core UI 发布出口测试 | PASS | 4 项通过；移除了 `./compat/assets/*` 通配公开出口 |
| core UI 边界检查 | PASS | `pnpm run lint:boundary` 输出 `yuheng-ui boundary: PASS` |
| core UI 最终构建 | PASS | `pnpm run build` 成功，Vite 处理 1461 个模块；保留既有动态导入分块警告 |
| 迁移所有权清单 | PASS | 3004 项：core 460、demo 2515、排除样例 29；业务资产归 demo 并随模板源码复制 |
| core manifest/bundle | PASS | `verify_manifest.py`、`verify_bundle.py` 返回 `PASS`；资产入口 `--check` 返回 `PASS` |
| core 治理测试 | PASS | `python3 -m unittest discover -s tools/governance/tests -v`：38 项通过 |
| 隔离 demo UI 消费 | PASS | 从新 tarball 安装；`pnpm test` 1 项通过，`typecheck`、`build` 和 `lint:platform-imports` 成功 |
| demo 工作树直接验证 | BLOCKED | demo `yuheng-demo-ui` 没有 `node_modules`；隔离消费副本已覆盖包的安装和构建行为 |
| Liquibase 实施 | 未完成 | 仅完成 SQL 基线只读盘点；未发现受版本控制的应用 changelog 或 Liquibase Maven 配置 |
| 公开发布 | 未执行 | 未向 npm 仓库发布 |

首次执行发布出口测试及类型检查时，`tests/integration/boundary-helpers.ts` 中正则字面量跨物理行导致语法错误；核对 Git HEAD 后确认该错误已存在，修复为 `split(/\r?\n/)` 后才得到上述完整检查结果。修复测试辅助文件不代表其他既有失败已经解决。

工作区整体安装在包名修改前因 demo 查找 `yuheng-ui` 时 npm 仓库返回 404 而失败；隔离消费验证使用本次实际 tarball，不能证明 npm 仓库已发布该版本。

## 2026-11-16 当前 tarball 包外消费续验

- 当前制品 `/tmp/yuheng-ui-0.1.0-SNAPSHOT.tgz` SHA-256：`d92f0f81da2848b34b40ec27755ae37a55b04e961cc8460121c79f29980d900a`。隔离 Demo 消费副本 `/tmp/yuheng-ui-consumer-current.CSVU3S/consumer` 通过 pnpm `file:` 依赖安装该 tarball；实际 `node_modules/yuheng-ui/dist/index.js` SHA-256 与当前 Core build 产物及新包内文件一致，解析路径位于副本 `node_modules/.pnpm`，不指向 Core 仓库。
- 当前包外消费者 `vue-tsc --noEmit` 退出 0；`lint:platform-imports` 为 PASS；Vitest 2 个文件/11 项通过；Vite production build 转换 3548 个模块并成功，保留超过 500 kB chunk 提示。
- 初次 `pnpm add file:` 令隔离副本 manifest 的 yuheng-ui 规格变成绝对 tarball 地址，故当次消费者契约测试 10/11，唯一失败是断言固定版本规格。恢复副本 manifest 到 `0.1.0-SNAPSHOT` 后，通过已安装二进制直接运行同一套 Vitest 得 11/11；临时副本未同步到工作区。
- 对配置内网 registry `http://172.26.0.19:8081/repository/npm-group/` 与公共 npm registry `https://registry.npmjs.org/` 查询固定包 `yuheng-ui@0.1.0-SNAPSHOT` 均返回 404。没有执行发布、没有修改锁文件。当前 tarball 包外消费已验证，但 registry 发布及从固定版本坐标的干净安装仍未完成，T1 保持开放。
