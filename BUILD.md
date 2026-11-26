# Yuheng Core 构建脚本使用指南

## 一、脚本功能

`yuheng-core.sh` 是一个功能完整的Shell脚本，用于管理 yuheng-core 项目的后端构建、前端打包、本地安装等操作。

## 二、快速开始

### 2.1 查看帮助

```bash
./yuheng-core.sh help
```

### 2.2 首次构建和安装

```bash
# 完整安装（后端安装到本地Maven仓库 + 前端打包）
./yuheng-core.sh install

# 查看构建状态
./yuheng-core.sh status
```

### 2.3 准备发布到 demo 项目

```bash
# 构建、安装并复制前端包到 demo
./yuheng-core.sh release
```

## 三、命令详解

### 3.1 完整操作命令

| 命令 | 功能 | 说明 |
|------|------|------|
| `build` | 构建后端和前端 | Maven package + pnpm build |
| `install` | 安装到本地 | Maven install + pnpm pack |
| `release` | 发布准备 | install + 复制到 demo |
| `test` | 运行所有测试 | 后端测试 + 前端测试 |
| `clean` | 清理所有构建产物 | 删除 target、dist、node_modules |

### 3.2 后端专用命令

| 命令 | 功能 | Maven 命令 |
|------|------|-----------|
| `build:backend` | 构建后端（跳过测试）| `mvn clean package -DskipTests` |
| `build:backend:test` | 构建后端（包含测试）| `mvn clean package` |
| `install:backend` | 安装到本地仓库 | `mvn clean install -DskipTests` |
| `compile:backend` | 仅编译代码 | `mvn clean compile` |
| `test:backend` | 运行测试 | `mvn test` |
| `checkstyle:backend` | 代码风格检查 | `mvn checkstyle:check` |
| `clean:backend` | 清理后端 | `mvn clean` |

### 3.3 前端专用命令

| 命令 | 功能 | pnpm 命令 |
|------|------|----------|
| `install:frontend` | 安装依赖 | `pnpm install` |
| `build:frontend` | 构建前端 | `pnpm run build` |
| `pack:frontend` | 打包为 .tgz | `pnpm run pack:local` |
| `copy:frontend` | 复制到 demo | `cp vendor/*.tgz` |
| `typecheck:frontend` | 类型检查 | `pnpm run typecheck` |
| `test:frontend` | 运行测试 | `pnpm run test` |
| `clean:frontend` | 清理前端 | 删除 dist、node_modules |

### 3.4 信息查看命令

| 命令 | 功能 |
|------|------|
| `version` | 查看版本信息 |
| `status` | 查看构建状态 |
| `check` | 检查依赖工具 |

## 四、环境变量配置

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `REVISION` | `0.1.0-SNAPSHOT` | 项目版本号 |
| `MAVEN_OPTS` | `-Xms512m -Xmx1024m` | Maven JVM 参数 |

### 使用示例

```bash
# 使用自定义版本号
REVISION=0.2.0-SNAPSHOT ./yuheng-core.sh install

# 调整 Maven 内存
MAVEN_OPTS="-Xms1g -Xmx2g" ./yuheng-core.sh build:backend
```

## 五、常见使用场景

### 5.1 开发环境：修改后端代码

```bash
# 1. 修改代码后重新安装
./yuheng-core.sh install:backend

# 2. demo 项目会自动使用最新的依赖
cd ../yuheng-demo
./yuheng-demo.sh restart:backend
```

### 5.2 开发环境：修改前端代码

```bash
# 1. 重新打包前端
./yuheng-core.sh pack:frontend

# 2. 复制到 demo 项目
./yuheng-core.sh copy:frontend

# 3. 重新安装 demo 前端依赖
cd ../yuheng-demo/yuheng-demo-ui
pnpm install

# 4. 重启前端开发服务器
pnpm run dev
```

### 5.3 完整发布流程

```bash
# 一键完成：构建 + 安装 + 复制
./yuheng-core.sh release

# 验证构建状态
./yuheng-core.sh status

# 查看构建产物
ls -lh yuheng-server/target/*.jar
ls -lh yuheng-ui/vendor/*.tgz
```

### 5.4 运行测试

```bash
# 运行所有测试
./yuheng-core.sh test

# 仅运行后端测试
./yuheng-core.sh test:backend

# 仅运行前端测试
./yuheng-core.sh test:frontend

# 前端类型检查
./yuheng-core.sh typecheck:frontend
```

### 5.5 清理和重建

```bash
# 清理所有构建产物
./yuheng-core.sh clean

# 重新构建
./yuheng-core.sh build

# 或者清理并安装
./yuheng-core.sh clean && ./yuheng-core.sh install
```

### 5.6 仅构建特定部分

```bash
# 仅构建后端
./yuheng-core.sh build:backend

# 仅构建前端
./yuheng-core.sh build:frontend

# 仅打包前端
./yuheng-core.sh pack:frontend
```

## 六、构建产物说明

### 6.1 后端构建产物

| 产物 | 位置 | 说明 |
|------|------|------|
| JAR 包 | `yuheng-server/target/yuheng-server-0.1.0-SNAPSHOT.jar` | 服务聚合包 |
| 本地仓库 | `~/.m2/repository/com/yuheng/` | Maven 本地仓库 |

### 6.2 前端构建产物

| 产物 | 位置 | 说明 |
|------|------|------|
| 构建目录 | `yuheng-ui/dist/` | 编译后的 JS/CSS |
| 打包文件 | `yuheng-ui/vendor/yuheng-ui-0.1.0-SNAPSHOT.tgz` | npm 包 |

### 6.3 项目结构

```
yuheng-core/
├── yuheng-core.sh              # 管理脚本
├── pom.xml                     # 根 POM
├── yuheng-dependencies/        # 依赖管理
├── yuheng-framework/           # 框架层（15个组件）
│   ├── yuheng-common/
│   ├── yuheng-spring-boot-starter-web/
│   ├── yuheng-spring-boot-starter-security/
│   └── ...
├── yuheng-module-system/       # 系统模块
├── yuheng-module-infra/        # 基础设施模块
├── yuheng-server/              # 服务聚合
│   └── target/
│       └── yuheng-server-*.jar
└── yuheng-ui/                  # 前端UI库
    ├── dist/                   # 构建产物
    └── vendor/                 # 打包文件
        └── yuheng-ui-*.tgz
```

## 七、前置条件

### 7.1 必需工具

- **Java 17+**: 后端编译和运行
- **Maven 3.6+**: 后端构建工具
- **Node.js 18+**: 前端运行环境
- **pnpm**: 前端包管理器

### 7.2 检查工具

```bash
# 使用脚本检查
./yuheng-core.sh check

# 或手动检查
java -version       # 应该是 17 或更高
mvn -version        # 应该是 3.6 或更高
node -v            # 应该是 18 或更高
pnpm -v            # 如果没有，运行: npm install -g pnpm
```

## 八、故障排查

### 8.1 Maven 构建失败

**问题**: `mvn clean install` 失败

**可能原因**:
1. Java 版本不是 17
2. Maven 依赖下载失败
3. 代码编译错误

**解决方法**:
```bash
# 检查 Java 版本
java -version

# 清理本地仓库缓存
rm -rf ~/.m2/repository/com/yuheng
./yuheng-core.sh install:backend

# 查看详细错误
mvn clean install -X
```

### 8.2 前端构建失败

**问题**: `pnpm run build` 失败

**可能原因**:
1. Node.js 版本不兼容
2. 依赖安装不完整
3. TypeScript 编译错误

**解决方法**:
```bash
# 清理并重新安装
cd yuheng-ui
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 先运行类型检查
pnpm run typecheck

# 再构建
pnpm run build
```

### 8.3 前端打包失败

**问题**: `pnpm pack` 没有生成 .tgz 文件

**可能原因**:
1. 未先执行 build
2. vendor 目录不存在

**解决方法**:
```bash
cd yuheng-ui
mkdir -p vendor
pnpm run build
pnpm pack --pack-destination vendor
```

### 8.4 demo 项目找不到依赖

**问题**: demo 项目启动时报错 `Cannot resolve dependency: com.yuheng:yuheng-server`

**解决方法**:
```bash
# 重新安装 yuheng-core
cd yuheng-core
./yuheng-core.sh install:backend

# 验证本地仓库
ls -la ~/.m2/repository/com/yuheng/yuheng-server/0.1.0-SNAPSHOT/
```

### 8.5 测试失败

**问题**: 单元测试失败

**解决方法**:
```bash
# 查看详细测试输出
./yuheng-core.sh test:backend

# 跳过测试构建
./yuheng-core.sh build:backend
```

## 九、与 demo 项目的关系

### 9.1 依赖关系

```
yuheng-demo 依赖 yuheng-core:
  ├── 后端: com.yuheng:yuheng-server:0.1.0-SNAPSHOT
  └── 前端: yuheng-ui (file:vendor/yuheng-ui-0.1.0-SNAPSHOT.tgz)
```

### 9.2 完整开发流程

```bash
# 1. 首次设置：构建并安装 core
cd yuheng-core
./yuheng-core.sh release

# 2. 构建 demo 项目
cd ../yuheng-demo
./yuheng-demo.sh build

# 3. 启动 demo 项目
./yuheng-demo.sh start

# 4. 修改 core 代码后
cd ../yuheng-core
./yuheng-core.sh install:backend  # 如果修改后端
./yuheng-core.sh pack:frontend && ./yuheng-core.sh copy:frontend  # 如果修改前端

# 5. 重启 demo
cd ../yuheng-demo
./yuheng-demo.sh restart
```

## 十、版本管理

### 10.1 版本号说明

- **0.1.0-SNAPSHOT**: 开发版本
- **0.1.0**: 正式发布版本

### 10.2 修改版本号

编辑 `yuheng-core/pom.xml`:
```xml
<properties>
    <revision>0.2.0-SNAPSHOT</revision>
</properties>
```

然后重新构建：
```bash
REVISION=0.2.0-SNAPSHOT ./yuheng-core.sh install
```

### 10.3 发布正式版本

```bash
# 1. 修改版本号为正式版
vim pom.xml  # 修改 revision 为 0.1.0

# 2. 构建并安装
REVISION=0.1.0 ./yuheng-core.sh install

# 3. 打 Git 标签
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin v0.1.0

# 4. 发布到 Maven 仓库（如果配置了）
mvn deploy
```

## 十一、CI/CD 集成

### 11.1 GitHub Actions 示例

```yaml
name: Build Yuheng Core

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Build and Test
        run: ./yuheng-core.sh test
      
      - name: Install to Local
        run: ./yuheng-core.sh install
```

### 11.2 GitLab CI 示例

```yaml
stages:
  - build
  - test
  - deploy

build-job:
  stage: build
  image: maven:3.9-eclipse-temurin-17
  script:
    - ./yuheng-core.sh build
  artifacts:
    paths:
      - yuheng-server/target/*.jar
      - yuheng-ui/dist/

test-job:
  stage: test
  image: maven:3.9-eclipse-temurin-17
  script:
    - ./yuheng-core.sh test

deploy-job:
  stage: deploy
  script:
    - ./yuheng-core.sh install
  only:
    - main
```

## 十二、常见问题 FAQ

### Q1: install 和 build 有什么区别？

A: 
- `build`: 仅构建，不安装到本地 Maven 仓库
- `install`: 构建并安装到 `~/.m2/repository/`，其他项目可以依赖

### Q2: 什么时候需要运行 release？

A: 当你修改了 yuheng-core 并希望在 yuheng-demo 中使用最新版本时

### Q3: 如何验证构建是否成功？

A: 运行 `./yuheng-core.sh status` 查看所有构建产物状态

### Q4: 前端包为什么要打成 .tgz？

A: yuheng-ui 作为 npm 包分发，demo 项目通过 `file:` 协议引用本地包

### Q5: 修改了 framework 某个 starter，如何生效？

A: 运行 `./yuheng-core.sh install:backend`，所有模块会重新构建和安装

### Q6: 能否只构建某个模块？

A: 可以，进入具体模块目录运行 `mvn clean install`

### Q7: 如何调试 Maven 构建问题？

A: 使用 `mvn clean install -X` 查看详细日志

## 十三、最佳实践

1. **开发前先 install**: 确保本地仓库有最新依赖
2. **修改后立即测试**: 运行 `./yuheng-core.sh test` 确保没有破坏现有功能
3. **保持版本一致**: core 和 demo 的版本号要匹配
4. **定期清理**: 运行 `./yuheng-core.sh clean` 清理旧的构建产物
5. **提交前检查**: 确保 `./yuheng-core.sh test` 通过
6. **使用 release 命令**: 准备发布到 demo 时使用 `release` 而不是手动操作

## 十四、脚本源码位置

脚本已保存在项目根目录：
```
/Users/huhua/study/ai/yuheng/yuheng-core/yuheng-core.sh
```

可以根据实际需求修改脚本中的配置参数。
