/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',    // ← 加这一行，让 Next.js 导出为纯静态文件
  images: {
    unoptimized: true,  // ← 静态导出时需要加这个
  },
};

module.exports = nextConfig;