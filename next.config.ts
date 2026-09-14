import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

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
      // Added Cloudinary for permanent image hosting & production display
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

// Fix: Wrap nextConfig with withNextIntl
export default withNextIntl(nextConfig);