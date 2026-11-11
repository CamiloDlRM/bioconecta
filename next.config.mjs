/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Portadas de eventos de hasta 5 MB
      bodySizeLimit: '6mb',
    },
  },
}

export default nextConfig
