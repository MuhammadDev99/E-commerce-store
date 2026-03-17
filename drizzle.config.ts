import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/auth-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:mypassword@localhost:5434/auth_db",
  },
});
