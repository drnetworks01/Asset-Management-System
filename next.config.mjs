/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a self-contained `.next/standalone` folder for tiny Docker images.
  output: 'standalone',
  // Don't bundle better-sqlite3's native binding — load it at runtime.
  serverExternalPackages: ['better-sqlite3', 'qrcode', 'exceljs'],
  images: {
    // We serve item photos via our own /api/photos route, so no remote
    // sources need to be whitelisted for next/image.
    remotePatterns: [],
  },
};

export default nextConfig;
