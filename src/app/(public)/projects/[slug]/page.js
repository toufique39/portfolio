
import { Suspense } from "react";
import ProjectDetails from "@/components/portfolio/ProjectDetails";
import { cacheLife } from "next/cache";
import { getPublishedProjectBySlug } from "@/lib/services/public-portfolio.service";
import { resolveImageUrl } from "@/lib/utils";

async function getCachedProjectMetadata(slug) {
  "use cache";

  cacheLife("minutes");

  const project = await getPublishedProjectBySlug(slug);

  if (!project) return null;

  return {
    title: project.title,
    description:
      project.shortDescription ||
      project.description?.slice(0, 160) ||
      "Explore this software development project.",
    image: resolveImageUrl(project.coverImage?.url),
  };
}
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const project = await getCachedProjectMetadata(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const projectUrl = `/projects/${slug}`;

  const images = project.image
    ? [{ url: project.image, alt: project.title }]
    : [];

  return {
    title: project.title,
    description: project.description,

    alternates: {
      canonical: projectUrl,
    },

    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      url: projectUrl,
      images,
    },

    twitter: {
      card: images.length
        ? "summary_large_image"
        : "summary",
      title: project.title,
      description: project.description,
      images,
    },
  };
}
async function ProjectPageContent({ params }) {
  const { slug } = await params;

  return <ProjectDetails slug={slug} />;
}

export default function ProjectPage({ params }) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">Loading project details...</p>
        </main>
      }
    >
      <ProjectPageContent params={params} />
    </Suspense>
  );
}
