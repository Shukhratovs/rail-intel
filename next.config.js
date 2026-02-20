/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Proxy requests to /railway-api/* to eticket.railway.uz
        // This avoids CORS issues for any future direct API calls
        source: '/railway-api/:path*',
        destination: 'https://eticket.railway.uz/api/:path*',
      },
    ]
  },
}
module.exports = nextConfig
