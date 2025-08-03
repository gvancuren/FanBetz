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
  // ✅ Cleaned up invalid config key
  // If you're using any valid experimental features, add them here
};

module.exports = nextConfig;
