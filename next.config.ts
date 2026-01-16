import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'bolectioned-pathognomonically-myrtie.ngrok-free.dev',
        'localhost:3000'
      ]
    }
  }
};

export default nextConfig;
