/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // This ensures better compatibility when running in a container
  experimental: {
    // Enable if you're using middleware or edge functions
    // serverActions: true,
  }
};

export default nextConfig;
