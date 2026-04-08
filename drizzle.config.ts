import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/schemas/drizzle/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:mypassword@localhost:5434/auth_db",
  },
});
