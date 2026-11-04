
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// Check whether the current session belongs to the configured admin.
export async function getAdminSession() {
  const adminUserId = process.env.ADMIN_USER_ID;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminUserId || !adminEmail) {
    console.error("Admin environment variables are missing.");
    return null;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const isAdmin =
    session.user.id === adminUserId &&
    session.user.email?.trim().toLowerCase() === adminEmail;

  return isAdmin ? session : null;
}

// Protect pages that require admin access.
export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
