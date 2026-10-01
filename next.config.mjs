const isDev = process.env.NODE_ENV === 'development';
// Preview deployments get the Vercel toolbar injected, which loads from vercel.live.
const isVercelPreview = process.env.VERCEL_ENV === 'preview';
const vercelToolbar = isVercelPreview ? ['https://vercel.live'] : [];

// Pages are statically generated, so per-request nonces aren't an option.
// Next.js still emits inline bootstrap scripts (the RSC payload), which is why
// script-src needs 'unsafe-inline'. External chunks are pinned with SRI below.
const csp = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    // React's dev overlay / HMR uses eval; Vercel Analytics loads its debug script from a CDN in dev.
    ...(isDev ? ["'unsafe-eval'", 'https://va.vercel-scripts.com'] : []),
    ...vercelToolbar,
  ],
  // next/image and the `style` prop emit inline style attributes.
  'style-src': ["'self'", "'unsafe-inline'", ...vercelToolbar],
  // Contentful images are proxied through /_next/image, so they're same-origin.
  'img-src': ["'self'", 'data:', 'blob:', ...(isVercelPreview ? ['https://vercel.live', 'https://vercel.com'] : [])],
  'font-src': ["'self'", ...(isVercelPreview ? ['https://vercel.live', 'https://assets.vercel.com'] : [])],
  // Vercel Analytics beacons to /_vercel/insights on the same origin.
  'connect-src': [
    "'self'",
    ...(isDev ? ['ws:'] : []),
    ...(isVercelPreview ? ['https://vercel.live', 'wss://ws-us3.pusher.com'] : []),
  ],
  'frame-src': isVercelPreview ? ['https://vercel.live'] : ["'none'"],
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  ...(isDev ? {} : { 'upgrade-insecure-requests': [] }),
};

const contentSecurityPolicy = Object.entries(csp)
  .map(([directive, sources]) => [directive, ...sources].join(' '))
  .join('; ');

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
  experimental: {
    // Adds integrity attributes to the <script> tags Next.js emits for its own chunks.
    sri: {
      algorithm: 'sha256',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          // Legacy equivalent of frame-ancestors 'none' for older browsers.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
