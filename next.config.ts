import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['iconsax-react'],
  // ข้ามการตรวจ Type Check ตอน Build (ช่วยให้เร็วขึ้นมาก)
  // หมายเหตุ: ใน Next.js 15+ ให้ใช้ --no-lint ใน build script แทน eslint config
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
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Signal',
            value: 'search=yes, ai-train=no',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
