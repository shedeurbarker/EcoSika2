/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "replicate.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "replicate.delivery",
                pathname: "/**",
            },
        ],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        domains: [
            "lh3.googleusercontent.com",
            "firebasestorage.googleapis.com",
            "replicate.com",
            "replicate.delivery",
        ],
        unoptimized: true,
    },
    // Enable static exports for Firebase hosting
    output: "export",
    swcMinify: true,
};

module.exports = nextConfig;
