# Demo UI 依赖审计

日期：2026-11-12；范围：隔离目录中的 `yuheng-demo-ui` 和 `yuheng-ui@0.1.0-SNAPSHOT` 本地打包产物，Node 22.23.2、npm 10.9.8，npm registry 临时指定为 `https://registry.npmjs.org/`。使用 `npm install` 的解析结果，临时生成本地包锁文件后执行 `npm audit --json` 和 `npm audit --omit=dev --json`。本地锁文件含机器路径，只用于审计，未纳入消费端。

- 全依赖树：22 项告警，7 moderate、13 high、2 critical。critical 位于 Vitest / tinypool 测试工具链，npm 建议升级 Vitest 至 3.2.7；是否可利用取决于测试服务的使用和暴露方式。
- `--omit=dev`：19 项告警，6 moderate、13 high、0 critical。high 包含 axios、Vue / server-renderer、Vue I18n、form-create 的旧 wangeditor 链以及相关传递依赖。npm 报告按依赖树聚合，数量不等于独立漏洞或已经确认可利用的攻击路径；`--omit=dev` 也不能单独证明某包进入生产浏览器 bundle。
- npm 建议可升级 Vue、Vue I18n 和部分工具；对 axios 和旧 wangeditor 链未给出可直接执行的修复。`yuheng-ui` 的 axios、Vue I18n 等依赖由 core 发布包声明，须在 core 修改并重新打包，再验证消费端及原版功能；不能仅在 demo 强制覆盖并声称修复。
- npm 安装时本机配置的内网 registry 超时；使用公共 registry 可安装公开依赖。`yuheng-ui@0.1.0-SNAPSHOT` 尚未确认发布位置，隔离构建通过显式本地 tarball 完成。
- 用户要求 demo 不依赖 core 源码路径。已验证以本机 tarball 生成的 npm 锁文件会记录机器相关 `file:` 路径，不能作为跨机器的正式锁文件。正式 registry 或本地测试 registry 能以 `yuheng-ui@0.1.0-SNAPSHOT` 提供包后，应重新解析、提交消费端锁文件，并用全新目录 `npm ci`、类型检查、构建和单 JAR HTTP 测试验证；升级 core 时同步更新版本和锁文件。

审计数据是该次解析的快照，后续依赖解析和 npm advisory 数据可能变化。未修改依赖版本，也未运行 `npm audit fix`。
