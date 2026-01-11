/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: false,
  },
  // Output configuration for standalone build (helps with Render deployment)
  output: 'standalone',
  // Ensure trailing slash handling
  trailingSlash: false,
  webpack: (config) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname);
    return config;
  },
}

module.exports = nextConfig

