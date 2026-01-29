import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', 

  experimental: {
    serverActions: {
      allowedOrigins: [
        'fedecolellafisio.com',         
        'www.fedecolellafisio.com',     
        'bolectioned-pathognomonically-myrtie.ngrok-free.dev', 
        'localhost:3000'
      ]
    }
  }
};

export default nextConfig;