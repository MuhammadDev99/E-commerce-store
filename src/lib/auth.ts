import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/schemas/drizzle";
import { emailOTP } from "better-auth/plugins"; // 1. Import plugin

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  // 2. Add the Plugin Configuration
  // Inside auth (2).ts
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": process.env.BREVO_API_KEY!,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              sender: { name: "MeHappy", email: "noreply@mehappy.site" },
              to: [{ email }],
              subject: type === "email-verification" ? "Verify Your Email" : "Login Code",
              htmlContent: `
              <div style="font-family: sans-serif; text-align: center;">
                <h2>MeHappy Verification</h2>
                <p>Your verification code is:</p>
                <h1 style="color: #4A90E2; letter-spacing: 5px;">${otp}</h1>
              </div>
            `,
            }),
          });

          // ADD THIS CHECK:
          if (!res.ok) {
            const errorData = await res.text();
            console.error("❌ Brevo API Error:", res.status, errorData);
          } else {
            console.log("✅ OTP Email sent successfully to", email);
          }
        } catch (error) {
          console.error("❌ Failed to reach Brevo API:", error);
        }
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user"
      },
      phoneNumber: {
        type: "string",
        required: false // Mark as optional
      },
      dateOfBirth: {
        type: "string",
        required: false // Mark as optional
      },
      firstName: {
        type: "string",
        required: true // Required for your form
      },
      lastName: {
        type: "string",
        required: true // Required for your form
      },
      nationality: {
        type: "string",
        required: false // Required for your form
      },
      sex: {
        type: "string",
        required: false // Set to true if you want to force it during signup
      },
    },
  },
});