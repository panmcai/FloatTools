# 浮点数可视化工具 - GitHub 部署指南

## 项目概述

这是一个基于 Next.js 16 的浮点数可视化工具，支持 IEEE 754 标准格式和扩展格式（FP16/FP32/FP64/BFloat16/FP8/FP4）。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **运行时**: Node.js 24

## 部署方式

### 方式一：GitHub Actions + Docker（推荐）

#### 1. 准备工作

确保你的 GitHub 仓库已创建并推送代码：

```bash
# 初始化 git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit: 浮点数可视化工具"

# 添加远程仓库
git remote add origin https://github.com/your-username/float-visualizer.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

#### 2. 配置 GitHub Secrets（可选）

如果需要部署到外部服务器，在 GitHub 仓库中配置以下 Secrets：

- `SSH_HOST`: 服务器地址
- `SSH_USERNAME`: SSH 用户名
- `SSH_PRIVATE_KEY`: SSH 私钥
- `SSH_PORT`: SSH 端口（默认 22）

配置路径：`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

#### 3. 自动部署流程

当代码推送到 `main` 分支时，GitHub Actions 会自动：

1. 检出代码
2. 安装依赖
3. 构建应用
4. 构建 Docker 镜像
5. 推送到 GitHub Container Registry (GHCR)

#### 4. 在服务器上部署

登录到你的服务器，创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  float-visualizer:
    image: ghcr.io/your-username/float-visualizer:latest
    container_name: float-visualizer
    ports:
      - "3000:3000"
    restart: unless-stopped
```

拉取并启动：

```bash
docker-compose pull
docker-compose up -d
```

#### 5. 配置反向代理（可选）

使用 Nginx 配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 方式二：Vercel 部署（最简单）

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录并部署

```bash
vercel login
vercel
```

按照提示操作，Vercel 会自动检测 Next.js 项目并配置。

#### 3. 环境变量（如需要）

在 Vercel Dashboard 配置环境变量：`Settings` → `Environment Variables`

---

### 方式三：本地 Docker 部署

#### 1. 构建镜像

```bash
docker build -t float-visualizer .
```

#### 2. 运行容器

```bash
docker run -d -p 3000:3000 --name float-visualizer float-visualizer
```

#### 3. 使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

### 方式四：传统服务器部署

#### 1. 安装 Node.js 24

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
sudo yum install -y nodejs
```

#### 2. 安装依赖并构建

```bash
# 克隆代码
git clone https://github.com/your-username/float-visualizer.git
cd float-visualizer

# 安装依赖
npm ci

# 构建
npm run build
```

#### 3. 使用 PM2 运行

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "float-visualizer" -- start

# 设置开机自启
pm2 startup
pm2 save
```

#### 4. 配置 Nginx（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:5000

### 构建测试

```bash
npm run build
npm start
```

---

## 验证部署

部署完成后，访问以下地址验证：

- 本地开发：http://localhost:5000
- 生产环境：http://your-domain.com 或 http://your-server-ip:3000

---

## 常见问题

### 1. 构建失败

```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

### 2. Docker 镜像过大

确保 `next.config.ts` 中配置了 `output: 'standalone'`，这可以显著减小镜像体积。

### 3. 端口冲突

修改 `docker-compose.yml` 或 `Dockerfile` 中的端口映射：

```yaml
ports:
  - "8080:3000"  # 将 8080 映射到容器内的 3000
```

---

## 性能优化建议

1. **启用 CDN**: 静态资源建议使用 CDN 加速
2. **启用 Gzip**: 在 Nginx 或应用层启用 Gzip 压缩
3. **使用缓存**: 配置适当的缓存策略
4. **监控**: 配置应用监控和日志收集

---

## 安全建议

1. **HTTPS**: 生产环境务必使用 HTTPS
2. **环境变量**: 敏感信息使用环境变量
3. **定期更新**: 及时更新依赖包
4. **限制访问**: 配置防火墙规则

---

## 联系方式

如有问题，请提交 Issue 或 Pull Request。
