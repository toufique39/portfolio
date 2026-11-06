
import { MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const {
  MONGODB_URI,
  MONGODB_DB,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  ADMIN_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

const required = {
  MONGODB_URI,
  MONGODB_DB,
  BETTER_AUTH_SECRET,
  ADMIN_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
};

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (ADMIN_PASSWORD.length < 12) {
  throw new Error("Admin password must be at least 12 characters.");
}

const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});

try {
  await client.connect();

  const db = client.db(MONGODB_DB);

  // Temporary provisioning instance.
  // This file is never exposed as a public API route.
  const provisioningAuth = betterAuth({
    appName: "Toufique Portfolio Admin Provisioning",
    baseURL: BETTER_AUTH_URL || "http://localhost:10000",
    secret: BETTER_AUTH_SECRET,

    database: mongodbAdapter(db, {
      client,
    }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      autoSignIn: false,
    },
  });

  const result = await provisioningAuth.api.signUpEmail({
    body: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.trim().toLowerCase(),
      password: ADMIN_PASSWORD,
    },
  });

  if (!result?.user?.id) {
    throw new Error("Admin account creation did not return a user ID.");
  }

  console.log("\nAdmin account created successfully.");
  console.log("Name:", result.user.name);
  console.log("Email:", result.user.email);
  console.log("Admin User ID:", result.user.id);
  console.log("\nSave the User ID for the next step.");
} catch (error) {
  console.error("\nAdmin provisioning failed:");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
