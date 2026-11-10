---
name: yuheng-workflow-router
description: Route user requests to appropriate workflow
---

# Yuheng Workflow Router

工作流路由，帮助用户选择正确的开发入口。

## 功能

根据用户的需求描述，自动选择最合适的 Skill 或工作流。

## 路由规则

### 1. 完整功能开发

**用户说**："我要实现XXX功能"

**路由到**: `yuheng-full-workflow`

**说明**: 完整的需求→规格→计划→交付流程

---

### 2. 只有需求，需要规格

**用户说**："帮我分析这个需求"

**路由到**: `yuheng-requirement-to-spec`

**说明**: 将需求转换为规格文档

---

### 3. 有规格，需要计划

**用户说**："根据规格生成开发计划"

**路由到**: `yuheng-spec-to-plan`

**说明**: 将规格转换为开发计划

---

### 4. 有计划，执行开发

**用户说**："按计划开始开发"

**路由到**: `yuheng-delivery-execution`

**说明**: 执行开发计划，交付代码

---

### 5. 后端专项开发

**用户说**："生成XXX的后端CRUD代码"

**路由到**: `yuheng-backend-delivery`

**说明**: 后端专项交付（TDD + 8类产物）

---

### 6. 前端专项开发

**用户说**："创建XXX页面"

**路由到**: `yuheng-page-delivery`

**说明**: 前端页面专项交付

---

### 7. 不确定

**用户说**："不知道从哪里开始"

**建议**: 
1. 如果有明确需求 → `yuheng-full-workflow`
2. 如果只是想法 → `yuheng-requirement-to-spec`
3. 如果已有规格 → `yuheng-spec-to-plan`

---

## 使用方法

```
用户："我想实现产品管理功能"
AI：分析需求，路由到 yuheng-full-workflow
```

## 输出格式

```
【路由决策】
用户需求：{用户输入}
分析：{需求分析}
推荐 Skill：{skill_name}
理由：{为什么选择这个 Skill}

【开始执行】
正在调用 {skill_name}...
```
