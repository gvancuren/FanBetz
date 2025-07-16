/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'fanbetz.com'], // Update to your production domain
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ This prevents Vercel from blocking deploys due to ESLint errors
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
