
import PublicNavbar from "@/components/portfolio/PublicNavbar";
import PublicSocialLinks from "@/components/portfolio/PublicSocialLinks";
import {
  isCloudinaryUploadUrl,
  resolveImageUrl,
} from "@/lib/utils";
import { connection } from "next/server";

import {
  getPublicProfile,
  getPublicSiteSettings,
  getPublicSocialLinks,
  getPublicSkills,
  getPublicProjects,
  getPublicEducations,
  getPublicExperiences
} from "@/lib/services/public-portfolio.service";
import Image from "next/image";
import Link from "next/link";
import ContactSection from "@/components/portfolio/ContactSection";
import PublicFooter from "@/components/portfolio/PublicFooter";


export default async function PublicHome() {

  
await connection();

  const [
    profile,
    settings,
    socialLinks,
    skills,
    projects,
    educations,
    experiences,
  ] = await Promise.all([
    getPublicProfile(),
    getPublicSiteSettings(),
    getPublicSocialLinks(),
    getPublicSkills(),
    getPublicProjects(),
    getPublicEducations(),
    getPublicExperiences(),
  ]);


  // Default navigation
  const defaultNavigation = [
    { label: "Home", href: "#home", sortOrder: 0 },
    { label: "About", href: "#about", sortOrder: 1 },
    { label: "Skills", href: "#skills", sortOrder: 2 },
    { label: "Projects", href: "#projects", sortOrder: 3 },
    { label: "Education", href: "#education", sortOrder: 4 },
    { label: "Experience", href: "#experience", sortOrder: 5 },
    { label: "Contact", href: "#contact", sortOrder: 6 },
  ];

  // Prepare navigation links
  const navigation = (
    settings?.navigation?.length
      ? settings.navigation
      : defaultNavigation
  )
    .filter(
      (item) =>
        item.isVisible !== false &&
        item.label &&
        item.href
    )
    .sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

  // Handle missing profile
  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Portfolio Not Available
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please add your profile information from the admin dashboard.
          </p>
        </div>
      </main>
    );
  }

  // Parse About content into separate sections
  const headingPattern =
    /##\s*(Personal Engagement|Technical Expertise|Projects\s*&\s*Practical Experience|Passion\s*&\s*Career Goals|Let's Connect)\s*/g;

  const aboutParts = (profile.about || "").split(headingPattern);

  const aboutSections = [];

  if (aboutParts[0]?.trim()) {
    aboutSections.push({
      title: "",
      content: aboutParts[0].trim(),
    });
  }

  for (let i = 1; i < aboutParts.length; i += 2) {
    aboutSections.push({
      title: aboutParts[i],
      content: aboutParts[i + 1] || "",
    });
  }

  // A renderable profile photo URL (null for HTML pages or empty values).
  // `next/image` only supports hosts configured in next.config.mjs, so any
  // other image host falls back to a plain <img> instead of crashing the
  // whole page with an unconfigured-host error.
  const profileImageUrl = resolveImageUrl(profile.profileImage?.url);
  const profileImageIsCloudinary = isCloudinaryUploadUrl(profileImageUrl);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <PublicNavbar
  links={navigation}
  resumeUrl={profile.resumeUrl || ""}
/>

      {/* ================= MAIN CONTENT ================= */}
      <main className="min-h-screen bg-white text-slate-900">

        {/* ================= HERO SECTION ================= */}
        <section
          id="home"
          className="scroll-mt-24 px-5 py-16 sm:px-8 md:py-24"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">

            {/* Hero Content */}
            <div className="space-y-6">

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {profile.name
                  ? /Ahmed/i.test(profile.name)
                    ? `I'm ${profile.name}`
                    : `I'm ${profile.name} Ahmed`
                  : "Portfolio"}
              </h1>

              {profile.headline && (
                <h2 className="text-xl font-semibold leading-relaxed text-slate-600 sm:text-2xl">
                  {profile.headline}
                </h2>
              )}

              {profile.heroDescription && (
                <p className="max-w-xl text-base leading-8 text-slate-600">
                  {profile.heroDescription}
                </p>
              )}

              {/* Hero Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
             {profile.resumeUrl && (
  <a
    href="/api/resume/download"
    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
  >
    Download Resume ↓
  </a>
)}
              </div>

              {/* Social Links */}
              <PublicSocialLinks links={socialLinks} />
            </div>

            {/* Profile Image */}
            <div className="flex justify-center md:justify-end">
              {profileImageUrl ? (
                <div className="relative h-64 w-64 overflow-hidden rounded-full border-8 border-slate-100 bg-slate-100 shadow-xl sm:h-80 sm:w-80">
                  {profileImageIsCloudinary ? (
                    <Image
                      src={profileImageUrl}
                      alt={profile.profileImage.alt || "Profile photo"}
                      fill
                      sizes="(max-width: 640px) 256px, 320px"
                      className="object-cover"
                    />
                  ) : (
                    <img
                      src={profileImageUrl}
                      alt={profile.profileImage.alt || "Profile photo"}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-full border-8 border-slate-100 bg-slate-100 text-7xl font-bold text-slate-400 shadow-xl sm:h-80 sm:w-80">
                  {profile.name?.charAt(0)?.toUpperCase() || "P"}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= ABOUT SECTION ================= */}
        <section
          id="about"
          className="scroll-mt-24 w-full bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 md:py-24"
        >
          <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white px-5 py-10 shadow-sm sm:px-8 sm:py-12 lg:px-14">
            <div className="mx-auto max-w-4xl">

              {/* Section Header */}
              <div className="mb-10 border-b border-slate-200 pb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
                  Get to know me
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  About Me
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  My journey, technical expertise, projects, and career goals.
                </p>
              </div>

              {/* About Content */}
              <div className="space-y-9">
                {aboutSections.map((section, index) => {
                  const formattedContent = section.content
                    .replace(
                      /\s+(Frontend:|Backend:|Languages:|Database:|Authentication:|Tools\s*&\s*DevOps:)/g,
                      "\n$1"
                    )
                    .replace(
                      /\s+(GitHub:)/g,
                      "\n$1"
                    )
                    .replace(
                      /\s+(Cloud-Native To-Do Application|Weather Advisor AI Agent|University Management System(?: \(In Progress\))?|FitLog|BazarDor|Air Quality Monitoring System|Flutter Social Media Application)/g,
                      "\n$1"
                    );

                  const paragraphs = formattedContent
                    .split(/\n+/)
                    .map((item) => item.trim())
                    .filter(Boolean);

                  return (
                    <article
                      key={index}
                      className="border-l-2 border-blue-100 pl-4 sm:pl-6"
                    >
                      {section.title && (
                        <h3 className="mb-4 text-xl font-semibold text-slate-900">
                          {section.title}
                        </h3>
                      )}

                      <div className="space-y-3">
                        {paragraphs.map((paragraph, paragraphIndex) => (
                          <p
                            key={paragraphIndex}
                            className="wrap-break-word text-base leading-8 text-slate-600"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        
{/* ================= SKILLS SECTION ================= */}
<section
  id="skills"
  className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 lg:px-8 md:py-24"
>
  <div className="mx-auto max-w-6xl">

    {/* Section Header */}
    <div className="mb-12 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
        What I Work With
      </p>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Technical Skills
      </h2>

      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
        Technologies, tools and platforms I have learned and used
        while building projects.
      </p>
    </div>

    {/* Empty State */}
    {skills.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
        <p className="font-medium text-slate-700">
          Skills will be added soon.
        </p>
      </div>
    ) : (
      <div className="space-y-10">
        {[
          { key: "frontend", label: "Frontend Development" },
          { key: "backend", label: "Backend Development" },
          { key: "database", label: "Database" },
          { key: "devops", label: "DevOps" },
          { key: "tools", label: "Tools & Technologies" },
          { key: "iot", label: "IoT & Robotics" },
          { key: "ai", label: "AI & Machine Learning" },
          { key: "other", label: "Other Skills" },
        ].map((category) => {
          const categorySkills = skills.filter(
            (skill) => skill.category === category.key
          );

          if (categorySkills.length === 0) return null;

          return (
            <div key={category.key}>
              <h3 className="mb-5 text-xl font-semibold text-slate-900">
                {category.label}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categorySkills.map((skill) => (
                  <article
                    key={skill.id || skill.name}
                    className={`rounded-xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${
                      skill.isFeatured
                        ? "border-blue-200 bg-blue-50/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {skill.icon && (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl">
                            {skill.icon}
                          </span>
                        )}

                        <h4 className="font-semibold text-slate-900">
                          {skill.name}
                        </h4>
                      </div>

                      {skill.isFeatured && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                          Featured
                        </span>
                      )}
                    </div>

                    {skill.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {skill.description}
                      </p>
                    )}

                    {skill.proficiencyLabel && (
                      <p className="mt-4 text-xs font-semibold text-blue-600">
                        {skill.proficiencyLabel}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</section>


{/* ================= PROJECTS SECTION ================= */}
<section
  id="projects"
  className="scroll-mt-24 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 md:py-24"
>
  <div className="mx-auto max-w-6xl">

    {/* Section Header */}
    <div className="mb-12 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
        My Recent Work
      </p>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Featured Projects
      </h2>

      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
        A selection of projects where I apply my technical skills
        to build practical software solutions.
      </p>
    </div>

    {/* Projects List */}
    {projects.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-medium text-slate-700">
          Projects will be added soon.
        </p>
      </div>
    ) : (
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const coverImageUrl = resolveImageUrl(project.coverImage?.url);

          return (
            <article
              key={project.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Cover Image */}
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt={project.coverImage.alt || project.title}
                  className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-400">
                  No project image
                </div>
              )}

            <div className="space-y-4 p-5">
              {/* Title and Status */}
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                    {project.status?.replace("-", " ") || "project"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {project.title}
                </h3>
              </div>

              {/* Description */}
              <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                {project.shortDescription}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {project.technologies?.slice(0, 4).map((technology) => (
                  <span
                    key={technology}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {technology}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View Details →
                </Link>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-600 hover:text-blue-600"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </article>
          );
        })}
      </div>
    )}
  </div>
</section>

{/* ================= EDUCATION SECTION ================= */}
<section
  id="education"
  className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 lg:px-8 md:py-24"
>
  <div className="mx-auto max-w-6xl">

    {/* Section Header */}
    <div className="mb-12 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
        My Academic Background
      </p>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Education
      </h2>

      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
        My academic journey and educational qualifications.
      </p>
    </div>

    {educations.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
        <p className="text-slate-600">
          Education information will be added soon.
        </p>
      </div>
    ) : (
      <div className="mx-auto max-w-4xl space-y-6">
        {educations.map((education, index) => (
          <article
            key={`${education.institution}-${education.degree}-${index}`}
            className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {education.degree}
                </h3>

                <p className="font-medium text-blue-600">
                  {education.field}
                </p>

                <p className="text-slate-700">
                  {education.institution}
                </p>

                {education.description && (
                  <p className="pt-2 text-sm leading-7 text-slate-600">
                    {education.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {education.status === "studying"
                    ? "Currently Studying"
                    : "Completed"}
                </span>

                <p className="text-sm text-slate-500">
                  {education.startDate || "—"} –{" "}
                  {education.status === "studying"
                    ? "Present"
                    : education.endDate || "—"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
</section>



{/* ================= EXPERIENCE SECTION ================= */}
<section
  id="experience"
  className="scroll-mt-24 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 md:py-24"
>
  <div className="mx-auto max-w-6xl">

    {/* Section Header */}
    <div className="mb-12 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
        My Professional Journey
      </p>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Experience
      </h2>

      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
        My internships, professional roles and relevant work experience.
      </p>
    </div>

    {/* Empty State */}
    {experiences.length === 0 ? (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="font-semibold text-slate-800">
          Experience will be updated soon.
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          New professional experiences and opportunities will appear here.
        </p>
      </div>
    ) : (
      <div className="mx-auto max-w-4xl space-y-6">
        {experiences.map((experience, index) => (
          <article
            key={`${experience.company}-${experience.role}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-slate-900">
                  {experience.role}
                </h3>

                <p className="mt-1 font-semibold text-blue-600">
                  {experience.company}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {experience.employmentType}
                  {experience.location
                    ? ` · ${experience.location}`
                    : ""}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {experience.isCurrent
                    ? "Currently Working"
                    : "Previous Experience"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              {experience.startDate || "—"}
              {" – "}
              {experience.isCurrent
                ? "Present"
                : experience.endDate || "—"}
            </p>

            {experience.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {experience.description}
              </p>
            )}

            {experience.responsibilities?.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-slate-900">
                  Responsibilities & Achievements
                </h4>

                <ul className="space-y-2">
                  {experience.responsibilities.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex gap-3 text-sm leading-7 text-slate-600"
                    >
                      <span className="text-blue-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {experience.technologies?.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">
                  Technologies Used
                </h4>

                <div className="flex flex-wrap gap-2">
                  {experience.technologies.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </div>
</section>
{/* ================= CONTACT SECTION ================= */}
<ContactSection profile={profile} />


      </main>


{/* Footer */}
<PublicFooter
  profile={profile}
  links={socialLinks}
  navigation={navigation}
/>
    </>
  );
}
