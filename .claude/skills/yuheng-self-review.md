---
name: yuheng-self-review
description: Final self-review before delivery
---

# Yuheng Self Review

交付前的自我审查，确保质量。

## 功能

在代码交付前，进行最后一道全面检查。

## 检查清单

### 1. 后端检查

#### 1.1 代码规范
- [ ] 使用 `@Slf4j`，无 `System.out`
- [ ] 统一返回 `CommonResult`
- [ ] Service 继承 `ServiceImpl`
- [ ] Mapper 继承 `BaseMapperX`
- [ ] 所有接口使用 POST

#### 1.2 TDD 证据
- [ ] 有测试代码
- [ ] 测试已通过
- [ ] 红灯 → 实现 → 绿灯流程完整

#### 1.3 8类产物
- [ ] DO - 数据对象
- [ ] Mapper - MyBatis Mapper
- [ ] Mapper.xml - XML 映射
- [ ] Service - 服务层
- [ ] Controller - 控制器
- [ ] DTO - 请求参数
- [ ] VO - 响应数据
- [ ] Convert - 对象转换

#### 1.4 数据库迁移
- [ ] 有 Liquibase changeset
- [ ] 表名小写 snake_case
- [ ] 有表注释和字段注释
- [ ] 未修改基础表

#### 1.5 日志规范
- [ ] 无敏感信息
- [ ] 使用占位符
- [ ] 异常有堆栈

---

### 2. 前端检查

#### 2.1 目录结构
- [ ] 三级目录：`views/{group}/{module}/index.vue`
- [ ] API 文件在 `api/` 目录

#### 2.2 框架使用
- [ ] 使用 `request` from 'yuheng-ui'
- [ ] 复用框架 Store
- [ ] 响应判断 `res.code === 0`

#### 2.3 页面功能
- [ ] 页面可正常访问
- [ ] 数据加载正常
- [ ] 操作按钮有效
- [ ] Console 无错误

---

### 3. 通用检查

#### 3.1 复用检查
- [ ] 已检查现有能力
- [ ] 无重复实现
- [ ] 优先复用框架

#### 3.2 文档检查
- [ ] 关键逻辑有注释
- [ ] 复杂业务有说明

#### 3.3 测试验证
- [ ] 编译通过
- [ ] 测试通过
- [ ] 功能可用

---

## 执行流程

### 1. 读取交付内容

分析本次交付的所有变更：
- 修改了哪些文件
- 新增了哪些功能
- 涉及哪些模块

### 2. 执行检查

按照检查清单逐项检查。

### 3. 生成报告

```markdown
# 自我审查报告

## 检查结果
- ✅ 通过项：15
- ⚠️  警告项：2
- ❌ 阻塞项：0

## 详细说明

### ✅ 通过项
1. 代码规范 - 符合规范
2. TDD证据 - 完整
3. 8类产物 - 齐全
...

### ⚠️  警告项
1. 部分方法缺少注释
2. 某个查询可以优化

### 建议
1. 补充方法注释
2. 优化查询性能

## 结论
可以交付 / 需要修复
```

### 4. 决策

- 如果所有必检项通过 → **可以交付**
- 如果有阻塞项 → **必须修复**
- 如果只有警告项 → **建议修复，可选择交付**

---

## 使用方法

```
AI 完成开发后，自动调用 yuheng-self-review
```

## 相关规则

- `@rules/yuheng-delivery-check.md` - 交付检查
- `@rules/yuheng-backend-tdd.md` - TDD 强制
- `@rules/backend-code-style.md` - 后端规范
- `@rules/frontend-code-style.md` - 前端规范
