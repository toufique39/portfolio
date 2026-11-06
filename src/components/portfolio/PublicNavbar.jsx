
"use client";

import { useState } from "react";

export default function PublicNavbar({
  links = [],
  resumeUrl = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">

        {/* Logo */}
        <a
          href="#home"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white"
        >
            TA
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">

          {/* Download Resume */}
          {resumeUrl && (
            <a
              href="/api/resume/download"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>

              Download CV
            </a>
          )}

          <a
  href="/admin/dashboard/profile"
  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
>
  Admin
</a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
        >
          {menuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">

            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}

            {/* Mobile Download Resume */}
            {resumeUrl && (
              <a
                href="/api/resume/download"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>

                Download Resume PDF
              </a>
            )}

           <a
  href="/admin/dashboard/profile"
  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
>
  Admin
</a>
          </div>
        </div>
      )}
    </header>
  );
}
