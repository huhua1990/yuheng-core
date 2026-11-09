---
name: yuheng-delivery-execution
description: Execute development plan and deliver working code
---

# Yuheng Delivery Execution

执行开发计划，交付可运行的代码。

## 输入

- 已冻结的开发计划

## 输出

- 可运行的代码
- 通过的测试
- 交付检查报告

## 执行流程

### 1. 读取开发计划

从计划中提取任务列表，按顺序执行。

### 2. 数据库迁移

#### 2.1 创建迁移脚本

遵守 `@rules/database-migration.md`：

```yaml
databaseChangeLog:
  - changeSet:
      id: V1.0.1-create-xxx-table
      author: yuheng
      preConditions:
        - onFail: MARK_RAN
        - not:
            tableExists:
              tableName: biz_xxx
      changes:
        - sql:
            sql: |
              CREATE TABLE biz_xxx (...)
```

#### 2.2 验证迁移

执行 Liquibase 验证。

### 3. 后端开发

遵守 `@rules/yuheng-backend-tdd.md`，TDD 流程：

#### 3.1 先写测试（红灯）

```java
@Test
void testCreate() {
    // 期望行为
    XxxCreateReqDTO reqDTO = new XxxCreateReqDTO();
    Long id = xxxService.create(reqDTO);
    assertNotNull(id);
}
```

执行测试，确认红灯。

#### 3.2 写实现（绿灯）

按顺序创建：
1. DO + Mapper.xml
2. Mapper
3. Service
4. Controller
5. DTO/VO

遵守 `@rules/backend-code-style.md`。

#### 3.3 再次测试（确认绿灯）

执行测试，确认通过。

### 4. 前端开发

遵守 `@rules/frontend-code-style.md`：

#### 4.1 创建 API

```javascript
// api/xxx.js
import { request } from 'yuheng-ui'

export const page = (params) => request.post('/api/xxx/page', params)
export const create = (data) => request.post('/api/xxx/create', data)
```

#### 4.2 创建页面

```vue
<!-- views/xxx/xxx/index.vue -->
<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <!-- 操作按钮 -->
    <!-- 数据表格 -->
    <!-- 分页 -->
  </div>
</template>
```

### 5. 交付检查

遵守 `@rules/yuheng-delivery-check.md`：

#### 后端检查
- [ ] 代码已编译通过
- [ ] 单元测试已通过
- [ ] TDD 证据完整
- [ ] 已检查现有能力
- [ ] 返回值使用 `CommonResult`

#### 前端检查
- [ ] 页面可正常访问
- [ ] 复用框架 Store
- [ ] 无重复数据请求
- [ ] Console 无错误

### 6. 生成交付报告

```markdown
# 交付报告：{功能名称}

## 已完成
- ✅ 数据库迁移
- ✅ 后端 API（5个）
- ✅ 前端页面（1个）
- ✅ 单元测试（10个）

## 测试结果
- ✅ 单元测试：10/10 通过
- ✅ 接口测试：5/5 通过
- ✅ 前端测试：无 Console 错误

## 部署说明
1. 执行数据库迁移
2. 重启后端服务
3. 刷新前端页面
```

## 使用方法

```
输入：已冻结的开发计划
AI：按 TDD 方式执行开发...
```

## 相关规则

- `@rules/yuheng-phase-gate.md` - 计划冻结才能实现
- `@rules/yuheng-backend-tdd.md` - TDD 强制
- `@rules/backend-code-style.md` - 代码规范
- `@rules/yuheng-delivery-check.md` - 交付检查

## 后端交付专项

复杂后端任务可使用 `yuheng-backend-delivery` 专项交付。
