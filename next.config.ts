
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Opciones de configuración principales */
  env: {
    // ⚡ Forzamos la recompilación en cada build con un número único
    CACHE_BUSTER: Date.now().toString(),
  },
  typescript: {
    // 🚨 Ignorar errores de TypeScript durante build (no recomendado en proyectos grandes)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 🚨 Ignorar errores de ESLint en producción
    ignoreDuringBuilds: true,
  },
  images: {
    // 📸 Permitimos cargar imágenes desde estos dominios
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 📦 Evitamos incluir "handlebars" en el bundle del servidor
      config.externals = config.externals || [];
      config.externals.push({
        handlebars: 'commonjs handlebars',
      });
    }
    return config;
  },
};

export default nextConfig;
