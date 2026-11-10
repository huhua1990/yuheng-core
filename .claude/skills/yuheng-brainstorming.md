---
name: yuheng-brainstorming
description: Yuheng adapter for upstream brainstorming skill
upstream: brainstorming (Claude Code Community)
upstream-file: upstream/brainstorming.md
type: adapter
---

# Yuheng Brainstorming

> **本 Skill 使用上游开源英文原版，保持 100% 一致**
> 
> **上游来源**: Claude Code Community brainstorming  
> **完整内容**: `.claude/skills/upstream/brainstorming.md`  
> **维护方式**: 上游更新时直接替换 upstream/brainstorming.md

---

## 快速参考（中文辅助）

### 核心流程（9步）
1. **Explore project context** - 探索项目上下文
2. **Ask questions one at a time** - 逐个澄清问题
3. **Propose 2-3 approaches** - 提出2-3种方案
4. **Present design in segments** - 分段展示设计
5. **Write design document** - 编写设计文档
6. **Spec self-review** - 设计自我审查
7. **User reviews spec** - 用户审查设计
8. **Save design document** - 保存设计文档
9. **Transition to implementation** - 过渡到实施计划

### 硬门禁 (HARD-GATE)
在展示设计并获得用户批准之前，**禁止任何实现行为**：
- ❌ 不能调用任何实现 Skill
- ❌ 不能编写任何代码
- ❌ 不能创建任何项目脚手架

### 反模式
**"This Is Too Simple To Need A Design"** - 每个项目都必须经过设计流程。

### 终止状态
**唯一出口**: 调用 `yuheng-writing-plans`

---

## Yuheng 适配映射

### Skill 名称映射
| 上游 Skill | Yuheng Skill |
|-----------|--------------|
| `writing-plans` | `yuheng-writing-plans` |

### 路径映射
| 上游路径 | Yuheng 路径 |
|---------|------------|
| `docs/superpowers/designs/` | `docs/designs/` |

---

## 完整英文内容

完整的上游原版内容请查看:  
`.claude/skills/upstream/brainstorming.md`

该文件是从上游直接复制的原版，保持 100% 一致，便于同步更新。

---

**适配层版本**: v1.0  
**创建时间**: 2024-11-09  
**维护说明**: 上游更新时，只需替换 upstream/brainstorming.md，本文件无需修改
