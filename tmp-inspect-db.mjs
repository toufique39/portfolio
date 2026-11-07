import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const db = client.db(dbName);

  const collections = await db.listCollections().toArray();
  console.log("COLLECTIONS:", collections.map((c) => c.name).join(", "));

  const user = await db.collection("user").findOne({});
  if (user) {
    console.log("USER:", JSON.stringify({ _id: String(user._id), id: user.id, email: user.email, name: user.name }));
  } else {
    console.log("USER: none");
  }

  const accounts = await db.collection("account").find({}).toArray();
  for (const account of accounts) {
    console.log("ACCOUNT:", JSON.stringify({
      _id: String(account._id),
      userId: account.userId,
      providerId: account.providerId,
      hasPassword: Boolean(account.password),
    }));
  }

  const profile = await db.collection("profiles").findOne({ _id: "main" });
  if (profile) {
    console.log("PROFILE:", JSON.stringify({
      name: profile.name,
      email: profile.email,
      profileImage: profile.profileImage,
      resumeUrl: profile.resumeUrl,
      updatedAt: profile.updatedAt,
    }, null, 2));
  } else {
    console.log("PROFILE: none");
  }
} finally {
  await client.close();
}
