/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/voice',
  assetPrefix: '/voice',
  // This ensures better compatibility when running in a container
  experimental: {
    // Enable if you're using middleware or edge functions
    // serverActions: true,
  }
};

export default nextConfig;
