/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // dev 模式下把 /api/v1 代理到后端，避免前端写死 localhost:8080 导致远程访问不通
  // 生产模式由 nginx 统一代理，rewrites 不会干扰（请求到不了 Next.js）
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;