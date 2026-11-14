// Authentication helpers (login, sessions, middleware checks).

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { db, mongoClient } from "@/lib/db";

export const auth = betterAuth({
  appName: "Toufique Portfolio",

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },

  session: {
    // The login form always sends `rememberMe: true`, but in this
    // better-auth version that flag only controls the "don't remember"
    // cookie — the actual lifetime comes from this config (default: 7
    // days, which expired between uses and surfaced as 401
    // "Unauthorized access." on admin actions). Grant 30 days instead.
    expiresIn: 60 * 60 * 24 * 30, // 30 days, in seconds
    updateAge: 60 * 60 * 24, // slide the expiry forward once a day
  },

  trustedOrigins: process.env._PUBLIC_APP_URL
    ? [process.env._PUBLIC_APP_URL]
    : [],
});
