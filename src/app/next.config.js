/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['localhost', 'your-production-domain.com'], // Change this to your domain when deployed
    },
    reactStrictMode: true,
    experimental: {
      serverActions: true,
    },
  };
  
  module.exports = nextConfig;
  