
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProjectBySlug } from "@/lib/services/public-portfolio.service";
import { resolveImageUrl } from "@/lib/utils";

const PLACEHOLDER_HEIGHT = {
  cover: "h-64 sm:h-96",
  gallery: "h-64",
};

function UnresolvedCover({ project }) {
  return (
    <div
      className={`flex ${PLACEHOLDER_HEIGHT.cover} w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400`}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="text-sm font-medium">
        Preview unavailable for this image link
      </span>
    </div>
  );
}

export default async function ProjectDetails({ slug }) {
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-xl font-bold text-slate-900"
          >
            Toufique<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/#projects"
            className="text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            Back to Projects
          </Link>
        </div>
      </header>

      {/* Project Content */}
      <article className="mx-auto max-w-5xl px-5 py-12 sm:px-8 md:py-16">
        {/* Title */}
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700">
            {project.status.replace("-", " ")}
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {project.title}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            {project.shortDescription}
          </p>
        </div>

        {/* Cover Image */}
        {project.coverImage?.url && (
          <div className="mb-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {resolveImageUrl(project.coverImage.url) ? (
              <img
                src={resolveImageUrl(project.coverImage.url)}
                alt={project.coverImage.alt || project.title}
                className="max-h-[520px] w-full object-cover"
              />
            ) : (
              <UnresolvedCover project={project} />
            )}
          </div>
        )}

        {/* Project Links */}
        <div className="mb-12 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Live Demo
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600"
            >
              GitHub Repository
            </a>
          )}
        </div>

        {/* Description */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            About This Project
          </h2>

          <p className="whitespace-pre-line text-base leading-8 text-slate-600">
            {project.description}
          </p>
        </section>

        {/* Technologies */}
        {project.technologies?.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              Technology Stack
            </h2>

            <div className="flex flex-wrap gap-3">
              {project.technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                >
                  {technology}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Key Features */}
        {project.features?.length > 0 && (
          <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              Key Features
            </h2>

            <ul className="space-y-3">
              {project.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-slate-600"
                >
                  <span className="mt-1 text-blue-600">✓</span>
                  <span className="leading-7">{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Challenges */}
        {project.challenges && (
          <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              Challenges & Solutions
            </h2>

            <p className="whitespace-pre-line leading-8 text-slate-600">
              {project.challenges}
            </p>
          </section>
        )}

        {/* Future Improvements */}
        {project.futurePlans?.length > 0 && (
          <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              Future Improvements
            </h2>

            <ul className="space-y-3">
              {project.futurePlans.map((plan, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-slate-600"
                >
                  <span className="mt-1 text-blue-600">→</span>
                  <span className="leading-7">{plan}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Gallery */}
        {(() => {
          const gallery = (project.gallery || [])
            .map((image) => ({
              ...image,
              resolvedUrl: resolveImageUrl(image.url),
            }))
            .filter((image) => image.resolvedUrl);

          if (gallery.length === 0) return null;

          return (
            <section className="mb-12">
              <h2 className="mb-5 text-2xl font-bold text-slate-900">
                Project Gallery
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                {gallery.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <img
                      src={image.resolvedUrl}
                      alt={
                        image.alt || `${project.title} screenshot ${index + 1}`
                      }
                      className={PLACEHOLDER_HEIGHT.gallery + " w-full object-cover"}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Back Link */}
        <div className="border-t border-slate-200 pt-8">
          <Link
            href="/#projects"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to all projects
          </Link>
        </div>
      </article>
    </main>
  );
}
