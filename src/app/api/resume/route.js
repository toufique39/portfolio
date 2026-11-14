import { io } from "next/cache";
import { NextResponse } from "next/server";

import { getPublicProfile } from "@/lib/services/public-portfolio.service";
import { buildResumeDownloadUrl, isCloudinaryUploadUrl } from "@/lib/utils";

// Serve the resume as a PDF download from any page on the public site.
//
// Cloudinary stores the resume as a *raw* asset, and raw assets reject
// `fl_attachment` transformation flags with a 400 error — so the forced
// download (correct filename + attachment disposition) is handled by the
// streaming `/api/resume/download` route. Non-Cloudinary resume URLs are
// redirected to directly via `buildResumeDownloadUrl`.
// Dynamic so an updated resume URL is picked up immediately without
// needing to redeploy the site.

export async function GET(request) {
  // Opt into request-time execution before reading `request.url` —
  // accessing it during the build-time prerender probe bails out of
  // prerendering and fails `next build`.
  await io();

  try {
    const profile = await getPublicProfile();

    if (!profile?.resumeUrl) {
      return NextResponse.json(
        { success: false, message: "No resume published yet." },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const destination = isCloudinaryUploadUrl(profile.resumeUrl)
      ? new URL("/api/resume/download", request.url)
      : buildResumeDownloadUrl(profile.resumeUrl);

    if (!destination) {
      return NextResponse.json(
        { success: false, message: "No resume published yet." },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.redirect(destination, {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Resume download error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch resume." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
