/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-speech-recognition"],
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;
