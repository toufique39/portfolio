/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Admin-uploaded profile images are served from Cloudinary.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  turbopack: {
    // Pin the root to this project: a stray C:\Users\jt\package-lock.json
    // outside this Git repo otherwise breaks Turbopack's root detection.
    root: new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
