"use client";

// Shared client helper for uploading files from the device to the admin
// upload API (which stores them on Cloudinary). Throws an Error with a
// friendly message on failure, returns `{ url, publicId, ... }` on success.
export async function uploadAdminFile(file, kind) {
  if (!file) {
    throw new Error("No file was selected.");
  }

  const data = new FormData();
  data.append("file", file);
  data.append("kind", kind);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: data,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Upload failed.");
  }

  return result.asset;
}
