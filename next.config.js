/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    devIndicators: false,
    transpilePackages: ['@yudiel/react-qr-scanner'],
    experimental: {
      serverActions: true,
    },
    compiler: {
      swcMinify: true, // ← 正しい場所に移動
    },
    webpack: (config) => {
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.fallback) {
        config.resolve.fallback = {};
      }
  
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
  
      return config;
    },
  };
  
  module.exports = nextConfig;
  