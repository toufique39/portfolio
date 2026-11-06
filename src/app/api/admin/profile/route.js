import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { profileSchema } from "@/lib/portfolio-schemas";
import {
  getProfile,
  upsertProfile,
} from "@/lib/services/profile.service";



// Don't let authenticated admin data be cached by browsers or proxies.
const noStore = { "Cache-Control": "no-store" };

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401, headers: noStore }
  );
}

function serverError(message) {
  return NextResponse.json(
    { success: false, message },
    { status: 500, headers: noStore }
  );
}

// Drop keys set to `undefined` so an update never overwrites stored
// fields with NULL via $set (the Mongo driver serializes undefined
// as null). Only use fields the client actually sent.
function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return unauthorized();
    }

    const profile = await getProfile();

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { headers: noStore }
    );
  } catch (error) {
    console.error("Get profile error:", error);

    return serverError("Failed to fetch profile");
  }
}

export async function PUT(request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return unauthorized();
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400, headers: noStore }
      );
    }

    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid profile data",
          errors: validation.error.flatten(),
        },
        { status: 400, headers: noStore }
      );
    }

    const profile = await upsertProfile(stripUndefined(validation.data));

    return NextResponse.json(
      {
        success: true,
        message: "Profile saved successfully",
        data: profile,
      },
      { headers: noStore }
    );
  } catch (error) {
    console.error("Update profile error:", error);

    return serverError("Failed to save profile");
  }
}
