---
name: yuheng-requirement-to-spec
description: Convert user requirements to formal specification
---

# Yuheng Requirement to Spec

将用户的原始需求转换为正式的需求规格说明书。

## 输入

- 用户口头描述的需求
- 会议纪要
- 需求文档草稿

## 输出

- 正式的需求规格说明书
- 包含：功能需求、非功能需求、约束条件、验收标准

## 执行流程

### 1. 调用 Brainstorming 进行需求探索

**核心步骤**:
调用 `yuheng-brainstorming` 完成：
- 需求澄清
- 方案对比
- 设计验证
- 设计文档编写

**输出**: 已批准的设计文档

### 2. 需求收集（由 Brainstorming 完成）

Brainstorming 会逐个询问：

- 这个功能的目标用户是谁？
- 要解决什么业务问题？
- 主要业务流程是什么？
- 有哪些约束条件？
- 如何验证功能是否完成？

### 3. 需求分析（由 Brainstorming 完成）

基于收集到的信息，分析：

- 功能范围（做什么，不做什么）
- 数据模型（需要哪些表和字段）
- 接口设计（需要哪些 API）
- 前端页面（需要哪些页面和组件）

### 4. 生成规格（由 Brainstorming 完成）

生成包含以下章节的规格文档：

```markdown
# 需求规格：{功能名称}

## 1. 概述
- 功能描述
- 目标用户
- 业务价值

## 2. 功能需求
### 2.1 功能列表
### 2.2 业务流程
### 2.3 数据模型

## 3. 接口设计
### 3.1 后端 API
### 3.2 前端页面

## 4. 非功能需求
- 性能要求
- 安全要求
- 可用性要求

## 5. 约束条件
- 技术约束
- 业务约束

## 6. 验收标准
- 功能验收
- 性能验收
```

### 5. 规格验证与冻结

**用户审查**:
- 提交规格文档给用户
- 收集反馈
- 必要时修改

**冻结规格**:
- 用户确认后，标记为 `FROZEN`
- 可以进入下一阶段

## 标准链路

```
用户原始需求
    ↓
yuheng-brainstorming
    ├─ 探索项目上下文
    ├─ 澄清问题（一次一个）
    ├─ 提出 2-3 种方案
    ├─ 展示设计并获批
    ├─ 编写设计文档
    └─ 设计自我审查
    ↓
(本 Skill 整合 brainstorming 输出)
    ↓
正式需求规格说明书（FROZEN）
    ↓
yuheng-spec-to-plan
```

## 与 Brainstorming 的关系

**调用关系**:
- 本 Skill 内部调用 `yuheng-brainstorming`
- Brainstorming 负责需求探索和设计验证
- 本 Skill 负责整合输出为正式规格

**职责划分**:
| 职责 | Brainstorming | Requirement-to-Spec |
|------|---------------|---------------------|
| 需求澄清 | ✅ | - |
| 方案对比 | ✅ | - |
| 设计验证 | ✅ | - |
| 设计文档 | ✅ | - |
| 规格整合 | - | ✅ |
| 规格冻结 | - | ✅ |

## 使用方法

```
用户："我需要实现用户管理功能"
AI：调用 yuheng-brainstorming 进行需求探索...
```

## 相关规则

- `@rules/yuheng-phase-gate.md` - 规格必须冻结才能进入实现
- `@rules/yuheng-design-gate.md` - 设计门禁规则

## 相关 Skills

- `@skills/yuheng-brainstorming.md` - 需求探索与设计
- `@skills/yuheng-spec-to-plan.md` - 规格转开发计划

## 下一步

规格冻结后，使用 `yuheng-spec-to-plan` 生成开发计划。
