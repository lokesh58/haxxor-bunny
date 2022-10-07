/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/invite',
        destination:
          'https://discord.com/api/oauth2/authorize?client_id=823101978309427221&scope=applications.commands',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
