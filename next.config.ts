import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/precision-recall-explainer',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
