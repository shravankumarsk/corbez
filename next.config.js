/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Still check TypeScript types during build
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
}

module.exports = nextConfig
