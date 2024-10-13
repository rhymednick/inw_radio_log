// File: next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/images/:path*',
                destination: '/api/images/:path*', // Maps /images/* to the API route
            },
        ];
    },
};

export default nextConfig;
