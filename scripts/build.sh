#!/bin/bash
set -Eeuo pipefail

# 编译脚本 - 生成静态导出文件到 out/ 目录

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "========================================="
echo "  编译脚本 - 生成静态导出"
echo "========================================="
echo "项目目录: ${PROJECT_ROOT}"
echo ""

# 清理旧的构建输出和缓存
echo "🧹 清理旧的构建输出和缓存..."
rm -rf out .next

# 安装依赖
echo "📦 安装依赖..."
if ! pnpm install; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 构建项目
echo "🔨 开始构建..."
if ! pnpm run build; then
    echo "❌ 构建失败"
    exit 1
fi

# 验证构建输出
if [ ! -d "out" ]; then
    echo "❌ 构建输出目录不存在"
    exit 1
fi

echo ""
echo "========================================="
echo "  ✅ 编译完成！"
echo "========================================="
echo ""
echo "📁 构建输出目录: ${PROJECT_ROOT}/out"
echo ""
echo "📊 构建统计:"
echo "   文件总数: $(find out -type f | wc -l)"
echo "   JS 文件: $(find out/_next/static -name '*.js' 2>/dev/null | wc -l)"
echo "   CSS 文件: $(find out/_next/static -name '*.css' 2>/dev/null | wc -l)"
echo "   总大小: $(du -sh out | cut -f1)"
echo ""
echo "💡 快速预览:"
echo "   cd out && python3 -m http.server 5000"
echo "   cd out && npx serve -p 8080"
echo ""
echo "========================================="
