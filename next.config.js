/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.google.com', 'www.gstatic.com'],
  }
};

module.exports = nextConfig;
