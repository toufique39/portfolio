
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

if (!dbName) {
  throw new Error("Please define MONGODB_DB in .env.local");
}

const globalForMongo = globalThis;

export const mongoClient =
  globalForMongo._mongoClient ??
  new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

// Reuse the same MongoDB client during development
globalForMongo._mongoClient = mongoClient;

// Database handle can be created before connecting
export const db = mongoClient.db(dbName);

export async function getMongoClient() {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = mongoClient.connect().catch((error) => {
      globalForMongo._mongoClientPromise = undefined;
      throw error;
    });
  }

  await globalForMongo._mongoClientPromise;
  return mongoClient;
}

export async function getDb() {
  await getMongoClient();
  return db;
}
