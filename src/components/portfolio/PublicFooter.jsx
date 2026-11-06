
import Link from "next/link";
import { cacheLife } from "next/cache";
async function getCurrentYear() {
  "use cache";

  cacheLife("days");

  return new Date().getFullYear();
}

export default async function PublicFooter({
  profile,
  links = [],
  navigation = [],
}) {
    const currentYear = await getCurrentYear();

  const footerNavigation = navigation.filter(
    (item) =>
      item.isVisible !== false &&
      item.label &&
      item.href &&
      item.href !== "#contact"
  );

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight text-white"
            >
              {profile?.name || "Portfolio"}
              <span className="text-blue-500">.</span>
            </Link>

            {profile?.designation && (
              <p className="text-sm font-medium text-blue-400">
                {profile.designation}
              </p>
            )}

            <p className="max-w-xs text-sm leading-7 text-slate-400">
              Building, learning and improving through technology
              and meaningful software projects.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-400 transition hover:text-blue-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-5 font-semibold text-white">
              Connect With Me
            </h3>

            {links.length > 0 ? (
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-400 transition hover:text-blue-400"
                    >
                      {link.label || link.platform}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                Social links coming soon.
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 font-semibold text-white">
              Contact
            </h3>

            <ul className="space-y-3 text-sm text-slate-400">
              {profile?.email && (
                <li className="break-all">
                  <a
                    href={`mailto:${profile.email}`}
                    className="transition hover:text-blue-400"
                  >
                    {profile.email}
                  </a>
                </li>
              )}

              {profile?.phone && (
                <li>
                  <a
                    href={`tel:${profile.phone}`}
                    className="transition hover:text-blue-400"
                  >
                    {profile.phone}
                  </a>
                </li>
              )}

              {profile?.location && (
                <li>{profile.location}</li>
              )}
            </ul>

            <a
              href="#contact"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Send a Message
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-slate-400">
            © {currentYear} {profile?.name || "Portfolio"}. All rights reserved.
          </p>

          <a
            href="#home"
            className="text-sm font-medium text-slate-400 transition hover:text-blue-400"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
