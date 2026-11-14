import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/admin-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";


const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isValidFile(buffer, kind, mimeType) {
  if (kind === "resume") {
    return (
      mimeType === "application/pdf" &&
      buffer.subarray(0, 5).toString("ascii") === "%PDF-"
    );
  }

  if (mimeType === "image/jpeg") {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }

  if (mimeType === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

export async function POST(request) {
  try {
    // 1. Authenticate admin
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized access." },
        401
      );
    }

    // 2. Read FormData (a malformed multipart body is a client error)
    let formData;

    try {
      formData = await request.formData();
    } catch {
      return jsonResponse(
        { success: false, message: "Invalid upload request." },
        400
      );
    }

    const file = formData.get("file");
    const kind = formData.get("kind");

    if (
      !file ||
      typeof file.arrayBuffer !== "function" ||
      !["profile-image", "resume", "cover-image", "gallery-image"].includes(
        kind
      )
    ) {
      return jsonResponse(
        { success: false, message: "Invalid upload request." },
        400
      );
    }

    // 3. Validate file size and MIME type
    const isResume = kind === "resume";

    const allowedTypes = isResume
      ? ["application/pdf"]
      : ["image/jpeg", "image/png", "image/webp"];

    const maxSize = isResume
      ? MAX_RESUME_SIZE
      : MAX_IMAGE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return jsonResponse(
        { success: false, message: "Unsupported file type." },
        400
      );
    }

    if (file.size === 0 || file.size > maxSize) {
      return jsonResponse(
        { success: false, message: "File size is invalid or too large." },
        400
      );
    }

    // 4. Verify actual file signature
    const buffer = Buffer.from(await file.arrayBuffer());

    if (
      buffer.length !== file.size ||
      !isValidFile(buffer, kind, file.type)
    ) {
      return jsonResponse(
        { success: false, message: "File content does not match its type." },
        400
      );
    }

    // 5. Upload to Cloudinary
    let result;

    if (isResume) {
      result = await uploadToCloudinary(buffer, {
        folder: "toufique-portfolio/resumes",
        public_id: `resume-${randomUUID()}.pdf`,
        resource_type: "raw",
        type: "upload",
        overwrite: false,
      });
    } else {
      const folder =
        kind === "profile-image"
          ? "toufique-portfolio/profile"
          : "toufique-portfolio/projects";

      // Do NOT include a file extension in the image public_id: Cloudinary
      // appends the real format itself, and an embedded extension is stored
      // as part of the ID, producing broken double-extension delivery URLs
      // such as `profile-image-x.jpg.jpg`.
      result = await uploadToCloudinary(buffer, {
        folder,
        public_id: `${kind}-${randomUUID()}`,
        resource_type: "image",
        type: "upload",
        overwrite: false,
      });
    }

    // 6. Return uploaded asset information
    return jsonResponse({
      success: true,
      message: "File uploaded successfully.",
      asset: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error(
      "Admin upload error:",
      error instanceof Error ? error.message : error,
      error?.http_code ? `http_code=${error.http_code}` : ""
    );

    // Give actionable feedback for the most common transient failure.
    if (error?.name === "TimeoutError" || error?.http_code === 499) {
      return jsonResponse(
        {
          success: false,
          message:
            "The file upload timed out while transferring to the storage provider, most likely due to a slow connection. Please try again or upload a smaller file.",
        },
        504
      );
    }

    return jsonResponse(
      {
        success: false,
        message: "Upload failed. Please check the server configuration.",
      },
      500
    );
  }
}