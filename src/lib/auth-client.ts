import { createAuthClient } from "better-auth/react";
// 1. Import the plugin
import { inferAdditionalFields } from "better-auth/client/plugins";
// 2. Import your server auth instance as a type
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  // 3. Add the plugin and pass your auth type as a generic
  plugins: [inferAdditionalFields<typeof auth>()],
  // You can keep this here for runtime, but the plugin handles the types
  user: {
    additionalFields: {
      auth: { type: "string" },
      phoneNumber: { type: "string" },
      dateOfBirth: { type: "string" },
    },
  },
});
