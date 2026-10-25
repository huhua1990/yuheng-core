# Yuheng UI 平台验证报告

日期：2026-10-26（Asia/Shanghai）

## 版本与基线

- 只读前端基线：`yudao-ui-admin-vue3@050bac1eccfbe7393a1568d614151cc99501b949`，验证时 `git status --short` 为空。
- 平台包实现提交：`yuheng-core` 分支 `feat/yuheng-ui-platform`，Task 5 提交 `8f1d87b`，Task 6 提交 `0d56e62`。
- 平台包版本：`yuheng-ui@0.1.0-SNAPSHOT`。
- 消费端提交：`yuheng-demo` 分支 `feat/yuheng-demo-ui`，`c7efc4b`（消费端）和 `6877e54`（manifest）。
- 消费端版本：`yuheng-demo-ui@0.1.0-SNAPSHOT`。

## 平台包验证

工作目录：`yuheng-core/yuheng-ui`，命令使用 Node 22.23.2：

```text
pnpm test                         10 files, 43 tests passed
pnpm run typecheck                passed
pnpm run build                    passed
node scripts/check-boundary.mjs   yuheng-ui boundary: PASS
git diff --check                 passed
```

平台公开路由共 43 个，前 5 个公共路由为 `Login`、`Error`、`Redirect`、`Profile`、`Home`；system 路由包括 `SystemUser`、`SystemRole`、`SystemDept`、`SystemPost`、`SystemMenu`、`SystemTenant`、`SystemTenantPackage`、`SystemDict`、`SystemNotice`、`SystemLoginLog`、`SystemOperateLog`、`SystemOauth2Client`、`SystemOauth2Token`、`SystemSocialClient`、`SystemSocialUser`、`SystemSmsChannel`、`SystemSmsLog`、`SystemSmsTemplate`、`SystemMailAccount`、`SystemMailLog`、`SystemMailTemplate`、`SystemNotifyMessage`、`SystemNotifyTemplate`、`SystemArea`；infra 路由包括 `InfraApiAccessLog`、`InfraApiErrorLog`、`InfraCodegen`、`InfraConfig`、`InfraDataSourceConfig`、`InfraFile`、`InfraFileConfig`、`InfraJob`、`InfraJobLog`、`InfraRedis`、`InfraServer`、`InfraSwagger`、`InfraSkywalking`、`InfraWebsocket`。

system 和 infra API 适配保留基线 `/system/**` 与 `/infra/**` endpoint 字符串；`infra/demo` 没有进入默认平台路由。消费端和平台包均没有引用 `yuheng-ui/src/**`，平台边界扫描同时拒绝业务域导入和只读基线绝对路径。

## 消费端验证

工作目录：`yuheng-demo/yuheng-demo-ui`。验证使用打包后的 `yuheng-ui-0.1.0-SNAPSHOT.tgz` 安装到临时 `node_modules`，未提交 `file:` 依赖：

```text
pnpm test                       1 file, 1 test passed
pnpm run typecheck              passed
pnpm run build                  passed
pnpm run lint:platform-imports  yuheng-demo-ui platform import boundary: PASS
```

消费端只通过 `yuheng-ui` 根入口使用 `installYuhengUi`、`registerPlatformRoutes` 和 `YuhengShell`；业务路由仍位于 `src/router/business.ts` 和 `src/views/Home`。

## 已知限制

第一阶段建立平台包契约、请求/认证运行时、system/infra API 和路由边界，并保留公共页面和组件的可安装骨架。基线中延后的布局视觉、完整通用组件行为和公共页面细节按后续迁移任务逐步替换。`infra/demo` 不作为默认平台路由；当前没有连接后端实例的浏览器回归验证。
