
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin Login | Toufique Portfolio",
  description: "Private administrator login",
};

// NOTE: `instant = false` opts out of Cache Components blocking-prerender
// validation — the session check must block at request time by design, since
// an already-authenticated admin gets redirected to the dashboard.

export const instant = false;

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            TA
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Private Administration
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your portfolio.
          </p>
        </div>

        <AdminLoginForm />
        <p className="mt-7 text-center text-xs text-slate-400">
   disclaimer: This is a private admin login page. Unauthorized access is prohibited. If you are not an admin, please leave this page.
</p>
      </div>
    </main>
  );
}
