---
name: yuheng-writing-plans
description: Yuheng adapter for upstream writing-plans skill
upstream: writing-plans (Claude Code Community)
upstream-file: upstream/writing-plans.md
type: adapter
---

# Yuheng Writing Plans

> **本 Skill 使用上游开源英文原版，保持 100% 一致**
> 
> **上游来源**: Claude Code Community writing-plans  
> **完整内容**: `.claude/skills/upstream/writing-plans.md`  
> **维护方式**: 上游更新时直接替换 upstream/writing-plans.md

---

## 快速参考（中文辅助）

### 核心原则

1. **Bite-sized tasks** - 细粒度任务（2-5分钟/步骤）
2. **Precise file paths** - 精确文件路径（path:line格式）
3. **Mandatory TDD** - 强制TDD（5步循环）
4. **No placeholders** - 无占位符（禁止TBD、TODO、"similar to"）
5. **Frequent commits** - 频繁提交

### 5步TDD循环

每个任务必须包含以下5步：

1. **Step 1: Write failing test** - 编写失败测试（包含完整代码）
2. **Step 2: Run test, confirm red** - 运行测试确认红灯（包含命令和预期输出）
3. **Step 3: Minimal implementation** - 最小实现（包含完整代码）
4. **Step 4: Run test, confirm green** - 运行测试确认绿灯（包含命令）
5. **Step 5: Commit** - 提交（包含精确的git命令）

### 标准任务结构

```markdown
### Task N: {Component Name}

**Files:**
- Create: `exact/path/to/File.java`
- Modify: `exact/path/to/Existing.java:123-145`
- Test: `exact/path/to/FileTest.java`

**Duration**: 15-20 minutes

- [ ] Step 1: Write failing test
  [完整测试代码]
  
- [ ] Step 2: Run test, confirm red
  mvn test -Dtest=TestName#testMethod
  Expected: FAIL - "method not found"
  
- [ ] Step 3: Minimal implementation
  [完整实现代码]
  
- [ ] Step 4: Run test, confirm green
  mvn test -Dtest=TestName#testMethod
  Expected: PASS
  
- [ ] Step 5: Commit
  git add path/to/files
  git commit -m "feat: implement feature"
```

### 禁止的占位符

❌ **禁止使用**:
- "TBD", "TODO", "稍后实现"
- "添加适当的错误处理"（必须写出具体代码）
- "为上述功能编写测试"（必须写出测试代码）
- "类似 Task N"（必须重复完整代码）

---

## Yuheng 适配映射

### Skill 名称映射
| 上游 Skill | Yuheng Skill |
|-----------|--------------|
| `athena-delivery-execution` | `yuheng-delivery-execution` |
| `athena-backend-delivery` | `yuheng-backend-delivery` |

### 路径映射
| 上游路径 | Yuheng 路径 |
|---------|------------|
| `docs/superpowers/plans/` | `docs/plans/` |

### 包结构示例

Yuheng 标准包结构：
```
com.yuheng.platform.module.{module}/
├── controller/           # REST API 控制器
├── service/             # 业务逻辑层
├── dal/
│   ├── dataobject/     # DO 数据对象
│   └── mapper/         # MyBatis Mapper
└── convert/            # MapStruct 转换器
```

示例：
```java
// 上游示例可能是通用路径
com.example.service.UserService

// Yuheng 中应该是
com.yuheng.platform.module.system.service.UserService
```

---

## 完整英文内容

完整的上游原版内容请查看:  
`.claude/skills/upstream/writing-plans.md`

该文件是从上游直接复制的原版，保持 100% 一致，便于同步更新。

---

**适配层版本**: v1.0  
**创建时间**: 2024-11-09  
**维护说明**: 上游更新时，只需替换 upstream/writing-plans.md，本文件无需修改
