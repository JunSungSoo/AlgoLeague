import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
    output: "standalone",
    poweredByHeader: false,
    experimental: {
        serverActions: { bodySizeLimit: "1mb" },
        optimizePackageImports: ["@chakra-ui/react", "lucide-react"],
    },
    async rewrites() {
        return [{ source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` }];
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
