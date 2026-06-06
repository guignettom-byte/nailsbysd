import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Autoriser les appels API depuis les deux domaines
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://nailsbysd.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // www.nailsbysd.com → nailsbysd.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nailsbysd.com" }],
        destination: "https://nailsbysd.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
