import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  env: {
    // 将 basePath 暴露给客户端
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // 禁用 trailingSlash 以便更好地支持相对路径
  trailingSlash: false,
  // 移除 basePath 以使用相对路径
  basePath: '/FloatVisualizer',
  // 使用环境变量设置 assetPrefix
  assetPrefix: '/FloatVisualizer',
};

export default nextConfig;
