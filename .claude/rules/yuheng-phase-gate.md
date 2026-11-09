# Yuheng 阶段硬门禁

本文件是 Yuheng 项目 AI 开发的第一道硬门禁。只要任务触及前端页面新增/变更、后端接口新增/变更、数据库迁移、菜单/权限改动或框架公共能力变更，就必须先执行本文件。

---

## 1. 机器可检查状态

每个开发任务必须显式写出：

```text
PHASE_GATE:
- Task Type: frontend / backend / mixed
- Affected Module: <模块名>
- Risk Level: P0 / P1 / P2
- Spec Status: NOT_REQUIRED / DRAFT / READY_FOR_REVIEW / FROZEN
- Plan Status: NOT_REQUIRED / DRAFT / READY_FOR_REVIEW / FROZEN
- Implementation Allowed: false / true
- Owner Review Required: false / true
- Gate Evidence:
  - spec: <路径或 N/A>
  - plan: <路径或 N/A>
```

`Implementation Allowed` 只能由下列规则推导：

1. 后端-only 且不涉及可见页面结构：`Spec Status` 必须是 `FROZEN` 或 `NOT_REQUIRED`（仅限纯 bugfix/配置调整），且 `Plan Status` 必须是 `FROZEN` 或 `NOT_REQUIRED`。
2. 前端页面任务：`Spec Status` 必须是 `FROZEN`。
3. 数据库迁移：`Spec Status` 必须是 `FROZEN`。
4. 必需的规格或 plan 证据缺路径时，默认 `Implementation Allowed=false`。
5. 涉及公共框架能力变更（yuheng-core 前后端）：必须先评估消费端影响，未评估时 `Implementation Allowed=false`。

---

## 2. 停止规则

当 `Implementation Allowed=false` 时，agent 只能做以下事情：

1. 读取规则、现有代码、相关文档和 knowledge。
2. 产出或修正需求规格、开发计划、任务拆解或待审问题。
3. 回写状态为 `READY_FOR_REVIEW` 或 `NEEDS_OWNER_DECISION`。

当 `Implementation Allowed=false` 时，禁止：

1. 修改 Vue、Java、路由、API、数据库 schema、迁移脚本、公共组件或运行时代码。
2. 运行会产生实现代码的脚手架或生成器。
3. 把"已生成规格 / 已生成计划"解释为"用户已确认"。

---

## 3. 允许实现的最低条件

进入实现前，任务必须同时满足：

1. `PHASE_GATE` 字段，且 `Implementation Allowed=true`。
2. 规格路径与状态（前端页面类任务），或明确的 owner 豁免。
3. 明确的 `Only Modify` 和 `Do Not Modify` 范围。
4. 若涉及数据库迁移，迁移脚本路径和 Liquibase changelog 记录方式。

---

## 4. 标准停机回复

如果需要用户审核，最终回复必须包含：

```text
当前阶段：
已产出：
待用户审核：
禁止进入实现的原因：
下一步需要用户确认：
```

不得在同一回复中附带实现代码 diff、实现计划的"我将马上开始编码"承诺，或任何已经修改实现文件的声明。

---

## 5. 与现有 Skill 的关系

- `yuheng-full-workflow`：串联需求规格 → 开发计划 → 交付执行，每个阶段结束时检查本门禁。
- `yuheng-delivery-execution`：进入实现前必须确认 `Implementation Allowed=true`。
- `yuheng-backend-delivery`：后端任务必须先冻结 spec，再进入 TDD 实现。

---

**规则版本**: v1.0  
**更新时间**: 2024-11-09
