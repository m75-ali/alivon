import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Photos upload through Server Actions (default body cap is 1MB). Images
    // are shrunk client-side before upload, but raise the cap as a safety net.
    // Kept under Vercel's ~4.5MB function-body limit.
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Quest/log/cover photos are served as Supabase Storage signed URLs.
    // next/image blocks remote hosts unless allowlisted. The wildcard covers
    // both the dev and prod Supabase projects (<ref>.supabase.co).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
