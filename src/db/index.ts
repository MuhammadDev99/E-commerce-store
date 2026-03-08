import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../lib/auth-schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Points to port 5433 in .env
});

export const db = drizzle(pool, { schema });
