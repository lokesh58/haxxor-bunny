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
  };
  return nextConfig;
};
