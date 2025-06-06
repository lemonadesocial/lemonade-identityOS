import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  assetPrefix: process.env.ASSET_PREFIX,
  reactStrictMode: false,
};

export default nextConfig;
