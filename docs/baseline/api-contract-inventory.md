# Yuheng API 契约基线清单

盘点日期：2026-10-25  
源仓库：`/Users/huhua/study/ai/yuheng/ruoyi-vue-pro`  
基线提交：`128a0e3bd3`

## 盘点范围

首轮重点盘点：

- `yudao-module-system/src/main/java/**/controller/**`
- `yudao-module-infra/src/main/java/**/controller/**`
- `yudao-server/src/main/java/**/controller/**`
- 前端 `yudao-ui-admin-vue3/src/api/system`、`src/api/infra`、`src/api/login`
- 统一响应、异常、错误码、分页和租户上下文实现。

## 数量快照

| 模块 | Java 文件 | Controller | 映射方法 |
|---|---:|---:|---:|
| `yudao-module-system` | 419 | 35 | 199 |
| `yudao-module-infra` | 205 | 16 | 116 |

这些数字是基于 Controller 文件和 `@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping`、`@PatchMapping` 行的静态盘点，后续要以 Spring 路由扫描和接口测试补充确认。

## 已确认的核心路由族

### system

```text
/system/user
/system/role
/system/dept
/system/menu
/system/permission
/system/dict-type
/system/dict-data
/system/tenant
/system/tenant-package
/system/notify-template
/system/notify-message
/system/operate-log
/system/login-log
/system/auth
/system/oauth2-*
/system/social-*
/system/captcha
/system/notice
```

### infra

```text
/infra/file
/infra/file-config
/infra/config
/infra/codegen
/infra/job
/infra/job-log
/infra/db
/infra/redis
/infra/api-access-log
/infra/api-error-log
```

实际完整路径以各 Controller 的类级 `@RequestMapping` 与方法级映射合并结果为准，不能只根据目录名称生成 API 文档。

## 契约检查项

- HTTP 方法和路径保持兼容；
- 请求 DTO、响应 DTO、分页字段和 JSON 命名保持兼容；
- 统一响应结构、错误码和异常映射保持兼容；
- 登录、权限、数据权限和租户上下文的失败行为保持兼容；
- 文件、导出、下载和 SSE/WebSocket 等非普通 JSON 场景单独记录；
- 前端 API 文件与后端路由建立可追溯映射；
- API 快照测试必须覆盖成功、参数失败、权限失败、租户隔离和旧客户端请求。

## 重点证据位置

- 后端 Controller：`ruoyi-vue-pro/yudao-module-system/src/main/java/cn/iocoder/yudao/module/system/controller`；
- 后端 Controller：`ruoyi-vue-pro/yudao-module-infra/src/main/java/cn/iocoder/yudao/module/infra/controller`；
- 前端 system API：`yudao-ui-admin-vue3/src/api/system`；
- 前端 infra API：`yudao-ui-admin-vue3/src/api/infra`；
- 前端登录 API：`yudao-ui-admin-vue3/src/api/login`；
- 统一错误码：`ruoyi-vue-pro/yudao-framework` 与 `yudao-ui-admin-vue3/src/config/axios/errorCode.ts`。
