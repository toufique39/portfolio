
import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import { skillSchema } from "@/lib/portfolio-schemas";

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function serializeSkill(skill) {
  if (!skill) return null;

  const { _id, ...data } = skill;

  return {
    id: _id.toString(),
    ...data,
  };
}

function normalizeSkill(data) {
  return {
    name: data.name.trim(),
    category: data.category,
    description: data.description?.trim() || "",
    icon: data.icon?.trim() || "",
    proficiencyLabel: data.proficiencyLabel?.trim() || "",
    isFeatured: Boolean(data.isFeatured),
    isPublished: Boolean(data.isPublished),
    sortOrder: Number(data.sortOrder),
  };
}

// GET: Get all skills for admin
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const collection = await getCollection(COLLECTIONS.SKILLS);

    const skills = await collection
      .find({})
      .sort({ sortOrder: 1, name: 1 })
      .toArray();

    return jsonResponse({
      success: true,
      skills: skills.map(serializeSkill),
    });
  } catch (error) {
    console.error("Get skills error:", error);

    return jsonResponse(
      { success: false, message: "Failed to load skills." },
      500
    );
  }
}

// POST: Create a skill
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
    const validation = skillSchema.safeParse(body);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid skill data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.SKILLS);
    const now = new Date();

    const result = await collection.insertOne({
      ...normalizeSkill(validation.data),
      createdAt: now,
      updatedAt: now,
    });

    const skill = await collection.findOne({
      _id: result.insertedId,
    });

    return jsonResponse(
      {
        success: true,
        message: "Skill created successfully.",
        skill: serializeSkill(skill),
      },
      201
    );
  } catch (error) {
    console.error("Create skill error:", error);

    if (error.code === 11000) {
      return jsonResponse(
        {
          success: false,
          message: "This skill already exists in this category.",
        },
        409
      );
    }

    return jsonResponse(
      { success: false, message: "Failed to create skill." },
      500
    );
  }
}

// PUT: Update a skill
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
        { success: false, message: "Invalid skill ID." },
        400
      );
    }

    const validation = skillSchema.safeParse(inputData);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid skill data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.SKILLS);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...normalizeSkill(validation.data),
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return jsonResponse(
        { success: false, message: "Skill not found." },
        404
      );
    }

    const skill = await collection.findOne({
      _id: new ObjectId(id),
    });

    return jsonResponse({
      success: true,
      message: "Skill updated successfully.",
      skill: serializeSkill(skill),
    });
  } catch (error) {
    console.error("Update skill error:", error);

    if (error.code === 11000) {
      return jsonResponse(
        {
          success: false,
          message: "This skill already exists in this category.",
        },
        409
      );
    }

    return jsonResponse(
      { success: false, message: "Failed to update skill." },
      500
    );
  }
}

// DELETE: Delete a skill
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
        { success: false, message: "Invalid skill ID." },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.SKILLS);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return jsonResponse(
        { success: false, message: "Skill not found." },
        404
      );
    }

    return jsonResponse({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    console.error("Delete skill error:", error);

    return jsonResponse(
      { success: false, message: "Failed to delete skill." },
      500
    );
  }
}
