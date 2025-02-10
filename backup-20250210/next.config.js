/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.google.com', 'www.gstatic.com'],
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: ['**/node_modules', '**/.git', '**/.next'],
    };
    return config;
  },
  experimental: {
    // Remove fastRefresh as it's enabled by default in Next.js 14
  }
};

module.exports = nextConfig;
