import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost", // for local docker
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      // add real domain when moved production
      // {
      //   protocol: "https",
      //   hostname: "your-production-domain.com",
      // },
    ],
  },
};

export default nextConfig;