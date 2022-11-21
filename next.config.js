const mongoose = require('mongoose');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } = require('next/constants');

module.exports = async (phase, { defaultConfig }) => {
  if ([PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER].includes(phase)) {
    console.log('Connecting to MongoDB');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  }
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'twitter.github.io',
          pathname: '/twemoji/v/13.1.0/72x72/*',
        },
        {
          protocol: 'https',
          hostname: 'cdn.discordapp.com',
          pathname: '/emojis/*',
        },
      ],
    },
  };
  return nextConfig;
};
