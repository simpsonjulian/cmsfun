/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Contentful serves assets from its CDN. Allow next/image to optimize them.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        // Placeholder images used by the built-in sample data fallback.
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
