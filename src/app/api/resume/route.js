import { NextResponse } from "next/server";

import { getPublicProfile } from "@/lib/services/public-portfolio.service";
import { buildResumeDownloadUrl } from "@/lib/utils";

// Serve the resume as a PDF download from any page on the public site
// by redirecting to the stored asset with a forced-download URL.
// Dynamic so an updated resume URL is picked up immediately without needing to redeploy the site.

export async function GET() {
  try {
    const profile = await getPublicProfile();
    const downloadUrl = buildResumeDownloadUrl(profile?.resumeUrl);

    if (!downloadUrl) {
      return NextResponse.json(
        { success: false, message: "No resume published yet." },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.redirect(downloadUrl, {
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
