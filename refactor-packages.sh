#!/bin/bash

echo "开始重构 yuheng-core 包结构..."

# 1. yuheng-common
echo "重构 yuheng-common..."
cd yuheng-framework/yuheng-common/src/main/java
if [ -d "cn/iocoder/yudao/framework/common" ]; then
  mkdir -p com/yuheng/platform/framework
  cp -r cn/iocoder/yudao/framework/common com/yuheng/platform/framework/
  rm -rf cn
  echo "✓ yuheng-common 目录结构已更新"
fi
cd ../../../../..

# 2. yuheng-common test
cd yuheng-framework/yuheng-common/src/test/java
if [ -d "cn/iocoder/yudao/framework/common" ]; then
  mkdir -p com/yuheng/platform/framework
  cp -r cn/iocoder/yudao/framework/common com/yuheng/platform/framework/
  rm -rf cn
  echo "✓ yuheng-common test 目录结构已更新"
fi
cd ../../../../..

# 3. 其他 framework 模块
for module in yuheng-framework/yuheng-spring-boot-starter-*; do
  if [ -d "$module/src/main/java/cn" ]; then
    echo "重构 $(basename $module)..."
    cd "$module/src/main/java"
    mkdir -p com/yuheng/platform/framework
    cp -r cn/iocoder/yudao/framework/* com/yuheng/platform/framework/ 2>/dev/null
    rm -rf cn
    cd ../../../../..
    echo "✓ $(basename $module) 完成"
  fi
done

echo ""
echo "✅ 所有模块包结构重构完成！"
