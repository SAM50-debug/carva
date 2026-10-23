import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["mongodb", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/certificates",
        destination: "/certificate",
        permanent: true,
      },
      {
        source: "/certifictes",
        destination: "/certificate",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
