/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'whop.com' },
      { protocol: 'https', hostname: 'cdn.whop.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://whop.com https://*.whop.com",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
