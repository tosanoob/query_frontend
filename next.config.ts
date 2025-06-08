import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: process.env.NEXT_PUBLIC_API_BASE_URL 
      ? [new URL(process.env.NEXT_PUBLIC_API_BASE_URL).hostname]
      : ['bird-faithful-hagfish.ngrok-free.app', 'clever-fowl-visually.ngrok-free.app'],
  },
};

export default nextConfig;
