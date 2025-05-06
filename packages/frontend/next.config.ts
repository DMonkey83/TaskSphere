import type { NextConfig } from "next";
import path from 'path'

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@alias': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared/src')
    }
    return config;
  }
};

export default nextConfig;
