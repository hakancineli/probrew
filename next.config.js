/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: [
      'api.mircate.com',
      'api.sbuxtr.com',
      'www.starbucks.com.tr',
      'cloudflare.sbuxtr.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@mm': path.resolve(__dirname, 'market-master'),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/coffee',
        destination: '/',
        permanent: true,
      },
      {
        source: '/menu',
        destination: '/',
        permanent: true,
      },
      {
        source: '/rewards',
        destination: '/',
        permanent: true,
      },
      {
        source: '/campaigns',
        destination: '/',
        permanent: true,
      },
      {
        source: '/fiyat-listesi',
        destination: '/',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/',
        permanent: true,
      },
      {
        source: '/orders',
        destination: '/',
        permanent: true,
      },
      {
        source: '/order-confirmation',
        destination: '/',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/',
        permanent: true,
      },
      {
        source: '/odeme-basarili',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
