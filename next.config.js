/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // 移除静态导出，使用 Vercel 默认的 Serverless/Hybrid 模式
  // images: { unoptimized: true }, // Vercel 支持图像优化，无需禁用
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
