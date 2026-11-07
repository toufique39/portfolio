
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getMongoClient } from "@/lib/db";

// Check whether the current session belongs to the configured admin.
export async function getAdminSession() {
  const adminUserId = process.env.ADMIN_USER_ID;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminUserId || !adminEmail) {
    console.error("Admin environment variables are missing.");
    return null;
  }

  try {
    // Explicitly connect before the session lookup. The Mongo client is
    // lazily auto-connected; letting better-auth trigger the connection can
    // surface its "Failed to get session" error as an unhandled 500.
    await getMongoClient();

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
  } catch (error) {
    // A broken database or failed session lookup should read as "not
    // logged in" (401 upstream), never as an unhandled 500.
    console.error(
      "Admin session lookup failed:",
      error instanceof Error ? error.message : error
    );

    return null;
  }
}

// Protect pages that require admin access.
export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
