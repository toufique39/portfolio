
import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";
export const instant = false;

export const metadata = {
  title: "Admin Dashboard | Toufique Portfolio",
  robots: {
    index: false,
    follow: false,
  },
};

// NOTE: `instant = false` opts this route out of Cache Components
// blocking-prerender validation — the auth check must block at request
// time by design, since unauthenticated visitors are redirected to
// /admin/login.


export default async function AdminDashboardLayout({ children }) {
  const session = await requireAdmin();

  const user = {
    name: session.user.name,
    email: session.user.email,
  };

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}
