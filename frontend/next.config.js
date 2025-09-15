const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  // Leave assetPrefix unset by default. Only set if using a CDN.
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '',
  },
  async rewrites() {
    const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const rules = [
      { source: '/favicon.ico', destination: '/alnoorlogo.png' },
    ];
    if (bp) {
      rules.push({ source: `${bp}/favicon.ico`, destination: `${bp}/alnoorlogo.png` });
    }
    return rules;
  },
  webpack(config) {
    config.resolve.alias = config.resolve.alias || {};
    if (!config.resolve.alias['@']) {
      config.resolve.alias['@'] = path.resolve(__dirname);
    }
    return config;
  },
};

module.exports = nextConfig;
