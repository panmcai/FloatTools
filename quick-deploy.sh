#!/bin/bash

# 浮点数可视化工具 - 快速部署脚本

set -e

echo "=========================================="
echo "  浮点数可视化工具 - 快速部署"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 版本过低，需要 18+，当前版本: $(node -v)${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"
    echo -e "${GREEN}✓ npm 版本: $(npm -v)${NC}"
    echo ""
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}安装项目依赖...${NC}"
    npm ci
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
    echo ""
}

# 构建项目
build_project() {
    echo -e "${YELLOW}构建项目...${NC}"
    npm run build
    echo -e "${GREEN}✓ 项目构建完成${NC}"
    echo ""
}

# 启动开发服务器
start_dev() {
    echo -e "${YELLOW}启动开发服务器...${NC}"
    echo -e "${GREEN}✓ 开发服务器已启动${NC}"
    echo -e "${GREEN}访问: http://localhost:5000${NC}"
    echo ""
    npm run dev
}

# 使用 Docker 部署
deploy_docker() {
    echo -e "${YELLOW}检查 Docker...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Docker 版本: $(docker --version)${NC}"
    echo ""

    echo -e "${YELLOW}构建 Docker 镜像...${NC}"
    docker build -t float-visualizer .
    echo -e "${GREEN}✓ Docker 镜像构建完成${NC}"
    echo ""

    echo -e "${YELLOW}停止旧容器（如果存在）...${NC}"
    docker stop float-visualizer 2>/dev/null || true
    docker rm float-visualizer 2>/dev/null || true

    echo -e "${YELLOW}启动新容器...${NC}"
    docker run -d -p 3000:3000 --name float-visualizer float-visualizer
    echo -e "${GREEN}✓ 容器已启动${NC}"
    echo ""

    echo -e "${YELLOW}等待服务启动...${NC}"
    sleep 3

    echo -e "${GREEN}=========================================="
    echo -e "  🎉 部署成功！"
    echo -e "=========================================="
    echo -e "${GREEN}访问: http://localhost:3000${NC}"
    echo -e "${GREEN}查看日志: docker logs -f float-visualizer${NC}"
    echo -e "${GREEN}停止服务: docker stop float-visualizer${NC}"
    echo ""
}

# 使用 Docker Compose 部署
deploy_docker_compose() {
    echo -e "${YELLOW}检查 Docker Compose...${NC}"

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安装${NC}"
        exit 1
    fi

    echo -e "${YELLOW}使用 Docker Compose 部署...${NC}"
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build

    echo -e "${YELLOW}等待服务启动...${NC}"
    sleep 3

    echo -e "${GREEN}=========================================="
    echo -e "  🎉 部署成功！"
    echo -e "=========================================="
    echo -e "${GREEN}访问: http://localhost:3000${NC}"
    echo -e "${GREEN}查看日志: docker-compose logs -f${NC}"
    echo -e "${GREEN}停止服务: docker-compose down${NC}"
    echo ""
}

# 显示使用说明
show_usage() {
    echo "使用方法:"
    echo "  bash quick-deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  dev          启动开发服务器 (默认端口 5000)"
    echo "  docker       使用 Docker 部署"
    echo "  compose      使用 Docker Compose 部署"
    echo "  build        仅构建项目"
    echo "  help         显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  bash quick-deploy.sh dev"
    echo "  bash quick-deploy.sh docker"
    echo "  bash quick-deploy.sh compose"
    echo ""
}

# 主函数
main() {
    case "${1:-dev}" in
        dev)
            check_dependencies
            install_dependencies
            start_dev
            ;;
        docker)
            check_dependencies
            build_project
            deploy_docker
            ;;
        compose)
            check_dependencies
            build_project
            deploy_docker_compose
            ;;
        build)
            check_dependencies
            install_dependencies
            build_project
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo -e "${RED}❌ 未知选项: $1${NC}"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
