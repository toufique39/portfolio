import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import { socialLinkSchema } from "@/lib/portfolio-schemas";



function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function serializeLink(link) {
  if (!link) return null;

  const { _id, ...data } = link;

  return {
    id: _id.toString(),
    ...data,
  };
}

function normalizeData(data) {
  return {
    ...data,
    platform: data.platform.trim().toLowerCase(),
    label: data.label.trim(),
    url: data.url.trim(),
    icon: data.icon?.trim() || "",
    sortOrder: Number(data.sortOrder),
    isPublished: Boolean(data.isPublished),
  };
}

// GET: Retrieve all social links
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const collection = await getCollection(COLLECTIONS.SOCIAL_LINKS);

    const links = await collection
      .find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .toArray();

    return jsonResponse({
      success: true,
      links: links.map(serializeLink),
    });
  } catch (error) {
    console.error("Get social links error:", error);

    return jsonResponse(
      { success: false, message: "Failed to load social links." },
      500
    );
  }
}

// POST: Create a social link
export async function POST(request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const body = await request.json();
    const validation = socialLinkSchema.safeParse(body);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid data.",
        },
        400
      );
    }

    const data = normalizeData(validation.data);
    const collection = await getCollection(COLLECTIONS.SOCIAL_LINKS);
    const now = new Date();

    const result = await collection.insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    const link = await collection.findOne({ _id: result.insertedId });

    return jsonResponse(
      {
        success: true,
        message: "Social link created successfully.",
        link: serializeLink(link),
      },
      201
    );
  } catch (error) {
    console.error("Create social link error:", error);

    if (error.code === 11000) {
      return jsonResponse(
        {
          success: false,
          message: "This social platform already exists.",
        },
        409
      );
    }

    return jsonResponse(
      { success: false, message: "Failed to create social link." },
      500
    );
  }
}

// PUT: Update a social link
export async function PUT(request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const body = await request.json();
    const { id, ...inputData } = body;

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return jsonResponse(
        { success: false, message: "Invalid social link ID." },
        400
      );
    }

    const validation = socialLinkSchema.safeParse(inputData);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.SOCIAL_LINKS);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...normalizeData(validation.data),
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return jsonResponse(
        { success: false, message: "Social link not found." },
        404
      );
    }

    const link = await collection.findOne({ _id: new ObjectId(id) });

    return jsonResponse({
      success: true,
      message: "Social link updated successfully.",
      link: serializeLink(link),
    });
  } catch (error) {
    console.error("Update social link error:", error);

    if (error.code === 11000) {
      return jsonResponse(
        {
          success: false,
          message: "This social platform already exists.",
        },
        409
      );
    }

    return jsonResponse(
      { success: false, message: "Failed to update social link." },
      500
    );
  }
}

// DELETE: Remove a social link
export async function DELETE(request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const { id } = await request.json();

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return jsonResponse(
        { success: false, message: "Invalid social link ID." },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.SOCIAL_LINKS);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return jsonResponse(
        { success: false, message: "Social link not found." },
        404
      );
    }

    return jsonResponse({
      success: true,
      message: "Social link deleted successfully.",
    });
  } catch (error) {
    console.error("Delete social link error:", error);

    return jsonResponse(
      { success: false, message: "Failed to delete social link." },
      500
    );
  }
}