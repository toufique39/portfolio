
import { ObjectId } from "mongodb";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import { projectSchema } from "@/lib/portfolio-schemas";

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function serializeProject(project) {
  if (!project) return null;

  const { _id, ...data } = project;

  return {
    id: _id.toString(),
    ...data,
  };
}

// Drop keys set to `undefined` so an update never overwrites stored
// fields with null via $set (the Mongo driver serializes undefined
// as null).
function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

function normalizeProject(data) {
  return {
    ...data,
    title: data.title.trim(),
    slug: data.slug.trim().toLowerCase(),
    shortDescription: data.shortDescription.trim(),
    description: data.description?.trim() || "",
    technologies: (data.technologies || [])
      .map((item) => item.trim())
      .filter(Boolean),
    features: (data.features || [])
      .map((item) => item.trim())
      .filter(Boolean),
    challenges: data.challenges?.trim() || "",
    futurePlans: (data.futurePlans || [])
      .map((item) => item.trim())
      .filter(Boolean),
    liveUrl: data.liveUrl?.trim() || "",
    githubUrl: data.githubUrl?.trim() || "",
    coverImage: data.coverImage
      ? {
          url: data.coverImage.url.trim(),
          publicId: data.coverImage.publicId,
          alt: data.coverImage.alt?.trim() || data.title,
        }
      : undefined,
    gallery: (data.gallery || []).map((image) => ({
      url: image.url,
      publicId: image.publicId,
      alt: image.alt?.trim() || data.title,
    })),
    status: data.status,
    isPublished: Boolean(data.isPublished),
    sortOrder: Number(data.sortOrder),
  };
}

// GET: Retrieve all projects for admin
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return jsonResponse(
        { success: false, message: "Unauthorized." },
        401
      );
    }

    const collection = await getCollection(COLLECTIONS.PROJECTS);

    const projects = await collection
      .find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .toArray();

    return jsonResponse({
      success: true,
      projects: projects.map(serializeProject),
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return jsonResponse(
      { success: false, message: "Failed to load projects." },
      500
    );
  }
}

// POST: Create project
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
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid project data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.PROJECTS);
    const now = new Date();

    const result = await collection.insertOne({
      ...normalizeProject(validation.data),
      createdAt: now,
      updatedAt: now,
    });

    const project = await collection.findOne({
      _id: result.insertedId,
    });

    return jsonResponse(
      {
        success: true,
        message: "Project created successfully.",
        project: serializeProject(project),
      },
      201
    );
  } catch (error) {
    console.error("Create project error:", error);

    if (error.code === 11000) {
      return jsonResponse(
        { success: false, message: "This project slug already exists." },
        409
      );
    }

    return jsonResponse(
      { success: false, message: "Failed to create project." },
      500
    );
  }
}

// PUT: Update project
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
        { success: false, message: "Invalid project ID." },
        400
      );
    }

    const validation = projectSchema.safeParse(inputData);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid project data.",
        },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.PROJECTS);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...stripUndefined(normalizeProject(validation.data)),
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return jsonResponse(
        { success: false, message: "Project not found." },
        404
      );
    }

    const project = await collection.findOne({
      _id: new ObjectId(id),
    });

    return jsonResponse({
      success: true,
      message: "Project updated successfully.",
      project: serializeProject(project),
    });
  } catch (error) {
    console.error("Update project error:", error);

    if (error.code === 11000) {
      return jsonResponse(
        { success: false, message: "This project slug already exists." },
        409
      );
    }

    return jsonResponse(
      { success: false, message: "Failed to update project." },
      500
    );
  }
}

// DELETE: Delete project
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
        { success: false, message: "Invalid project ID." },
        400
      );
    }

    const collection = await getCollection(COLLECTIONS.PROJECTS);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return jsonResponse(
        { success: false, message: "Project not found." },
        404
      );
    }

    return jsonResponse({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return jsonResponse(
      { success: false, message: "Failed to delete project." },
      500
    );
  }
}
