import { cacheLife } from "next/cache";
import { getPublicProjects } from "@/lib/services/public-portfolio.service";

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:10000"
).replace(/\/$/, "");

export default async function sitemap() {
  "use cache";

  cacheLife("hours");

  const projects = await getPublicProjects();

  const staticRoutes = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const projectRoutes = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    ...(project.updatedAt
      ? { lastModified: new Date(project.updatedAt) }
      : {}),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}