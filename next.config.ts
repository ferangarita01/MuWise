
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        "http://localhost:6000",
        "https://6000-firebase-studio-1754829056224.cluster-2xid2zxbenc4ixa74rpk7q7fyk.cloudworkstations.dev"
    ]
  }
};

export default nextConfig;
