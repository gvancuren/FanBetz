/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Ignore TypeScript build errors during deployment (use with caution)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Ignore ESLint warnings and errors during Vercel builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Add support for external images from Cloudinary
  images: {
    domains: ['res.cloudinary.com'],
  },
  // ✅ Optional: Force dynamic rendering for all routes
  experimental: {
    forceDynamic: true,
  },
};

module.exports = nextConfig;
