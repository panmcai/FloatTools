#!/bin/bash

# 推送到 GitHub 并触发部署

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "  推送到 GitHub"
echo "=========================================="
echo ""

# 检查是否有 git 仓库
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}初始化 Git 仓库...${NC}"
    git init
fi

# 检查远程仓库
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}请输入 GitHub 仓库 URL:${NC}"
    read -r REPO_URL
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✓ 远程仓库已添加${NC}"
    echo ""
fi

# 添加所有文件
echo -e "${YELLOW}添加文件到暂存区...${NC}"
git add .
echo -e "${GREEN}✓ 文件已添加${NC}"
echo ""

# 提交
echo -e "${YELLOW}请输入提交信息 (留空使用默认信息):${NC}"
read -r COMMIT_MESSAGE
COMMIT_MESSAGE=${COMMIT_MESSAGE:-"更新项目代码"}
git commit -m "$COMMIT_MESSAGE"
echo -e "${GREEN}✓ 代码已提交${NC}"
echo ""

# 推送到 main 分支
echo -e "${YELLOW}推送到 main 分支...${NC}"
git branch -M main
git push -u origin main
echo -e "${GREEN}✓ 代码已推送${NC}"
echo ""

echo -e "${GREEN}=========================================="
echo -e "  🎉 推送成功！"
echo -e "=========================================="
echo ""
echo -e "${YELLOW}GitHub Actions 将自动触发部署流程${NC}"
echo -e "${YELLOW}查看 Actions: ${NC}https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
echo ""
