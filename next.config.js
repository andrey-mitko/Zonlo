/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  distDir: 'build',
  async rewrites() {
    return process.env.NODE_ENV === 'production'
    ? [
        {
          source: '/api/:slug*',
          destination: `https://zonlo.vercel.app/api/:slug*`,
        },
      ]
    : [
      {
        source: '/api/:slug*',
        destination: `http://localhost:3000/api/:slug*`,
      },
    ];
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}
