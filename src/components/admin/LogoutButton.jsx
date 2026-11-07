
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { notifyError } from "@/lib/notify";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        notifyError(
          "Logout failed",
          error.message || "Unable to logout. Please try again."
        );
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      notifyError(
        "Logout failed",
        "Unable to logout. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <LogOut size={17} />
        )}

        {loading ? "Signing out..." : "Logout"}
      </button>
    </div>
  );
}
