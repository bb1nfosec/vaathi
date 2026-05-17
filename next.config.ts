import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Don't bundle these — let them load natively at runtime on Vercel
  // This prevents Turbopack from replacing process.env.DATABASE_URL
  // with the literal string "undefined" inside Prisma's generated code
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
    "@prisma/client",
  ],
};

export default nextConfig;
