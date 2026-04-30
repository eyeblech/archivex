import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "archive.org",
        pathname: "/services/img/**",
      },
    ],
  },
};

export default nextConfig;