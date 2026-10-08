const path = require("path");

/**
 * Supabase Google OAuth uses the *publishable* URL + key in the browser (PKCE).
 * Those values are safe to expose (not the service-role secret).
 *
 * On Vercel, set them WITHOUT the NEXT_PUBLIC_ prefix to avoid the
 * "Remove the public framework prefix" warning, then we map them into the
 * client bundle here (same effect as NEXT_PUBLIC_*).
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep @react-pdf on the bundled fork (@react-pdf/pdfkit), not upstream pdfkit (Vercel NFT misses standard-fonts).
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    outputFileTracingIncludes: {
      "/api/internal/job-description-pdf": [
        "./node_modules/@react-pdf/pdfkit/lib/**/*",
        "./node_modules/pdfkit/js/standard-fonts/**/*",
      ],
    },
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
    NEXT_PUBLIC_APP_URL: appUrl,
  },
  transpilePackages: ["nextjs-toploader"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "nextjs-toploader": path.join(
        __dirname,
        "node_modules/nextjs-toploader/dist/index.js"
      ),
      canvas: false,
      pdfkit: path.join(
        __dirname,
        "node_modules/@react-pdf/pdfkit/lib/pdfkit.js"
      ),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hirekarma.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hirekarma.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "disha-ui.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    // Get API configuration from environment variables directly
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL;
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";

    // Proxy only backend REST (/api/v1). Keep Next.js routes like /api/internal/* on the UI app.
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
