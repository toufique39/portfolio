
import {
  UserRound,
  Code2,
  FolderKanban,
  Trophy,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

const modules = [
  {
    title: "Profile Management",
    description: "Manage your name, designation, profile photo and resume.",
    icon: UserRound,
  },
  {
    title: "Skills Management",
    description: "Organize your technical skills into categories.",
    icon: Code2,
  },
  {
    title: "Project Management",
    description: "Showcase projects with images, features and links.",
    icon: FolderKanban,
  },
  {
    title: "Achievements",
    description: "Manage your awards, achievements and certifications.",
    icon: Trophy,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-400">
          <Sparkles size={16} />
          YOUR PERSONAL CMS
        </p>

        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome to your Dashboard!
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Manage your portfolio content, showcase your work and keep
          your professional profile up to date.
        </p>
      </section>

      {/* Project Status */}
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/15 to-indigo-600/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-300">
              DEVELOPMENT STATUS
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Your Portfolio CMS is taking shape.
            </h3>

            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Authentication and protected dashboard architecture
              are ready. Content management modules are next.
            </p>
          </div>

          <div className="rounded-xl bg-blue-500/15 p-4 text-blue-400">
            <Sparkles size={30} />
          </div>
        </div>
      </section>

      {/* Management Modules */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Management Modules
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Your portfolio content control center.
            </p>
          </div>

          <span className="text-xs text-slate-500">Coming soon</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/40"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
                    <Icon size={22} />
                  </div>

                  <ArrowUpRight size={18} className="text-slate-600" />
                </div>

                <h4 className="mt-5 font-semibold text-white">
                  {module.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {module.description}
                </p>

                <span className="mt-4 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  Under development
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
