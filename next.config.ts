import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Necesario para export estático
  },
  trailingSlash: true,
};

export default nextConfig;