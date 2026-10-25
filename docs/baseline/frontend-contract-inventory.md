# Yuheng 前端契约基线清单

盘点日期：2026-10-25  
源仓库：`/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`  
基线提交：`050bac1ec`（`master`）

## 工程事实

- 包名：`yudao-ui-admin-vue3`
- 版本：`2026.09-snapshot`
- Vue：3.5.34
- Vite：8.1.4
- Element Plus：2.13.7
- Node：`>=20.19.0`
- pnpm：`>=8.6.0`
- 锁文件：`pnpm-lock.yaml`
- 构建配置：`vite.config.ts`
- 入口：`src/main.ts`
- 根组件：`src/App.vue`

## 规模快照

| 区域 | 文件数 |
|---|---:|
| `src/api` | 552 |
| `src/views` | 1905 |
| `src/components` | 330 |
| `src/store` | 10 |
| `src/router` | 2 |
| `src/layout` | 48 |
| `src/config` | 4 |

## 业务 API 分区

`src/api` 当前包含：

```text
ai
ai1
bpm
crm
erp
fms
hrm
im
infra
iot
login
mall
member
mes
mp
oa
pay
pms
report
system
wms
```

## 平台候选能力

首轮进入 `yuheng-ui` 的候选区域：

- `src/main.ts`、`src/App.vue` 和全局插件装配；
- `src/config/axios` 请求、错误码和拦截器；
- `src/router`、权限守卫和动态路由；
- `src/store/modules/app.ts`、`user.ts`、`permission.ts`、`locale.ts`、`dict.ts`、`lock.ts`、`tagsView.ts`；
- `src/layout` 和登录/错误/重定向页面；
- 通用组件、主题、Element Plus、Icon、上传、表格、表单和权限指令；
- `src/api/login`、`src/api/system`、`src/api/infra` 以及相应平台页面。

## 业务候选能力

以下 API 和页面目录首轮留在消费端业务 UI，不能因为目录存在于同一前端仓库就自动进入 core：

```text
ai/ai1/bpm/crm/erp/fms/hrm/im/iot/mall/member/mes/mp/oa/pay/pms/report/wms
```

最终归属必须通过页面路由、Store、菜单和后端模块依赖联合确认。

## 前端验证命令

依赖已经存在时执行：

```bash
pnpm --dir /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 run ts:check
pnpm --dir /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 run lint:eslint:check
pnpm --dir /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 run lint:format:check
pnpm --dir /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 run lint:style:check
pnpm --dir /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 run build:local
```

依赖未安装时，先执行 `pnpm install --frozen-lockfile`，并把 registry、Node、pnpm 和失败日志记录到验证证据；不修改 lock 文件作为基线盘点的一部分。
