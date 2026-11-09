# Claude Code 项目配置

本项目已配置 Claude Code 开发规范。

---

## 规范文件位置

- **Rules**: `.claude/rules/` — 自动生效的强制规范
- **Skills**: `.claude/skills/` — 工作流与专项操作指南
- **Knowledge**: `ai-knowledge-core/` — 框架能力知识库

---

## 🎯 核心工作流

### 开发流程

```
需求 → 规格 → 计划 → 交付
```

| 阶段 | 输入 | 输出 | Skill |
|------|------|------|-------|
| 需求分析 | 口头需求 | 需求规格 | `yuheng-requirement-to-spec` |
| 计划制定 | 需求规格 | 开发计划 | `yuheng-spec-to-plan` |
| 交付执行 | 开发计划 | 可运行代码 | `yuheng-delivery-execution` |

---

## 📚 AI 知识库

在开始编码前，AI 会自动读取：

### 后端知识（ai-knowledge-core/server/）
- `overview.md` - 后端框架概览
- `capability-index.md` - 能力索引
- `api-index.md` - API 清单
- `database-relations.md` - 数据库关系

### 前端知识（ai-knowledge-core/ui/）
- `overview.md` - 前端框架概览
- `components.md` - 组件清单
- `stores.md` - Store 使用

---

## 🛡️ 强制规则

### 阶段门禁
- `yuheng-phase-gate.md` - 规格/计划冻结才能实现

### TDD 强制
- `yuheng-backend-tdd.md` - 先写测试，红灯 → 实现 → 绿灯

### 框架使用
- `yuheng-framework-usage.md` - 优先使用框架能力

### 交付检查
- `yuheng-delivery-check.md` - 完成前的验证清单

---

## 🚀 快速开始

### 新增功能

```
1. 描述需求："我要实现用户管理功能"
2. AI 自动生成规格
3. 用户确认规格
4. AI 生成开发计划
5. 用户确认计划
6. AI 执行交付（TDD）
```

### 修复 Bug

```
1. 描述问题："用户列表分页不正常"
2. AI 分析问题
3. AI 生成修复方案
4. 用户确认
5. AI 执行修复 + 测试
```

---

## 📋 规则优先级

1. 用户明确要求优先
2. 与任务更接近、更具体的 `rules/*.md` 优先
3. `yuheng-*` 专项规则优先于通用原则

---

## 🔧 构建与发布

```bash
# 编译
mvn clean install -DskipTests

# 运行测试
mvn test

# 启动应用
mvn spring-boot:run
```

---

## 📖 相关资源

- **源码**: https://github.com/huhua1990/yuheng-core
- **模板库**: https://github.com/huhua1990/yuheng-business-templates
- **示例项目**: yuheng-demo

---

## 🎓 开发规范

### 后端
- 所有接口使用 POST
- 返回值统一 `CommonResult`
- Service 继承 `ServiceImpl`
- Mapper 继承 `BaseMapperX`

### 前端
- 三级目录结构：`views/{group}/{module}/index.vue`
- API 文件放在 `api/` 目录
- 使用 `request` from 'yuheng-ui'
- 复用框架 Store

### 数据库
- 统一使用 Liquibase 迁移
- 表名小写 snake_case
- 禁止修改基础表

---

**版本**: 0.1.0-SNAPSHOT  
**更新时间**: 2024-11-09
