import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "@/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:mypassword@localhost:5434/auth_db",
  },
});
