import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/auth/sign-in",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/sign-up",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/auth/forgot-password",
        destination: "/forgot-password",
        permanent: false,
      },
      {
        source: "/auth/reset-password",
        destination: "/reset-password",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
