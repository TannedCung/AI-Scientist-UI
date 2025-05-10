/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  // Add trailing slashes to prevent 404s
  trailingSlash: true,
  // Ensure proper page loading
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Add app icon configuration
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig; 