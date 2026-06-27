import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
