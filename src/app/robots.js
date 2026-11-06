export default function robots() {
  const siteUrl = (
    process.env._PUBLIC_APP_URL ||
    "http://localhost:10000"
  ).replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}