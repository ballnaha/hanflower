import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['iconsax-react'],
  // ข้ามการตรวจ Lint และ Type Check ตอน Build (ช่วยให้เร็วขึ้นมาก)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // ปรับปรุงการจัดการ Memory ในการ Compile
  experimental: {
    optimizePackageImports: ['iconsax-react', '@mui/material', 'iconsax-react'],
  }
};

export default nextConfig;
