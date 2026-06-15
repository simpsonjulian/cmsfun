/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Contentful serves assets from its CDN. Allow next/image to optimize them.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
};

export default nextConfig;
