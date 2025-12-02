import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [new URL('https://videogenerator.yoannabest.com/minio/nca-toolkit-prod/**')],
  },
};

export default nextConfig;
