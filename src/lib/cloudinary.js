// Cloudinary upload helpers.
import { v2 as cloudinary } from "cloudinary";

// Hard limit the SDK waits for a Cloudinary response. Large files on
// slow connections need more than the SDK's default 60s window.
const CLOUDINARY_TIMEOUT_MS = 120000;

// A transient failure is worth retrying: the cloud often stops waiting
// for a slow upload stream mid-transfer (http 499 "Request Timeout") or
// answers through an overloaded edge node (5xx).
function isTransientUploadError(error) {
  const httpCode = error?.http_code;

  return (
    error?.name === "TimeoutError" ||
    error?.message === "Request Timeout" ||
    httpCode === 499 ||
    httpCode === 500 ||
    httpCode === 502 ||
    httpCode === 503 ||
    httpCode === 599
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function configureCloudinary() {
  const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
  } = process.env;

  if (
    !CLOUDINARY_CLOUD_NAME ||
    !CLOUDINARY_API_KEY ||
    !CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
    timeout: CLOUDINARY_TIMEOUT_MS,
  });
}

// Upload a file buffer, retrying transient network/cloud failures so a
// slow connection doesn't surface as an immediate 500 in the admin UI.
export async function uploadToCloudinary(
  buffer,
  options = {},
  { retries = 2, retryDelayMs = 2000 } = {}
) {
  configureCloudinary();

  function attempt(retriesLeft) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          ...options,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        }
      );

      uploadStream.end(buffer);
    }).catch(async (error) => {
      if (retriesLeft > 0 && isTransientUploadError(error)) {
        await delay(retryDelayMs);

        return attempt(retriesLeft - 1);
      }

      throw error;
    });
  }

  return attempt(retries);
}
