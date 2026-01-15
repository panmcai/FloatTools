import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.CF_PAGES === '1';
const basePath = isGitHubPages ? '/FloatVisualizer' : '';

const nextConfig: NextConfig = {
  /* config options here */
  // 静态导出配置（用于 GitHub Pages）
  output: 'export',
  distDir: 'out',
  // 资源路径前缀（仅在 GitHub Pages 部署时使用）
  ...(basePath ? {
    basePath: basePath,
    assetPrefix: basePath,
  } : {}),
  // 环境变量
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  // 禁用 trailingSlash 以便更好地支持相对路径
  trailingSlash: false,
};

export default nextConfig;
