import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure proper webpack configuration for HMR
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
