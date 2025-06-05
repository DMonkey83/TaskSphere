import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.BACKEND_API_URL}/:path*`, // Proxy to Backend API
        }
      ]
  },
  /* config options here */
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@alias": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
    };
    return config;
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
