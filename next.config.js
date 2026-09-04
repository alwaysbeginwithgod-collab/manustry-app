/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out swcMinify
  // swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
};

module.exports = nextConfig;