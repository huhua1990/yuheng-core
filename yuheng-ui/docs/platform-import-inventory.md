# Task 4 平台导入清单与边界分类

来源基线：`/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`（只读）。本清单记录应用壳层任务的导入扫描与归属决策，迁移代码只写入 `yuheng-ui`。

## 扫描范围

使用以下命令扫描 `layout`、`components`、`styles` 和 `views/Login|Error|Redirect|Profile` 的 `@/` 导入：

```bash
rg -n "from ['\"]@/(api|store|router|views|components|utils|config|hooks)" \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/layout \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/components \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/styles \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Login \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Error \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Redirect \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Profile
```

## 平台归属并已迁入

- 应用壳层：`src/layout/Layout.vue`、`src/layout/index.ts`、`src/layout/components/AppView.vue`。
- 公共页面：`src/pages/Login/**`、`src/pages/Error/**`、`src/pages/Redirect/**`、`src/pages/Profile/**`。
- 样式与语言：`src/styles/**`、`src/styles.css`、`src/locales/**`。
- 无业务依赖的通用组件：`ConfigGlobal`、`ContentWrap`、`ContentDetailWrap`、`Form`、`Table`、`Pagination`、`Dialog`、`UploadFile`、`Icon`、`Error`、`Backtop`。
- 平台插件：Element Plus、Vue I18n、`v-focus` 指令、平台全局组件注册和图标注册表契约（`src/plugins/index.ts`）。

迁移后的文件只使用包内相对路径或 `@yuheng-ui/*`，不依赖基线别名。

## 归属消费端并排除

- 引用 `@/api/bpm/**`、`@/views/crm/**` 以及其它业务域 API、Store、页面的组件，留在消费端。
- `DiyEditor`、BPMN/流程设计器、商城/CRM/ERP/FMS 等业务组件，留在消费端。
- 仅用于演示的 `views/infra/demo/**` 页面不进入平台默认路由。
- 基线中的构建插件（UnoCSS、统计脚本、业务表单设计器、业务编辑器）不作为平台包运行时依赖。

`check-boundary.mjs` 会扫描 `yuheng-ui/src`，发现基线路径、消费端路径或业务导入时返回失败并打印文件与行号。
