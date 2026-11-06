
import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import { experienceSchema } from "@/lib/portfolio-schemas";

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function serializeExperience(experience) {
  if (!experience) return null;

  const { _id, ...data } = experience;

  return {
    id: _id.toString(),
    ...data,
  };
}

function normalizeExperience(data) {
  return {
    company: data.company.trim(),
    role: data.role.trim(),
    employmentType: data.employmentType.trim(),
    location: data.location?.trim() || "",
    startDate: data.startDate,
    endDate: data.isCurrent ? "" : data.endDate || "",
    isCurrent: Boolean(data.isCurrent),
    description: data.description?.trim() || "",
    responsibilities: (data.responsibilities || [])
      .map((item) => item.trim())
      .filter(Boolean),
    technologies: (data.technologies || [])
      .map((item) => item.trim())
      .filter(Boolean),
    isPublished: Boolean(data.isPublished),
    sortOrder: Number(data.sortOrder),
  };
}

// GET: Retrieve all experience records for admin
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const collection = await getCollection(COLLECTIONS.EXPERIENCES);

    const experiences = await collection
      .find({})
      .sort({ sortOrder: 1, startDate: -1 })
      .toArray();

    return jsonResponse({
      success: true,
      experiences: experiences.map(serializeExperience),
    });
  } catch (error) {
    console.error("Get experiences error:", error);

    return jsonResponse(
      { success: false, message: "Failed to load experiences." },
      500
    );
  }
}

// POST: Create experience
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
    const validation = experienceSchema.safeParse(body);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Invalid experience data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.EXPERIENCES);
    const now = new Date();

    const result = await collection.insertOne({
      ...normalizeExperience(validation.data),
      createdAt: now,
      updatedAt: now,
    });

    const experience = await collection.findOne({
      _id: result.insertedId,
    });

    return jsonResponse(
      {
        success: true,
        message: "Experience created successfully.",
        experience: serializeExperience(experience),
      },
      201
    );
  } catch (error) {
    console.error("Create experience error:", error);

    return jsonResponse(
      { success: false, message: "Failed to create experience." },
      500
    );
  }
}

// PUT: Update experience
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
        { success: false, message: "Invalid experience ID." },
        400
      );
    }

    const validation = experienceSchema.safeParse(inputData);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Invalid experience data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.EXPERIENCES);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...normalizeExperience(validation.data),
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return jsonResponse(
        { success: false, message: "Experience not found." },
        404
      );
    }

    const experience = await collection.findOne({
      _id: new ObjectId(id),
    });

    return jsonResponse({
      success: true,
      message: "Experience updated successfully.",
      experience: serializeExperience(experience),
    });
  } catch (error) {
    console.error("Update experience error:", error);

    return jsonResponse(
      { success: false, message: "Failed to update experience." },
      500
    );
  }
}

// DELETE: Remove experience
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
        { success: false, message: "Invalid experience ID." },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.EXPERIENCES);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return jsonResponse(
        { success: false, message: "Experience not found." },
        404
      );
    }

    return jsonResponse({
      success: true,
      message: "Experience deleted successfully.",
    });
  } catch (error) {
    console.error("Delete experience error:", error);

    return jsonResponse(
      { success: false, message: "Failed to delete experience." },
      500
    );
  }
}
