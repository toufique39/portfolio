import { MongoClient, ObjectId } from "mongodb";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";

const BASE = "http://localhost:10000";
const COOKIE_NAME = "better-auth.session_token";

const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

await client.connect();
const db = client.db(process.env.MONGODB_DB);

const session = (
  await db.collection("session").find({ expiresAt: { $gt: new Date() } }).sort({ expiresAt: -1 }).limit(1).toArray()
)[0];

if (!session) {
  console.log("NO VALID SESSION FOUND");
  process.exit(1);
}

const secret = process.env.BETTER_AUTH_SECRET;
const signature = crypto.createHmac("sha256", secret).update(session.token).digest("base64");
const cookie = `${COOKIE_NAME}=${session.token}.${signature}`;

const originalProfile = await db.collection("profiles").findOne({ _id: "main" });

async function call(path, options = {}, withCookie = true) {
  const headers = new Headers(options.headers || {});
  if (withCookie) headers.set("cookie", cookie);
  const res = await fetch(BASE + path, { ...options, headers });
  return { status: res.status, res };
}

async function jsonOf(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ---- 1. admin check ----
{
  const { status, res } = await call("/api/admin/check");
  console.log("admin/check:", status, JSON.stringify(await jsonOf(res)));
}

// ---- 2. upload resume ----
let resumeAsset = null;
{
  const pdf = await readFile("C:/Users/jt/AppData/Local/Temp/opencode/uploadtest/test-resume.pdf");
  const form = new FormData();
  form.append("file", new Blob([pdf], { type: "application/pdf" }), "test-resume.pdf");
  form.append("kind", "resume");
  const { status, res } = await call("/api/admin/upload", { method: "POST", body: form });
  const body = await jsonOf(res);
  resumeAsset = body?.asset || null;
  console.log("upload/resume:", status, JSON.stringify(body));
}

// ---- 3. upload image ----
let imageAsset = null;
{
  const png = await readFile("C:/Users/jt/AppData/Local/Temp/opencode/uploadtest/test-image.png");
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "test-image.png");
  form.append("kind", "profile-image");
  const { status, res } = await call("/api/admin/upload", { method: "POST", body: form });
  const body = await jsonOf(res);
  imageAsset = body?.asset || null;
  console.log("upload/image:", status, JSON.stringify(body));
}

// ---- 4. check delivered image URL ----
if (imageAsset?.url) {
  const img = await fetch(imageAsset.url);
  const imgBytes = Number(img.headers.get("content-length") || 0);
  console.log("image asset fetch:", img.status, "bytes:", imgBytes, "type:", img.headers.get("content-type"));
}

// ---- 5. resume download route ----
{
  const { status, res } = await call("/api/resume/download", {}, false);
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(
    "/api/resume/download:",
    status,
    "bytes:", buf.length,
    "isPDF:", buf.subarray(0, 5).toString("ascii") === "%PDF-",
    "disposition:", res.headers.get("content-disposition")
  );
}

// ---- 6. profile save with uploaded image + resume ----
if (resumeAsset && imageAsset) {
  const payload = {
    ...(originalProfile || {}),
    name: originalProfile?.name || "Test User",
    designation: originalProfile?.designation || "Developer",
    email: originalProfile?.email || "test@example.com",
    interests: originalProfile?.interests || [],
    profileImage: { url: imageAsset.url, publicId: imageAsset.publicId, alt: "Test photo" },
    resumeUrl: resumeAsset.url,
  };
  delete payload._id;
  delete payload.createdAt;
  delete payload.updatedAt;

  const { status, res } = await call("/api/admin/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("profile PUT:", status, JSON.stringify(await jsonOf(res)));
}

// ---- 7. public home page render ----
{
  const { status, res } = await call("/", {}, false);
  const html = await res.text();
  console.log("GET /:", status, "len:", html.length);
  console.log("  contains profile image URL:", html.includes("/image/upload/"));
  console.log("  contains double ext:", html.includes(".jpg.jpg"));
}

// ---- 8. projects page ----
{
  const projects = await db.collection("projects").find({ isPublished: true }).limit(1).toArray();
  if (projects[0]) {
    const { status } = await call(`/projects/${projects[0].slug}`, {}, false);
    console.log(`GET /projects/${projects[0].slug}:`, status);
  } else {
    console.log("no published projects to test");
  }
}

// ---- cleanup: restore original profile ----
if (originalProfile) {
  const { _id, ...rest } = originalProfile;
  await db.collection("profiles").replaceOne({ _id: "main" }, { ...rest, _id: _id.constructor.name === "ObjectId" ? new ObjectId(_id) : _id });
  console.log("original profile restored");
}

await client.close();
