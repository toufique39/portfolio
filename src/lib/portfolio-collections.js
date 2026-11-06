
import { getDb } from "@/lib/db";

export const COLLECTIONS = Object.freeze({
  PROFILES: "profiles",
  SETTINGS: "siteSettings",
  SKILLS: "skills",
  PROJECTS: "projects",
  ACHIEVEMENTS: "achievements",
  EXPERIENCES: "experiences",
  EDUCATIONS: "educations",
  CERTIFICATIONS: "certifications",
  SOCIAL_LINKS: "socialLinks",
  CONTACT_MESSAGES: "contactMessages",

});

export async function getCollection(collectionName) {
  const allowedCollections = Object.values(COLLECTIONS);

  if (!allowedCollections.includes(collectionName)) {
    throw new Error("Invalid portfolio collection.");
  }

  const db = await getDb();

  return db.collection(collectionName);
}
