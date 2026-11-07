import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  const sessions = await db.collection("session").find({}).limit(5).toArray();
  for (const session of sessions) {
    console.log("SESSION:", JSON.stringify({
      token: session.token?.slice(0, 8) + "...",
      expiresAt: session.expiresAt,
      userId: session.userId,
      ipAddress: session.ipAddress,
    }));
  }
  console.log("total sessions:", sessions.length);
} finally {
  await client.close();
}
