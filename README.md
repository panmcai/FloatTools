# 浮点数可视化工具

一个现代化的[浮点数可视化工具](https://panmcai.github.io/FloatVisualizer)，支持 IEEE 754 标准格式和扩展格式。

## 功能特性

- 🎨 **多格式支持**: FP16 / FP32 / FP64 / BFloat16 / FP8 (E4M3/E5M2) / FP4 (E2M1)
- 📊 **位可视化**: 直观展示符号位、指数位、尾数位
- 🔢 **位序号标注**: 每个 bit 位都有序号，方便查询
- 🧮 **换算过程**: 详细的浮点数换算过程说明
- 💡 **数学公式**: 清晰的数学公式展示
- 🎯 **交互操作**: 点击位即可切换，实时更新
- 📱 **响应式设计**: 支持桌面端和移动端
- 🌓 **深色主题**: 护眼的深色界面设计

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/panmcai/FloatVisualizer.git
cd FloatVisualizer

./scripts/build.sh
```

### 部署

```bash
cd out && python3 -m http.server 5000
```
访问 http://localhost:5000

## 在线预览

- [FloatVisualizer 链接] (http://localhost:5000)

## 使用说明

1. **选择格式**: 点击顶部的格式按钮切换浮点数格式
2. **输入数值**: 在输入框中输入十进制数值或特殊值（inf、nan）
3. **查看位表示**: 可视化展示符号位（红色）、指数位（蓝色）、尾数位（绿色）
4. **交互操作**: 点击任意位可切换 0/1，实时计算对应数值
5. **查看换算过程**: 详细的数学换算步骤说明

## 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面
│   │   ├── layout.tsx        # 布局
│   │   └── globals.css       # 全局样式
│   └── lib/
│       └── float-utils.ts    # 浮点数工具函数
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions 配置
├── Dockerfile                # Docker 配置
├── docker-compose.yml        # Docker Compose 配置
├── DEPLOYMENT.md             # 部署文档
└── README.md                 # 项目说明
```

## 许可证

Copyright © 2025~2026 Panmcai rights reserved.

## 致谢

- IEEE 754 标准规范
- Next.js 框架
- Tailwind CSS
---

Made with ❤️ by panmcai
