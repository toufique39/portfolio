
import { io } from "next/cache";
import { getDb } from "@/lib/db";

// NOTE: `export const runtime` is not supported when `cacheComponents` is
// enabled in next.config.mjs — routes always use the default Node.js runtime.

// Ping the database per request, never during build-time prerendering.
export async function GET() {
  await io();
  try {
    const db = await getDb();

    await db.command({ ping: 1 });

    return Response.json(
      {
        success: true,
        message: "MongoDB connection successful",
        database: process.env.MONGODB_DB,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Database Health Check Failed:", error);

    return Response.json(
      {
        success: false,
        message: "Database unavailable",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
