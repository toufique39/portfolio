
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
  const collection = await getCollection(COLLECTIONS.PROFILES);

  await collection.updateOne(
    { _id: "main" },
    {
      $unset: { profileImage: "" },
      $set: { updatedAt: new Date() },
    }
  );

  return getProfile();
}
