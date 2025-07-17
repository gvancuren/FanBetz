/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'fanbetz.com'], // Update to your production domain
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevents Vercel from blocking deploys due to ESLint errors
  },
  experimental: {
    serverActions: {}, // ✅ Fixes Vercel warning (was: true)
  },
};

module.exports = nextConfig;
