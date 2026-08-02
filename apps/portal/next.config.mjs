/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@homerepair/data", "@homerepair/utility"],

    // The portal is embedded in an <iframe> on customers' websites, so it
    // must NOT send X-Frame-Options: DENY/SAMEORIGIN. Control embedding
    // with CSP frame-ancestors instead. In production, replace * with a
    // dynamic per-client allowlist (e.g. looked up in middleware).
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "frame-ancestors *;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
