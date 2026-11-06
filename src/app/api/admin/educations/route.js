import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import { educationSchema } from "@/lib/portfolio-schemas";

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function serializeEducation(education) {
  if (!education) return null;

  const { _id, ...data } = education;

  return {
    id: _id.toString(),
    ...data,
  };
}

function normalizeEducation(data) {
  return {
    institution: data.institution.trim(),
    degree: data.degree.trim(),
    field: data.field.trim(),
    startDate: data.startDate,
    endDate: data.endDate || "",
    status: data.status,
    description: data.description?.trim() || "",
    isPublished: Boolean(data.isPublished),
    sortOrder: Number(data.sortOrder),
  };
}

// GET: All education records for admin
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const collection = await getCollection(COLLECTIONS.EDUCATIONS);

    const records = await collection
      .find({})
      .sort({ sortOrder: 1, startDate: -1 })
      .toArray();

    return jsonResponse({
      success: true,
      educations: records.map(serializeEducation),
    });
  } catch (error) {
    console.error("Get education error:", error);

    return jsonResponse(
      { success: false, message: "Failed to load education records." },
      500
    );
  }
}

// POST: Create education record
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
    const validation = educationSchema.safeParse(body);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid education data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.EDUCATIONS);
    const now = new Date();

    const result = await collection.insertOne({
      ...normalizeEducation(validation.data),
      createdAt: now,
      updatedAt: now,
    });

    const education = await collection.findOne({
      _id: result.insertedId,
    });

    return jsonResponse(
      {
        success: true,
        message: "Education record created successfully.",
        education: serializeEducation(education),
      },
      201
    );
  } catch (error) {
    console.error("Create education error:", error);

    return jsonResponse(
      { success: false, message: "Failed to create education record." },
      500
    );
  }
}

// PUT: Update education record
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
        { success: false, message: "Invalid education ID." },
        400
      );
    }

    const validation = educationSchema.safeParse(inputData);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid education data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.EDUCATIONS);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...normalizeEducation(validation.data),
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return jsonResponse(
        { success: false, message: "Education record not found." },
        404
      );
    }

    const education = await collection.findOne({
      _id: new ObjectId(id),
    });

    return jsonResponse({
      success: true,
      message: "Education record updated successfully.",
      education: serializeEducation(education),
    });
  } catch (error) {
    console.error("Update education error:", error);

    return jsonResponse(
      { success: false, message: "Failed to update education record." },
      500
    );
  }
}

// DELETE: Remove education record
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
        { success: false, message: "Invalid education ID." },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.EDUCATIONS);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return jsonResponse(
        { success: false, message: "Education record not found." },
        404
      );
    }

    return jsonResponse({
      success: true,
      message: "Education record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete education error:", error);

    return jsonResponse(
      { success: false, message: "Failed to delete education record." },
      500
    );
  }
}