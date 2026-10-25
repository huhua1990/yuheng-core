# 阶段 1 内部 dogfooding 出口

验证日期：2026-10-25

## 已形成的闭环

```text
yuheng-core manifest
→ governance rules / skills / knowledge
→ yuheng-demo sync --apply
→ yuheng-demo postcheck
→ yuheng-demo sync --verify
```

代码版本、治理版本和知识版本由 manifest 独立记录；同步资产不进入 Spring Boot 或 Vue 运行时依赖。

## 已完成

- Task 1：仓库、后端、数据库、API、前端和兼容基线；
- Task 2：manifest schema、兼容矩阵、治理规则、公开 skills、知识轨道、manifest/bundle 验证器；
- Task 3：消费端 `check/apply/verify`、原子替换、保护目录、旧 Athena 命名空间兼容和 postcheck；
- Task 4：core/demo 逻辑边界审计和阶段报告，未修改 ruoyi 源代码或 POM。

## 当前验证结果

- core 治理单元测试：11 个通过；
- yuheng-demo 同步与初始化测试：4 个通过；
- core manifest 验证：`PASS`；
- core bundle 验证：`PASS`；
- yuheng-demo postcheck：`PASS`；
- yuheng-demo `sync --check`：`PASS`，无差异；
- yuheng-demo `sync --verify`：`PASS`；
- ruoyi、Vue3 和 Athena `demo` 工作区：无修改、无提交。

## 阶段出口和下一步

阶段 1 的 AI 治理闭环已经可以自举，后端 core/demo 发布边界也已完成第一次可复现验证：

1. `yuheng-core` 已发布 `0.1.0-SNAPSHOT` 到本地 Maven repository；
2. `yuheng-demo` 已通过 `com.yuheng:yuheng-server` 构建，不引用 core 源码；
3. 完整后端测试保留 1 个源工程同样存在的随机 `moduleName` 基线失败；
4. 前端 `node_modules` 尚未安装，Vue 类型检查和构建仍需在前端依赖恢复后执行；
5. 下一步进入前端 `yuheng-ui` 边界拆分和业务模块按域迁移。
