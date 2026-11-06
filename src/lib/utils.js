export { cn } from "cn"

// Returns a directly renderable image URL, or null when the URL points at an
// HTML page (for example a Google Images or Pexels search result) instead of
// an image file. Google Images results embed the real image in `imgurl`.
export function resolveImageUrl(url) {
  if (typeof url !== "string") return null;

  const trimmed = url.trim();

  if (!trimmed) return null;

  let parsed;

  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (
    parsed.hostname.endsWith("google.com") &&
    parsed.pathname === "/imgres"
  ) {
    const embedded = parsed.searchParams.get("imgurl");

    return embedded ? resolveImageUrl(embedded) : null;
  }

  const hasImageExtension = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(
    parsed.pathname,
  );

  const isImageHost =
    parsed.hostname === "res.cloudinary.com" ||
    parsed.hostname === "i.imgur.com";

  return hasImageExtension || isImageHost ? parsed.href : null;
}

// Public file name for resume downloads.
export const RESUME_FILE_NAME = "Toufique-Ahmed-Resume.pdf";

// Builds a URL that serves the resume as a forced PDF download from any
// page. Cloudinary assets get the `fl_attachment:filename` transformation
// so the browser downloads (and names) the file even without a markup
// `download` attribute; other hosts are returned unchanged. Returns null
// when there is no usable resume URL.
export function buildResumeDownloadUrl(resumeUrl) {
  if (typeof resumeUrl !== "string") return null;

  const trimmed = resumeUrl.trim();

  if (!/^https?:\/\//i.test(trimmed)) return null;

  if (
    trimmed.includes("res.cloudinary.com") &&
    trimmed.includes("/upload/")
  ) {
    if (trimmed.includes("/fl_attachment")) return trimmed;

    return trimmed.replace(
      "/upload/",
      `/upload/fl_attachment:${RESUME_FILE_NAME}/`,
    );
  }

  return trimmed;
}

// Whether the profile already has the rounded `fl_attachment` marker used
// by the legacy navbar/hero download attribute.
export function isCloudinaryUploadUrl(url) {
  return (
    typeof url === "string" &&
    url.includes("res.cloudinary.com") &&
    url.includes("/upload/")
  );
}
