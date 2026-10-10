import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'yuri-petrou-site.vercel.app' }],
        destination: 'https://yuri-petrou.vercel.app/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
