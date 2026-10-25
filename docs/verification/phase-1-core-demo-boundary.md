# Phase 1 core / demo 边界验证

验证日期：2026-10-25

## 检查命令

```bash
rg -n '<module>|<artifactId>|<groupId>|<version>' \
  /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/pom.xml

python3 - <<'PY'
from pathlib import Path
import xml.etree.ElementTree as ET

base = Path('/Users/huhua/study/ai/yuheng/ruoyi-vue-pro')
ns = {'m': 'http://maven.apache.org/POM/4.0.0'}
files = [
    'yudao-dependencies/pom.xml',
    'yudao-framework/pom.xml',
    'yudao-module-system/pom.xml',
    'yudao-module-infra/pom.xml',
    'yudao-server/pom.xml',
]
for relative in files:
    root = ET.parse(base / relative).getroot()
    deps = []
    for dependency in root.findall('.//m:dependencies/m:dependency', ns):
        artifact = dependency.findtext('m:artifactId', default='', namespaces=ns)
        if artifact.startswith('yudao-module-'):
            deps.append(artifact)
    print(relative, '->', deps or 'none')
PY

rg -n 'Liquibase|Flyway|spring.liquibase|spring.flyway' \
  /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-framework \
  /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-module-system \
  /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-module-infra \
  /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/yudao-server
```

## 结果

- 有效业务模块依赖只出现在 `yudao-module-system → yudao-module-infra` 和 `yudao-server → system/infra`；
- core 候选模块没有引用 BPM、支付、商城、CRM、ERP 等业务模块；
- 数据库迁移入口没有从主模块中发现；
- 边界报告通过逻辑审计，`yuheng-core` 已建立独立 Maven 发布工程；
- `yuheng-core` 的 clean package、install 已通过，`yuheng-demo` 已通过只消费 `yuheng-server` 的 clean package；
- 完整测试仍有 1 个源工程同样存在的随机 `moduleName` 基线断言失败，已记录在 `docs/verification/core-build.md`。
