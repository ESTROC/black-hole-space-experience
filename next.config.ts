import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["@react-three/fiber", "@react-three/drei", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Turbopack config (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
