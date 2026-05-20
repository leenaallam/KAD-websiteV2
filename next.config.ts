import type { NextConfig } from "next";

/**
 * KAD — Next.js 16 configuration.
 *
 * Image rules:
 * - AVIF + WebP delivery
 * - remotePatterns will be expanded with the actual Supabase project host
 *   in Phase 3 once provisioned (see lib/cdn.ts).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 768, 1280, 1920, 2560],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    qualities: [60, 75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@react-three/drei",
      "@react-three/fiber",
      "three",
    ],
  },
};

export default nextConfig;
