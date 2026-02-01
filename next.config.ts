import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['iconsax-react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all external images - you can restrict this in production
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
