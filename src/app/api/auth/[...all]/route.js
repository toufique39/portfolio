
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// NOTE: `export const runtime` is not supported when `cacheComponents` is
// enabled in next.config.mjs — routes always use the default Node.js runtime.

export const { GET, POST } = toNextJsHandler(auth);
