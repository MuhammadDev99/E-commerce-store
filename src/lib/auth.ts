import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/schemas/drizzle";
import { emailOTP } from "better-auth/plugins";

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
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Determine email content based on type
        let subject = "Verify Your Email";
        let title = "MeHappy Verification";
        let message = "Your verification code is:";

        if (type === "forget-password") {
          subject = "Reset Your Password";
          title = "Password Reset Request";
          message = "Use the following code to reset your password:";
        } else if (type === "sign-in") {
          subject = "Login Code";
          title = "MeHappy Login";
          message = "Your login code is:";
        }

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
              subject: subject,
              htmlContent: `
              <div style="font-family: sans-serif; text-align: center; direction: ltr;">
                <h2 style="color: #333;">${title}</h2>
                <p style="color: #666;">${message}</p>
                <h1 style="color: #4A90E2; letter-spacing: 5px; font-size: 32px; background: #f4f4f4; padding: 10px; display: inline-block;">${otp}</h1>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">This code will expire shortly.</p>
              </div>
            `,
            }),
          });

          if (!res.ok) {
            const errorData = await res.text();
            // Bubbling up the error to the client
            throw new Error(`Failed to send email: ${res.status} - ${errorData}`);
          }

          console.log(`✅ OTP (${type}) sent successfully to`, email);
        } catch (error) {
          console.error("❌ Email Service Error:", error);
          // Re-throw the error so better-auth knows the process failed
          throw error;
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
        required: false
      },
      dateOfBirth: {
        type: "string",
        required: false
      },
      firstName: {
        type: "string",
        required: true
      },
      lastName: {
        type: "string",
        required: true
      },
      nationality: {
        type: "string",
        required: false
      },
      sex: {
        type: "string",
        required: false
      },
    },
  },
});