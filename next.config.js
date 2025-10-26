/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
  // Disable the development toast
  experimental: {
    devBundler: "turbopack",
  },
}

module.exports = nextConfig
