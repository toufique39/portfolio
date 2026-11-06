
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setError(error.message || "Logout failed.");
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Unable to logout. Please try again.");
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

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
