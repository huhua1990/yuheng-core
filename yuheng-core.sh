#!/bin/bash

################################################################################
# Yuheng Core 管理脚本
# 功能: 后端Maven构建、前端UI打包、本地安装、清理
# 作者: Auto Generated
# 日期: 2026-11-03
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_DIR}"
FRONTEND_DIR="${PROJECT_DIR}/yuheng-ui"

# 版本配置
REVISION="${REVISION:-0.1.0-SNAPSHOT}"

# Maven 配置
MAVEN_OPTS="${MAVEN_OPTS:--Xms512m -Xmx1024m}"

################################################################################
# 工具函数
################################################################################

# 打印带颜色的消息
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 命令未找到，请先安装 $1"
        exit 1
    fi
}

# 显示分隔线
separator() {
    echo "========================================"
}

################################################################################
# 后端相关函数
################################################################################

# 构建后端（跳过测试）
build_backend() {
    log_step "开始构建后端项目..."

    check_command mvn

    cd "${BACKEND_DIR}"

    log_info "执行 Maven 构建 (跳过测试)..."
    mvn clean package -DskipTests

    log_info "后端构建完成"
}

# 构建后端（包含测试）
build_backend_with_test() {
    log_step "开始构建后端项目（包含测试）..."

    check_command mvn

    cd "${BACKEND_DIR}"

    log_info "执行 Maven 构建（运行测试）..."
    mvn clean package

    log_info "后端构建完成（测试已执行）"
}

# 安装到本地 Maven 仓库
install_backend() {
    log_step "安装后端到本地 Maven 仓库..."

    check_command mvn

    cd "${BACKEND_DIR}"

    log_info "执行 Maven install..."
    mvn clean install -DskipTests

    log_info "后端已安装到本地 Maven 仓库"
    log_info "位置: ~/.m2/repository/com/yuheng/"
}

# 仅编译后端
compile_backend() {
    log_step "编译后端代码..."

    check_command mvn

    cd "${BACKEND_DIR}"

    mvn clean compile

    log_info "后端编译完成"
}

# 运行后端测试
test_backend() {
    log_step "运行后端测试..."

    check_command mvn

    cd "${BACKEND_DIR}"

    mvn test

    log_info "测试完成"
}

# 检查后端代码风格
checkstyle_backend() {
    log_step "检查后端代码风格..."

    check_command mvn

    cd "${BACKEND_DIR}"

    if mvn checkstyle:check 2>/dev/null; then
        log_info "代码风格检查通过"
    else
        log_warn "Checkstyle 插件未配置或检查失败"
    fi
}

################################################################################
# 前端相关函数
################################################################################

# 安装前端依赖
install_frontend_deps() {
    log_step "安装前端依赖..."

    check_command node
    check_command pnpm

    cd "${FRONTEND_DIR}"

    if [ ! -d "node_modules" ]; then
        log_info "执行 pnpm install..."
        pnpm install
    else
        log_info "node_modules 已存在，跳过安装"
        log_warn "如需重新安装，请先执行: $0 clean:frontend"
    fi
}

# 构建前端
build_frontend() {
    log_step "开始构建前端项目..."

    check_command node
    check_command pnpm

    cd "${FRONTEND_DIR}"

    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        pnpm install
    fi

    log_info "执行前端构建..."
    pnpm run build

    if [ -d "dist" ]; then
        log_info "前端构建成功: ${FRONTEND_DIR}/dist"
        du -sh dist
    else
        log_error "前端构建失败，未找到 dist 目录"
        exit 1
    fi
}

# 打包前端为 tgz
pack_frontend() {
    log_step "打包前端为 .tgz 文件..."

    check_command node
    check_command pnpm

    cd "${FRONTEND_DIR}"

    # 确保已构建
    if [ ! -d "dist" ]; then
        log_warn "未找到 dist 目录，先执行构建..."
        pnpm run build
    fi

    log_info "执行 pnpm pack..."
    pnpm run pack:local

    if [ -f "vendor/yuheng-ui-${REVISION}.tgz" ]; then
        log_info "前端打包成功: ${FRONTEND_DIR}/vendor/yuheng-ui-${REVISION}.tgz"
        ls -lh "vendor/yuheng-ui-${REVISION}.tgz"
    else
        log_error "前端打包失败"
        exit 1
    fi
}

# 类型检查
typecheck_frontend() {
    log_step "运行前端类型检查..."

    check_command node
    check_command pnpm

    cd "${FRONTEND_DIR}"

    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        pnpm install
    fi

    pnpm run typecheck

    log_info "类型检查完成"
}

# 运行前端测试
test_frontend() {
    log_step "运行前端测试..."

    check_command node
    check_command pnpm

    cd "${FRONTEND_DIR}"

    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        pnpm install
    fi

    pnpm run test

    log_info "前端测试完成"
}

# 复制前端包到消费端
copy_frontend_to_demo() {
    log_step "复制前端包到 yuheng-demo..."

    local tgz_file="${FRONTEND_DIR}/vendor/yuheng-ui-${REVISION}.tgz"
    local demo_vendor="${PROJECT_DIR}/yuheng-demo/yuheng-demo-ui/vendor"

    if [ ! -f "${tgz_file}" ]; then
        log_error "未找到前端包: ${tgz_file}"
        log_warn "请先执行: $0 pack:frontend"
        exit 1
    fi

    if [ ! -d "${demo_vendor}" ]; then
        log_warn "未找到 yuheng-demo 项目，跳过复制"
        return 0
    fi

    log_info "复制到: ${demo_vendor}/"
    mkdir -p "${demo_vendor}"
    cp "${tgz_file}" "${demo_vendor}/"

    log_info "前端包已复制到 yuheng-demo"
}

################################################################################
# 完整构建和安装
################################################################################

# 完整构建（后端 + 前端）
build_all() {
    separator
    log_step "开始完整构建 (后端 + 前端)"
    separator

    build_backend
    echo ""
    build_frontend

    separator
    log_info "完整构建完成！"
    separator
}

# 完整安装（后端安装到本地仓库 + 前端打包）
install_all() {
    separator
    log_step "开始完整安装 (后端 Maven Install + 前端打包)"
    separator

    install_backend
    echo ""
    pack_frontend

    separator
    log_info "完整安装完成！"
    log_info "后端: 已安装到 ~/.m2/repository/com/yuheng/"
    log_info "前端: ${FRONTEND_DIR}/vendor/yuheng-ui-${REVISION}.tgz"
    separator
}

# 发布准备（构建 + 安装 + 复制）
prepare_release() {
    separator
    log_step "准备发布 (构建 + 安装 + 复制到 demo)"
    separator

    install_backend
    echo ""
    pack_frontend
    echo ""
    copy_frontend_to_demo

    separator
    log_info "发布准备完成！"
    log_info "消费端可以使用以下依赖:"
    log_info "  后端: com.yuheng:yuheng-server:${REVISION}"
    log_info "  前端: file:vendor/yuheng-ui-${REVISION}.tgz"
    separator
}

# 运行所有测试
test_all() {
    separator
    log_step "运行所有测试 (后端 + 前端)"
    separator

    test_backend
    echo ""
    test_frontend

    separator
    log_info "所有测试完成"
    separator
}

################################################################################
# 清理函数
################################################################################

# 清理后端
clean_backend() {
    log_step "清理后端构建产物..."

    cd "${BACKEND_DIR}"

    if command -v mvn &> /dev/null; then
        mvn clean
    else
        log_warn "Maven 未安装，手动删除 target 目录"
        find . -type d -name "target" -exec rm -rf {} + 2>/dev/null || true
    fi

    # 删除 flattened pom
    find . -name ".flattened-pom.xml" -delete

    log_info "后端清理完成"
}

# 清理前端
clean_frontend() {
    log_step "清理前端构建产物..."

    cd "${FRONTEND_DIR}"

    # 删除构建产物
    rm -rf dist
    rm -rf node_modules
    rm -rf vendor
    rm -f pnpm-lock.yaml

    log_info "前端清理完成"
}

# 清理所有
clean_all() {
    separator
    log_step "清理所有构建产物"
    separator

    clean_backend
    echo ""
    clean_frontend

    separator
    log_info "清理完成"
    separator
}

################################################################################
# 信息查看
################################################################################

# 查看版本信息
show_version() {
    log_info "Yuheng Core 版本信息"
    separator
    echo "项目版本: ${REVISION}"
    echo "Java 版本: 17"
    echo "Spring Boot 版本: 3.5.15"
    echo ""
    echo "模块列表:"
    echo "  - yuheng-dependencies (依赖管理)"
    echo "  - yuheng-framework (15个技术组件)"
    echo "  - yuheng-module-system (系统模块)"
    echo "  - yuheng-module-infra (基础设施模块)"
    echo "  - yuheng-server (服务聚合)"
    echo "  - yuheng-ui (前端UI库)"
    separator
}

# 查看构建状态
show_status() {
    log_info "Yuheng Core 构建状态"
    separator

    # 后端状态
    echo "${GREEN}[后端]${NC}"
    if [ -f "${BACKEND_DIR}/yuheng-server/target/yuheng-server-${REVISION}.jar" ]; then
        echo "  ✓ yuheng-server 已构建"
    else
        echo "  ✗ yuheng-server 未构建"
    fi

    if [ -d "${HOME}/.m2/repository/com/yuheng/yuheng-server/${REVISION}" ]; then
        echo "  ✓ yuheng-server 已安装到本地仓库"
    else
        echo "  ✗ yuheng-server 未安装到本地仓库"
    fi

    echo ""

    # 前端状态
    echo "${GREEN}[前端]${NC}"
    if [ -d "${FRONTEND_DIR}/dist" ]; then
        echo "  ✓ yuheng-ui 已构建 ($(du -sh ${FRONTEND_DIR}/dist | awk '{print $1}'))"
    else
        echo "  ✗ yuheng-ui 未构建"
    fi

    if [ -f "${FRONTEND_DIR}/vendor/yuheng-ui-${REVISION}.tgz" ]; then
        echo "  ✓ yuheng-ui 已打包 ($(ls -lh ${FRONTEND_DIR}/vendor/yuheng-ui-${REVISION}.tgz | awk '{print $5}'))"
    else
        echo "  ✗ yuheng-ui 未打包"
    fi

    separator
}

# 检查依赖工具
check_dependencies() {
    log_info "检查依赖工具"
    separator

    # Java
    if command -v java &> /dev/null; then
        local java_version=$(java -version 2>&1 | head -n 1)
        echo "✓ Java: ${java_version}"
    else
        echo "✗ Java: 未安装"
    fi

    # Maven
    if command -v mvn &> /dev/null; then
        local mvn_version=$(mvn -version | head -n 1)
        echo "✓ Maven: ${mvn_version}"
    else
        echo "✗ Maven: 未安装"
    fi

    # Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node -v)
        echo "✓ Node.js: ${node_version}"
    else
        echo "✗ Node.js: 未安装"
    fi

    # pnpm
    if command -v pnpm &> /dev/null; then
        local pnpm_version=$(pnpm -v)
        echo "✓ pnpm: ${pnpm_version}"
    else
        echo "✗ pnpm: 未安装 (运行: npm install -g pnpm)"
    fi

    separator
}

################################################################################
# 帮助信息
################################################################################

show_help() {
    cat << EOF
${GREEN}Yuheng Core 管理脚本${NC}

${BLUE}使用方法:${NC}
    $0 [命令]

${BLUE}完整操作命令:${NC}
    ${GREEN}build${NC}           - 构建后端和前端
    ${GREEN}install${NC}         - 安装到本地 (后端 Maven install + 前端打包)
    ${GREEN}release${NC}         - 发布准备 (install + 复制到 demo)
    ${GREEN}test${NC}            - 运行所有测试
    ${GREEN}clean${NC}           - 清理所有构建产物

${BLUE}后端命令:${NC}
    ${GREEN}build:backend${NC}       - 构建后端 (跳过测试)
    ${GREEN}build:backend:test${NC}  - 构建后端 (包含测试)
    ${GREEN}install:backend${NC}     - 安装后端到本地 Maven 仓库
    ${GREEN}compile:backend${NC}     - 仅编译后端代码
    ${GREEN}test:backend${NC}        - 运行后端测试
    ${GREEN}checkstyle:backend${NC}  - 检查后端代码风格
    ${GREEN}clean:backend${NC}       - 清理后端构建产物

${BLUE}前端命令:${NC}
    ${GREEN}install:frontend${NC}    - 安装前端依赖
    ${GREEN}build:frontend${NC}      - 构建前端
    ${GREEN}pack:frontend${NC}       - 打包前端为 .tgz
    ${GREEN}copy:frontend${NC}       - 复制前端包到 demo 项目
    ${GREEN}typecheck:frontend${NC}  - 运行前端类型检查
    ${GREEN}test:frontend${NC}       - 运行前端测试
    ${GREEN}clean:frontend${NC}      - 清理前端构建产物

${BLUE}信息查看:${NC}
    ${GREEN}version${NC}         - 查看版本信息
    ${GREEN}status${NC}          - 查看构建状态
    ${GREEN}check${NC}           - 检查依赖工具
    ${GREEN}help${NC}            - 显示此帮助信息

${BLUE}环境变量:${NC}
    REVISION        - 版本号 (默认: 0.1.0-SNAPSHOT)
    MAVEN_OPTS      - Maven JVM 参数 (默认: -Xms512m -Xmx1024m)

${BLUE}常见使用场景:${NC}

    ${YELLOW}# 1. 首次构建并安装${NC}
    $0 install

    ${YELLOW}# 2. 准备发布到 demo 项目${NC}
    $0 release

    ${YELLOW}# 3. 仅构建后端${NC}
    $0 build:backend

    ${YELLOW}# 4. 仅打包前端${NC}
    $0 pack:frontend

    ${YELLOW}# 5. 运行所有测试${NC}
    $0 test

    ${YELLOW}# 6. 清理并重新构建${NC}
    $0 clean && $0 build

    ${YELLOW}# 7. 查看构建状态${NC}
    $0 status

${BLUE}构建产物位置:${NC}
    后端 JAR:  yuheng-server/target/yuheng-server-${REVISION}.jar
    前端包:    yuheng-ui/vendor/yuheng-ui-${REVISION}.tgz
    本地仓库:  ~/.m2/repository/com/yuheng/

${BLUE}注意事项:${NC}
    1. 首次运行建议执行: $0 install
    2. 修改后端代码后，需要重新执行 install:backend
    3. 修改前端代码后，需要重新执行 pack:frontend
    4. demo 项目依赖本地仓库中的 yuheng-server
    5. 前端测试需要先安装依赖

EOF
}

################################################################################
# 主函数
################################################################################

main() {
    cd "${PROJECT_DIR}"

    case "${1:-}" in
        # 完整操作
        build)
            build_all
            ;;
        install)
            install_all
            ;;
        release|prepare)
            prepare_release
            ;;
        test)
            test_all
            ;;
        clean)
            clean_all
            ;;

        # 后端操作
        build:backend)
            build_backend
            ;;
        build:backend:test)
            build_backend_with_test
            ;;
        install:backend)
            install_backend
            ;;
        compile:backend)
            compile_backend
            ;;
        test:backend)
            test_backend
            ;;
        checkstyle:backend)
            checkstyle_backend
            ;;
        clean:backend)
            clean_backend
            ;;

        # 前端操作
        install:frontend)
            install_frontend_deps
            ;;
        build:frontend)
            build_frontend
            ;;
        pack:frontend)
            pack_frontend
            ;;
        copy:frontend)
            copy_frontend_to_demo
            ;;
        typecheck:frontend)
            typecheck_frontend
            ;;
        test:frontend)
            test_frontend
            ;;
        clean:frontend)
            clean_frontend
            ;;

        # 信息查看
        version)
            show_version
            ;;
        status)
            show_status
            ;;
        check)
            check_dependencies
            ;;

        # 帮助
        -h|--help|help|*)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@"
