
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  FileText,
  Code2,
  FolderKanban,
  Trophy,
  BriefcaseBusiness,
  GraduationCap,
  Award,
  Share2,
  Settings,
  Menu,
  X,
  LockKeyhole,
} from "lucide-react";

import LogoutButton from "@/components/admin/LogoutButton";

const navigation = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/admin/dashboard/profile", icon: UserRound },
  { label: "About", href: "/admin/dashboard/about", icon: FileText },
  { label: "Skills", href: "/admin/dashboard/skills", icon: Code2 },
  { label: "Projects", href: "/admin/dashboard/projects", icon: FolderKanban },
  { label: "Achievements", href: "/admin/dashboard/achievements", icon: Trophy },
  { label: "Experience", href: "/admin/dashboard/experience", icon: BriefcaseBusiness },
  { label: "Education", href: "/admin/dashboard/education", icon: GraduationCap },
  { label: "Certifications", href: "/admin/dashboard/certifications", icon: Award },
  { label: "Social Links", href: "/admin/dashboard/social-links", icon: Share2 },
  { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
];

function SidebarContent({ pathname, onNavigate }) {
  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
          TA
        </div>

        <div>
          <h2 className="font-bold text-white">Toufique Ahmed</h2>
          <p className="text-xs text-slate-400">Portfolio Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const available = [
  "Overview",
  "Profile",
  "Social Links",
  "Skills",
  "Projects",
  "Education",
  "Experience",
  
].includes(item.label);
          if (!available) {
            return (
              <div
                key={item.href}
                title="This module will be available in a later development step."
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-3 text-sm text-slate-500"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                <span className="text-[10px] uppercase tracking-wide">Soon</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-3 text-xs text-slate-400">
          <LockKeyhole size={15} />
          Private admin workspace
        </div>
      </div>
    </>
  );
}

export default function AdminShell({ children, user }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-800 bg-slate-950 lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/70"
          />

          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-slate-800 bg-slate-950 shadow-xl">
            <div className="absolute right-4 top-6 z-10">
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarContent
              pathname={pathname}
              onNavigate={closeMobileMenu}
            />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-xs text-white-500">ADMIN WORKSPACE</p>
              <h1 className="text-sm font-semibold sm:text-base">
                Portfolio Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="max-w-48 truncate text-xs text-slate-400">
                {user.email}
              </p>
            </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            
<Link
  href="/"
  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
    <path d="M20 12H9" />
    <path d="M9 5H5v14h4" />
  </svg>

  Back to Homepage
</Link>
            <LogoutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
