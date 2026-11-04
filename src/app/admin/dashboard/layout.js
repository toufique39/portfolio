
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminDashboardLayout({ children }) {
  await requireAdmin();

  return <>{children}</>;
}
