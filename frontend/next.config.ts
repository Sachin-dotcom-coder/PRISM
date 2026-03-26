import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://prism-backend-qztt.onrender.com/api/:path*", // ✅ FIXED
      },
    ];
  },
};

export default nextConfig;