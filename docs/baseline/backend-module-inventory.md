# Yuheng 后端模块基线清单

盘点日期：2026-10-25  
源仓库：`/Users/huhua/study/ai/yuheng/ruoyi-vue-pro`  
基线提交：`128a0e3bd3`（`master-jdk17`）

## 根 Maven 工程

`pom.xml` 的当前有效模块只有 5 个：

```text
yudao-dependencies
yudao-framework
yudao-server
yudao-module-system
yudao-module-infra
```

根 POM 中另有 18 个业务或扩展模块以注释形式保留，当前未参与默认 reactor：

```text
yudao-module-member
yudao-module-bpm
yudao-module-report
yudao-module-mp
yudao-module-pay
yudao-module-mall
yudao-module-crm
yudao-module-erp
yudao-module-iot
yudao-module-mes
yudao-module-wms
yudao-module-hrm
yudao-module-fms
yudao-module-pms
yudao-module-oa
yudao-module-im
yudao-module-ai
yudao-module-ai1-springai
```

根版本属性：

- Maven `groupId`：`cn.iocoder.boot`
- 根 artifact：`yudao`
- `revision`：`2026.09-SNAPSHOT`
- Java：17
- Spring Boot：3.5.15

## Framework 子模块

`yudao-framework/pom.xml` 当前包含：

```text
yudao-common
yudao-spring-boot-starter-mybatis
yudao-spring-boot-starter-redis
yudao-spring-boot-starter-web
yudao-spring-boot-starter-security
yudao-spring-boot-starter-websocket
yudao-spring-boot-starter-monitor
yudao-spring-boot-starter-protection
yudao-spring-boot-starter-job
yudao-spring-boot-starter-mq
yudao-spring-boot-starter-excel
yudao-spring-boot-starter-test
yudao-spring-boot-starter-biz-tenant
yudao-spring-boot-starter-biz-data-permission
yudao-spring-boot-starter-biz-ip
```

这些模块是 `yuheng-framework` 的首轮候选，但需要结合依赖树和组件扫描结果确认公开边界。

## Core 候选模块

| 当前模块 | 首轮目标 | 证据和风险 |
|---|---|---|
| `yudao-dependencies` | `yuheng-dependencies` | 统一版本 BOM；需要保留依赖管理结果 |
| `yudao-framework/*` | `yuheng-framework` | 统一响应、异常、Web、安全、MyBatis、缓存、租户、任务和消息；需要检查 starter 之间的反向依赖 |
| `yudao-module-system` | `yuheng-module-system` | 35 个 Controller、419 个 Java 文件、199 个映射方法；包含用户、角色、部门、菜单、租户、字典、通知和 OAuth2 等能力 |
| `yudao-module-infra` | `yuheng-module-infra` | 16 个 Controller、205 个 Java 文件、116 个映射方法；包含文件、配置、代码生成、日志、定时任务和数据源能力 |
| `yudao-server` | 消费端 bootstrap 的来源 | 当前同时承担启动、运行配置和模块聚合；需要拆成 core 公开入口与 demo 启动模块 |

## 业务候选模块

业务模块不进入首轮 core：

```text
yudao-module-member
yudao-module-bpm
yudao-module-report
yudao-module-mp
yudao-module-pay
yudao-module-mall
yudao-module-crm
yudao-module-erp
yudao-module-iot
yudao-module-mes
yudao-module-wms
yudao-module-hrm
yudao-module-fms
yudao-module-pms
yudao-module-oa
yudao-module-im
yudao-module-ai
yudao-module-ai1-springai
```

它们当前多数有独立测试资源和 Mapper XML；迁移前必须逐模块确认是否依赖 server 内部实现、system/infra 内部类或共享启动配置。

## 启动与配置

- 主启动类：`yudao-server/src/main/java/cn/iocoder/yudao/server/YudaoServerApplication.java`
- 主配置：`yudao-server/src/main/resources/application.yaml`
- 环境配置：`application-dev.yaml`、`application-local.yaml`
- 日志配置：`logback-spring.xml`
- 当前包名空间：`cn.iocoder.yudao`

首轮保留现有包名和启动行为，先稳定模块所有权，再单独规划 `com.yuheng` 命名空间迁移。
