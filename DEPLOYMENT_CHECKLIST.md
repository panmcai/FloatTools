# 部署检查清单

## GitHub 仓库准备

- [ ] 创建 GitHub 仓库
- [ ] 初始化 git 仓库
- [ ] 添加远程仓库地址
- [ ] 推送代码到 main 分支
- [ ] 设置仓库为 Public（如需要）

## GitHub Actions 配置

- [ ] 检查 `.github/workflows/deploy.yml` 文件
- [ ] 确保 GitHub Actions 权限已启用
  - 路径: Settings → Actions → General → Workflow permissions
  - 选择: Read and write permissions
- [ ] 配置 GitHub Secrets（如需要外部部署）
  - [ ] SSH_HOST
  - [ ] SSH_USERNAME
  - [ ] SSH_PRIVATE_KEY
  - [ ] SSH_PORT

## 代码检查

- [ ] 运行 `npm run build` 确保构建成功
- [ ] 运行 `npm run lint` 确保无代码警告
- [ ] 检查 `next.config.ts` 配置（output: 'standalone'）
- [ ] 验证环境变量配置
- [ ] 测试核心功能正常

## Docker 准备

- [ ] Dockerfile 文件存在且配置正确
- [ ] .dockerignore 文件存在
- [ ] docker-compose.yml 文件存在
- [ ] 本地测试 Docker 构建: `docker build -t float-visualizer .`
- [ ] 本地测试 Docker 运行: `docker run -p 3000:3000 float-visualizer`

## 服务器准备（如使用外部服务器）

- [ ] 服务器已安装 Docker
- [ ] 服务器已安装 Docker Compose
- [ ] 防火墙配置正确（开放 80、443、3000 端口）
- [ ] SSH 访问正常
- [ ] 磁盘空间充足

## 域名和 SSL（如需要）

- [ ] 域名已购买
- [ ] DNS 解析已配置（A 记录指向服务器 IP）
- [ ] SSL 证书已配置（推荐 Let's Encrypt）
- [ ] HTTP 重定向到 HTTPS 已配置

## 反向代理配置（Nginx）

- [ ] Nginx 已安装
- [ ] Nginx 配置文件已创建
- [ ] 反向代理配置正确
- [ ] 配置已重载: `nginx -s reload`

## 部署测试

- [ ] GitHub Actions 工作流运行成功
- [ ] Docker 镜像成功推送到 GHCR
- [ ] 服务器成功拉取镜像
- [ ] 容器成功启动
- [ ] 应用可正常访问
- [ ] 所有功能测试通过

## 监控和维护

- [ ] 配置日志收集
- [ ] 配置错误监控（如 Sentry）
- [ ] 配置性能监控
- [ ] 设置自动备份策略
- [ ] 配置告警通知

## 安全检查

- [ ] 使用 HTTPS
- [ ] 禁用未使用的端口
- [ ] 配置防火墙规则
- [ ] 定期更新系统和依赖
- [ ] 使用强密码和 SSH 密钥

## 文档更新

- [ ] README.md 更新
- [ ] DEPLOYMENT.md 更新
- [ ] 更新部署文档中的 URL 和链接
- [ ] 添加已知问题和故障排除指南

---

## 快速部署命令参考

### 本地测试构建

```bash
# 清理并重新构建
rm -rf .next node_modules
npm install
npm run build
```

### Docker 测试

```bash
# 构建镜像
docker build -t float-visualizer .

# 运行容器
docker run -d -p 3000:3000 --name float-visualizer float-visualizer

# 查看日志
docker logs -f float-visualizer

# 停止并删除
docker stop float-visualizer
docker rm float-visualizer
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### 推送到 GitHub

```bash
# 添加所有文件
git add .

# 提交
git commit -m "准备部署"

# 推送到 main 分支
git push origin main
```

## 常见问题排查

### 构建失败

1. 检查 Node.js 版本是否为 24
2. 清理缓存: `rm -rf .next node_modules`
3. 重新安装依赖: `npm install`
4. 查看详细错误日志

### Docker 问题

1. 检查 Docker 是否运行: `docker ps`
2. 查看容器日志: `docker logs <container_id>`
3. 检查端口是否被占用: `lsof -i :3000`

### GitHub Actions 失败

1. 检查 Actions 日志
2. 验证 Secrets 配置
3. 检查工作流语法

---

部署前请确保所有检查项都已完成！
