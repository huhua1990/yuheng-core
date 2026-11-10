---
name: yuheng-init-project-postcheck
description: Post-initialization project health check
---

# Yuheng Init Project Postcheck

项目初始化后的体检，确保工程健康。

## 适用场景

- 刚使用模板创建新项目
- 从其他项目迁移到 Yuheng
- 项目结构有重大调整

## 检查清单

### 1. 项目结构检查

#### 1.1 包结构
- [ ] 包名统一：`com.yuheng.platform.*`
- [ ] 无遗留旧包名
- [ ] 模块划分清晰

#### 1.2 目录结构
- [ ] 前端三级目录：`views/{group}/{module}/index.vue`
- [ ] API 目录：`api/`
- [ ] 后端标准结构

---

### 2. 配置检查

#### 2.1 Maven 配置
- [ ] `pom.xml` 版本正确
- [ ] 依赖版本统一
- [ ] 无冲突依赖

#### 2.2 数据库配置
- [ ] 数据源配置正确
- [ ] Liquibase 配置正确
- [ ] 数据库连接可用

#### 2.3 应用配置
- [ ] `application.yml` 配置完整
- [ ] 端口配置正确
- [ ] 环境配置正确

---

### 3. 编译检查

```bash
# 后端编译
mvn clean compile

# 前端编译
npm run build
```

- [ ] 后端编译通过
- [ ] 前端编译通过
- [ ] 无警告信息

---

### 4. 启动检查

```bash
# 后端启动
mvn spring-boot:run

# 前端启动
npm run dev
```

- [ ] 后端启动成功
- [ ] 前端启动成功
- [ ] 无错误日志

---

### 5. 数据库迁移检查

- [ ] Liquibase 可执行
- [ ] 迁移脚本版本连续
- [ ] 表结构正确

---

### 6. API 检查

```bash
# 健康检查
curl http://localhost:8080/actuator/health
```

- [ ] 健康检查通过
- [ ] 基础接口可用

---

## 执行流程

### 1. 自动检查

执行所有可自动化的检查项。

### 2. 生成报告

```markdown
# 项目体检报告

## 基本信息
- 项目名称：xxx
- Yuheng 版本：0.1.0-SNAPSHOT
- 检查时间：2024-11-09

## 检查结果
- ✅ 通过项：20
- ⚠️  警告项：3
- ❌ 阻塞项：0

## 详细说明

### ✅ 通过项
1. 包结构正确
2. 编译通过
3. 启动成功
...

### ⚠️  警告项
1. 某些依赖版本较旧
2. 某个配置可以优化

### 建议
1. 升级依赖版本
2. 优化配置

## 结论
项目健康 / 需要修复
```

### 3. 修复问题

如果有阻塞项，自动或引导修复。

---

## 使用方法

```
新项目创建后，立即执行：
yuheng-init-project-postcheck
```

---

## 相关规则

- `@rules/backend-code-style.md` - 后端规范
- `@rules/frontend-code-style.md` - 前端规范
- `@rules/database-migration.md` - 数据库迁移
