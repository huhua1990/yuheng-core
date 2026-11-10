---
name: yuheng-full-workflow
description: Complete workflow from requirement to delivery
---

# Yuheng Full Workflow

完整的从需求到交付的全流程工作流。

## 概述

自动串联以下阶段：
1. 需求规格（Requirement to Spec）
2. 开发计划（Spec to Plan）
3. 交付执行（Delivery Execution）

## 输入

- 用户原始需求描述

## 输出

- 可运行的完整功能代码
- 测试报告
- 交付文档

## 执行流程

```mermaid
graph LR
    A[原始需求] --> B[Brainstorming]
    B --> C[需求规格]
    C --> D[用户确认]
    D --> E[开发计划]
    E --> F[用户确认]
    F --> G[交付执行]
    G --> H[完成]
```

### 阶段 1: 需求探索与规格化

调用 `yuheng-requirement-to-spec`（内部使用 `yuheng-brainstorming`）：

1. **Brainstorming 阶段**:
   - 探索项目上下文
   - 逐个澄清问题
   - 提出 2-3 种方案
   - 展示设计并获批
   - 编写设计文档
   
2. **规格整合**:
   - 整合 brainstorming 输出
   - 生成正式规格文档
   - 用户确认并冻结

**门禁**: 规格必须 `FROZEN` 才能进入下一阶段

### 阶段 2: 开发计划

调用 `yuheng-spec-to-plan`：

1. 读取冻结的规格
2. 设计技术方案
3. 拆解开发任务
4. 估算时间
5. 用户确认并冻结

**门禁**: 计划必须 `FROZEN` 才能进入下一阶段

### 阶段 3: 交付执行

调用 `yuheng-delivery-execution`：

1. 数据库迁移
2. 后端开发（TDD）
3. 前端开发
4. 联调测试
5. 交付检查

**门禁**: 所有检查项通过才能标记完成

## 阶段门禁

遵守 `@rules/yuheng-phase-gate.md`：

| 阶段 | 前置条件 | 输出状态 |
|------|---------|---------|
| 需求规格 | 无 | `Spec FROZEN` |
| 开发计划 | `Spec FROZEN` | `Plan FROZEN` |
| 交付执行 | `Plan FROZEN` | `Implementation Allowed=true` |

## 使用示例

### 示例 1: 简单 CRUD

```
用户："我要实现产品管理功能，包括增删改查"

AI 执行流程：
1. 需求规格
   - 分析：产品 CRUD
   - 表结构：biz_product (id, name, price, status)
   - API：page/create/update/delete
   - 页面：产品列表页
   
2. 开发计划
   - 数据库迁移：1个
   - 后端开发：8类产物
   - 前端开发：1个页面
   - 估时：4-6小时
   
3. 交付执行
   - TDD 开发后端
   - 创建前端页面
   - 联调测试
   - 交付完成
```

### 示例 2: 复杂业务

```
用户："我要实现订单管理，包括下单、支付、退款"

AI 执行流程：
1. 需求规格
   - 分析：订单流程复杂，涉及状态机
   - 表结构：biz_order, biz_order_item, biz_payment
   - API：15个接口
   - 页面：订单列表、订单详情、支付页面
   
2. 开发计划
   - 数据库迁移：3个表
   - 后端开发：复杂业务逻辑 + 状态机
   - 前端开发：3个页面
   - 估时：3-5天
   
3. 交付执行
   - 按计划逐步实现
   - 持续 TDD
   - 分批交付
```

## 中途停止

如果任何阶段需要用户决策：
- 明确说明当前阶段
- 列出待确认事项
- 等待用户确认后继续

## 使用方法

```
用户："实现XXX功能"
AI：启动 yuheng-full-workflow...
```

## 相关规则

- `@rules/yuheng-phase-gate.md` - 阶段门禁
- `@rules/yuheng-backend-tdd.md` - TDD 强制
- `@rules/yuheng-delivery-check.md` - 交付检查

## 相关 Skills

- `yuheng-requirement-to-spec` - 需求规格
- `yuheng-spec-to-plan` - 开发计划
- `yuheng-delivery-execution` - 交付执行
- `yuheng-backend-delivery` - 后端专项
