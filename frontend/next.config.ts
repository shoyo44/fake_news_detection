import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    domains: ["lh3.googleusercontent.com", "googleusercontent.com"],
  },
};

export default nextConfig;
