"use client";

// Shared client helper for uploading files from the device to the admin
// upload API (which stores them on Cloudinary). Throws an Error with a
// friendly message on failure, returns `{ url, publicId, ... }` on success.

// Give up client-side after 3 minutes so a hung connection (for example a
// dev-server restart in the middle of an upload) can never leave the
// upload UI stuck in the "Uploading..." state with the input disabled.
const UPLOAD_TIMEOUT_MS = 3 * 60 * 1000;

export async function uploadAdminFile(file, kind) {
  if (!file) {
    throw new Error("No file was selected.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  let response;

  try {
    const data = new FormData();
    data.append("file", file);
    data.append("kind", kind);

    response = await fetch("/api/admin/upload", {
      method: "POST",
      body: data,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "The upload took too long and was cancelled. Check your connection and try again."
      );
    }

    throw new Error(
      "Could not reach the server. Please check your connection and try again."
    );
  } finally {
    clearTimeout(timeout);
  }

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    const error = new Error(result?.message || "Upload failed.");

    // Let callers react to auth problems (401 = session expired).
    error.status = response.status;
    throw error;
  }

  return result.asset;
}
