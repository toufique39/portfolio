"use client";

import { notifyError } from "@/lib/notify";

// An admin API call returned 401: the session is expired or invalid. The
// page itself still renders (it was served before the session ended), so
// explain what happened and send the admin to the login page. A full
// navigation also clears stale client-side state.
export function handleAdminSessionExpired() {
  notifyError(
    "Session expired",
    "Please log in again to continue managing your portfolio."
  );

  setTimeout(() => {
    window.location.href = "/admin/login";
  }, 1500);
}
