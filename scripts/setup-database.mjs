
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error("MONGODB_URI and MONGODB_DB are required.");
}

const client = new MongoClient(uri);

const indexDefinitions = [
  {
    collection: "skills",
    indexes: [
      {
        keys: { name: 1, category: 1 },
        options: { unique: true, name: "unique_skill_category" },
      },
      {
        keys: { category: 1, sortOrder: 1 },
        options: { name: "skills_category_order" },
      },
    ],
  },
  {
    collection: "projects",
    indexes: [
      {
        keys: { slug: 1 },
        options: { unique: true, name: "unique_project_slug" },
      },
      {
        keys: { isPublished: 1, sortOrder: 1 },
        options: { name: "projects_publish_order" },
      },
    ],
  },
  {
    collection: "achievements",
    indexes: [
      {
        keys: { isPublished: 1, sortOrder: 1 },
        options: { name: "achievements_publish_order" },
      },
    ],
  },
  {
    collection: "experiences",
    indexes: [
      {
        keys: { isPublished: 1, sortOrder: 1 },
        options: { name: "experiences_publish_order" },
      },
    ],
  },
  {
    collection: "educations",
    indexes: [
      {
        keys: { isPublished: 1, sortOrder: 1 },
        options: { name: "educations_publish_order" },
      },
    ],
  },
  {
    collection: "certifications",
    indexes: [
      {
        keys: { isPublished: 1, sortOrder: 1 },
        options: { name: "certifications_publish_order" },
      },
    ],
  },
  {
    collection: "socialLinks",
    indexes: [
      {
        keys: { platform: 1 },
        options: { unique: true, name: "unique_social_platform" },
      },
    ],
  },
];

try {
  await client.connect();

  const db = client.db(dbName);

  for (const definition of indexDefinitions) {
    const collection = db.collection(definition.collection);

    for (const index of definition.indexes) {
      await collection.createIndex(index.keys, index.options);
    }

    console.log(`Indexes created: ${definition.collection}`);
  }

  const now = new Date();

  await db.collection("siteSettings").updateOne(
    { _id: "main" },
    {
      $setOnInsert: {
        navigation: [
          { label: "Home", href: "#home", isVisible: true, sortOrder: 0 },
          { label: "About", href: "#about", isVisible: true, sortOrder: 1 },
          { label: "Skills", href: "#skills", isVisible: true, sortOrder: 2 },
          { label: "Education", href: "#education", isVisible: true, sortOrder: 3 },
          { label: "Experience", href: "#experience", isVisible: true, sortOrder: 4 },
          { label: "Projects", href: "#projects", isVisible: true, sortOrder: 5 },
          { label: "Contact", href: "#contact", isVisible: true, sortOrder: 6 },
        ],
        sections: [
          { key: "home", label: "Home", isVisible: true, sortOrder: 0 },
          { key: "about", label: "About", isVisible: true, sortOrder: 1 },
          { key: "skills", label: "Skills", isVisible: true, sortOrder: 2 },
          { key: "education", label: "Education", isVisible: true, sortOrder: 3 },
          { key: "experience", label: "Experience", isVisible: true, sortOrder: 4 },
          { key: "projects", label: "Projects", isVisible: true, sortOrder: 5 },
          { key: "contact", label: "Contact", isVisible: true, sortOrder: 6 },
        ],
        theme: {
          mode: "dark",
          accentColor: "#2563eb",
        },
        seo: {
          title: "Toufique Ahmed | Portfolio",
          description: "",
          keywords: [],
        },
        createdAt: now,
      },
      $set: {
        updatedAt: now,
      },
    },
    { upsert: true }
  );

  console.log("Site settings initialized.");
  console.log("Portfolio database setup completed.");
} catch (error) {
  console.error("Database setup failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
