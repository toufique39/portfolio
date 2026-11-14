
import { io } from "next/cache";

import { getProfile } from "@/lib/services/profile.service";

const MAX_RESUME_SIZE = 10 * 1024 * 1024;

// Resolve the original PDF URL from a stored Cloudinary raw asset URL,
// stripping any injected transformation segments. Returns null when the
// stored URL is not a usable Cloudinary raw upload so the caller can
// respond with a clear error instead of a generic 500.
function getOriginalResumeUrl(resumeUrl) {
  let url;

  try {
    url = new URL(resumeUrl);
  } catch {
    return null;
  }

  // Only allow your own Cloudinary account.
  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com"
  ) {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const expectedCloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (
    !expectedCloudName ||
    parts[0] !== expectedCloudName ||
    parts[1] !== "raw" ||
    parts[2] !== "upload"
  ) {
    return null;
  }

  const uploadIndex = parts.indexOf("upload");

  // Locate Cloudinary's version segment, e.g. v1793967315, if present.
  const versionIndex = parts.findIndex(
    (part, index) =>
      index > uploadIndex && /^v\d+$/.test(part)
  );

  // Remove all transformations between "upload" and the version. A
  // version-less URL (older or manually created assets) is already the
  // original file, so it is used as-is.
  const originalParts =
    versionIndex === -1
      ? parts
      : [
          ...parts.slice(0, uploadIndex + 1),
          ...parts.slice(versionIndex),
        ];

  const originalFilename = originalParts.at(-1);

  if (!originalFilename?.toLowerCase().endsWith(".pdf")) {
    return null;
  }

  url.pathname = `/${originalParts.join("/")}`;

  return url.toString();
}

export async function GET() {
  // Ping the DB and fetch Cloudinary per request, never during the
  // build-time prerender probe.
  await io();

  try {
    const profile = await getProfile();

    if (!profile?.resumeUrl) {
      return Response.json(
        {
          success: false,
          message: "Resume is not available.",
        },
        { status: 404 }
      );
    }

    // Resolve the original PDF URL, not a transformed URL.
    const originalUrl = getOriginalResumeUrl(profile.resumeUrl);

    if (!originalUrl) {
      console.error(
        "Stored resume URL is not a valid Cloudinary raw PDF asset:",
        profile.resumeUrl
      );

      return Response.json(
        {
          success: false,
          message: "The stored resume link is invalid.",
        },
        { status: 502 }
      );
    }

    const upstream = await fetch(originalUrl, {
      cache: "no-store",
      redirect: "error",
    });

    if (!upstream.ok) {
      console.error(
        "Cloudinary resume fetch failed:",
        upstream.status
      );

      return Response.json(
        {
          success: false,
          message: "Unable to retrieve the resume from storage.",
        },
        { status: 502 }
      );
    }

    const contentLength = Number(
      upstream.headers.get("content-length") || 0
    );

    if (contentLength > MAX_RESUME_SIZE) {
      return Response.json(
        {
          success: false,
          message: "Resume file exceeds the allowed size.",
        },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());

    if (
      buffer.length === 0 ||
      buffer.length > MAX_RESUME_SIZE ||
      buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
    ) {
      return Response.json(
        {
          success: false,
          message: "The stored file is not a valid PDF.",
        },
        { status: 502 }
      );
    }

    const safeName = (profile.name || "Portfolio")
      .trim()
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-|-$/g, "");

    const filename = `${safeName || "Portfolio"}-Resume.pdf`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Resume download error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to download the resume.",
      },
      { status: 500 }
    );
  }
}
