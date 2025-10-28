/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Removed output: 'export' to support API routes and SSR for authentication
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
