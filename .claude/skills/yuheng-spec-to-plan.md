---
name: yuheng-spec-to-plan
description: Convert specification to development plan
---

# Yuheng Spec to Plan

将需求规格转换为可执行的开发计划。

## 输入

- 已冻结的需求规格说明书

## 输出

- 详细的开发计划
- 任务拆解
- 时间估算
- 技术方案

## 执行流程

### 1. 读取规格

从规格文档中提取：
- 功能需求列表
- 数据模型设计
- 接口设计
- 页面设计

### 2. 技术方案设计

基于规格，设计技术实现方案：

#### 后端方案
- 需要创建哪些表（Liquibase 迁移）
- 需要开发哪些 API（Controller/Service/Mapper）
- 需要哪些 DTO/VO
- 需要哪些业务逻辑

#### 前端方案
- 需要创建哪些页面
- 需要哪些组件
- 需要哪些 API 调用
- 需要哪些 Store

### 3. 任务拆解

将技术方案拆解为可执行任务：

```markdown
# 开发计划：{功能名称}

## 1. 数据库设计
- [ ] 创建迁移脚本 V1.0.1-create-xxx-table.yaml
- [ ] 创建 SQL 文件

## 2. 后端开发
- [ ] 创建 DO: XxxDO
- [ ] 创建 Mapper: XxxMapper + XxxMapper.xml
- [ ] 创建 Service: XxxService
- [ ] 创建 Controller: XxxController
- [ ] 创建 DTO: XxxCreateReqDTO, XxxPageReqDTO
- [ ] 创建 VO: XxxRespVO
- [ ] 编写单元测试

## 3. 前端开发
- [ ] 创建 API: api/xxx.js
- [ ] 创建页面: views/xxx/xxx/index.vue
- [ ] 创建表单组件（如需要）
- [ ] 集成权限控制

## 4. 联调测试
- [ ] 后端单元测试
- [ ] 接口联调
- [ ] 前端功能测试
```

### 4. 时间估算

为每个任务估算时间：
- 简单 CRUD：2-4小时
- 复杂业务逻辑：1-2天
- 页面开发：4-8小时

### 5. 用户确认

提交开发计划给用户审核。

### 6. 冻结计划

用户确认后，将计划状态标记为 `FROZEN`，可以进入实施阶段。

## 使用方法

```
输入：已冻结的规格文档
AI：生成开发计划...
```

## 相关规则

- `@rules/yuheng-phase-gate.md` - 计划必须冻结才能进入实现
- `@rules/yuheng-backend-tdd.md` - 后端开发必须 TDD

## 下一步

计划冻结后，使用 `yuheng-delivery-execution` 执行交付。
