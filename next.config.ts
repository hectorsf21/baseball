import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.mlbstatic.com',
        port: '',
        pathname: '/mlb-photos/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
