
import { getCollection, COLLECTIONS } from "@/lib/portfolio-collections";

export async function getProfile() {
  const collection = await getCollection(COLLECTIONS.PROFILES);

  return collection.findOne({ _id: "main" });
}

export async function upsertProfile(data) {
  const collection = await getCollection(COLLECTIONS.PROFILES);
  const now = new Date();

  await collection.updateOne(
    { _id: "main" },
    {
      $set: {
        ...data,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );

  return getProfile();
}

export async function deleteProfileImage() {
  return unsetProfileFields(["profileImage"]);
}

// Remove one or more optional profile fields (e.g. `profileImage`,
// `resumeUrl`) so the stored document no longer references them.
export async function unsetProfileFields(fields) {
  const collection = await getCollection(COLLECTIONS.PROFILES);

  const unset = Object.fromEntries(
    fields.map((field) => [field, ""])
  );

  await collection.updateOne(
    { _id: "main" },
    {
      $unset: unset,
      $set: { updatedAt: new Date() },
    }
  );

  return getProfile();
}
