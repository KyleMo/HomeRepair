/** @type {import('next').NextConfig} */
const nextConfig = {
    // Compile the shared packages' TypeScript source directly —
    // no separate build step needed for @homerepair workspace packages.
    transpilePackages: ["@homerepair/data", "@homerepair/utility"],
};

export default nextConfig;
