# Yuheng-Core 包名检查报告

**日期**: 2024-11-09  
**状态**: ⚠️ 发现包名不一致问题

---

## 🔍 检查结果

### 问题
yuheng-core 中的 Java 代码仍然使用旧包名 `cn.iocoder.yudao.*`，需要统一替换为 `com.yuheng.platform.*`

### 影响范围
- yuheng-framework（所有子模块）
- yuheng-module-system
- yuheng-module-infra

### 需要执行的批量替换

```bash
# 1. yuheng-framework 所有模块
find yuheng-framework -name "*.java" -exec sed -i '' 's/cn\.iocoder\.yudao\.framework/com.yuheng.platform.framework/g' {} +

# 2. yuheng-module-system
find yuheng-module-system -name "*.java" -exec sed -i '' 's/cn\.iocoder\.yudao\.module\.system/com.yuheng.platform.module.system/g' {} +

# 3. yuheng-module-infra
find yuheng-module-infra -name "*.java" -exec sed -i '' 's/cn\.iocoder\.yudao\.module\.infra/com.yuheng.platform.module.infra/g' {} +

# 4. 交叉引用
find yuheng-core -name "*.java" -exec sed -i '' 's/cn\.iocoder\.yudao/com.yuheng.platform/g' {} +
```

---

**建议**: 立即执行包名替换并重新编译
