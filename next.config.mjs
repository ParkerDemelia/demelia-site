/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // vault media is read from content/ at runtime by app/vault/[...path]/route.ts
    outputFileTracingIncludes: {
      "/vault/[...path]": ["./content/**/*.{jpg,jpeg,png,gif,webp,avif,svg,mp4,m4v,mov,webm}"],
    },
  },
}

export default nextConfig