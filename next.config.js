/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  output: 'standalone',
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
