/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'whop.com' },
      { protocol: 'https', hostname: 'cdn.whop.com' },
    ],
  },
};

module.exports = nextConfig;
