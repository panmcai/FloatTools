#!/bin/bash

# 验证项目配置

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "  验证项目配置"
echo "=========================================="
echo ""

# 检查计数
PASS=0
FAIL=0

# 检查函数
check() {
    local result=$?
    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        ((FAIL++))
        return 1
    fi
}

# 检查 Node.js
echo -e "${YELLOW}检查运行环境...${NC}"
command -v node &> /dev/null
check "Node.js 已安装"

command -v npm &> /dev/null
check "npm 已安装"

NODE_VERSION=$(node -v)
echo -e "  Node.js 版本: $NODE_VERSION"

# 检查文件存在性
echo ""
echo -e "${YELLOW}检查项目文件...${NC}"

[ -f "package.json" ]
check "package.json 存在"

[ -f "next.config.ts" ]
check "next.config.ts 存在"

[ -f "src/app/page.tsx" ]
check "src/app/page.tsx 存在"

[ -f "src/lib/float-utils.ts" ]
check "src/lib/float-utils.ts 存在"

# 检查部署文件
echo ""
echo -e "${YELLOW}检查部署文件...${NC}"

[ -f "Dockerfile" ]
check "Dockerfile 存在"

[ -f "docker-compose.yml" ]
check "docker-compose.yml 存在"

[ -f ".dockerignore" ]
check ".dockerignore 存在"

[ -f ".github/workflows/deploy.yml" ]
check ".github/workflows/deploy.yml 存在"

# 检查文档
echo ""
echo -e "${YELLOW}检查文档...${NC}"

[ -f "README.md" ]
check "README.md 存在"

[ -f "DEPLOYMENT.md" ]
check "DEPLOYMENT.md 存在"

[ -f "DEPLOYMENT_CHECKLIST.md" ]
check "DEPLOYMENT_CHECKLIST.md 存在"

# 检查脚本
echo ""
echo -e "${YELLOW}检查脚本...${NC}"

[ -f "quick-deploy.sh" ]
check "quick-deploy.sh 存在"

[ -f "push-to-github.sh" ]
check "push-to-github.sh 存在"

# 尝试构建
echo ""
echo -e "${YELLOW}测试构建...${NC}"
npm run build > /dev/null 2>&1
check "项目构建成功"

# 检查 Docker
echo ""
echo -e "${YELLOW}检查 Docker...${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker 已安装"
    echo -e "  Docker 版本: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    ((PASS++))

    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker Compose 已安装"
        echo -e "  Docker Compose 版本: $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)"
        ((PASS++))
    else
        echo -e "${YELLOW}!${NC} Docker Compose 未安装"
    fi
else
    echo -e "${YELLOW}!${NC} Docker 未安装"
fi

# Git 检查
echo ""
echo -e "${YELLOW}检查 Git...${NC}"

if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git 仓库已初始化"
    ((PASS++))

    if git remote get-url origin &> /dev/null; then
        echo -e "${GREEN}✓${NC} Git 远程仓库已配置"
        echo -e "  远程 URL: $(git remote get-url origin)"
        ((PASS++))
    else
        echo -e "${YELLOW}!${NC} Git 远程仓库未配置"
    fi
else
    echo -e "${YELLOW}!${NC} Git 仓库未初始化"
fi

# 总结
echo ""
echo "=========================================="
echo "  验证结果"
echo "=========================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！${NC}"
    echo ""
    echo "下一步："
    echo "  1. 本地测试: bash quick-deploy.sh dev"
    echo "  2. 推送到 GitHub: bash push-to-github.sh"
    exit 0
else
    echo -e "${RED}❌ 有 $FAIL 项检查失败，请修复后再部署${NC}"
    exit 1
fi
