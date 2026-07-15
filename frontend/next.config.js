/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'picsum.photos' }, // Added for placeholder images
            { protocol: 'https', hostname: 'source.unsplash.com' }, // Added for course thumbnails
        ],
    },
    // Enable test mode to allow login with any password.
    // This is a security risk and should only be used for local development.
    env: {
        NEXT_PUBLIC_TEST_MODE: 'true',
    },
};
module.exports = nextConfig;