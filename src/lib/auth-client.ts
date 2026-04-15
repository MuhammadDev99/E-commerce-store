import { createAuthClient } from "better-auth/react";
// Change emailOTP to emailOTPClient
import { inferAdditionalFields, emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "./auth";
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    emailOTPClient()
  ],
  user: {
    additionalFields: {
      phoneNumber: { type: "string" },
      dateOfBirth: { type: "string" },
      firstName: { type: "string" }, // Add this
      lastName: { type: "string" },  // Add this
    },
  },
});