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
  // /explore was folded into the home page; /juegaespanol is now a case study under /work
  async redirects() {
    return [
      { source: "/explore", destination: "/", permanent: true },
      { source: "/juegaespanol", destination: "/work/juegaespanol", permanent: true },
    ]
  },
  // audio.parkerdemelia.com serves /audio (add the domain to this Vercel project to turn it on)
  async rewrites() {
    const host = [{ type: "host", value: "audio.parkerdemelia.com" }]
    return {
      beforeFiles: [
        { source: "/", has: host, destination: "/audio" },
        { source: "/feed.xml", has: host, destination: "/audio/feed.xml" },
        { source: "/upload", has: host, destination: "/audio/upload" },
      ],
    }
  },
  experimental: {
    // vault media is read from content/ at runtime by app/vault/[...path]/route.ts
    outputFileTracingIncludes: {
      "/vault/[...path]": ["./content/**/*.{jpg,jpeg,png,gif,webp,avif,svg,mp4,m4v,mov,webm}"],
    },
  },
}

export default nextConfig