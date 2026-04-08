import * as dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { coupons } from "../schemas/drizzle";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("❌ DATABASE_URL is not found in .env.local");
        process.exit(1);
    }

    const pool = new Pool({ connectionString: url });
    const db = drizzle(pool);

    try {
        console.log("🧹 Cleaning old data...");
        await db.delete(coupons);

        console.log("📝 Inserting 2026 Arabic Dummy Data...");

        await db.insert(coupons).values([
            {
                name: "خصم الترحيب - أول طلب",
                code: "WELCOME2026",
                type: "percentage",
                value: 15,
                minOrder: 0,
                enabled: true,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-12-31"),
                // STATUS: ACTIVE (Within date range)
            },
            {
                name: "تصفية الشتاء الكبرى",
                code: "WINTER_FINISH",
                type: "fixed",
                value: 50,
                minOrder: 250,
                enabled: true,
                startDate: new Date("2025-12-01"),
                endDate: new Date("2026-02-15"),
                // STATUS: ACTIVE (Ends in 11 days)
            },
            {
                name: "عروض رأس السنة ٢٠٢٦",
                code: "NY2026",
                type: "percentage",
                value: 30,
                enabled: true,
                startDate: new Date("2025-12-25"),
                endDate: new Date("2026-01-05"),
                // STATUS: EXPIRED (Past date)
            },
            {
                name: "تجهيزات رمضان ٢٠٢٦",
                code: "RAMADAN_PREP",
                type: "percentage",
                value: 20,
                minOrder: 500,
                enabled: true,
                startDate: new Date("2026-03-01"), // Future date
                endDate: new Date("2026-04-01"),
                // STATUS: SCHEDULED (Start date in future)
            },
            {
                name: "عرض خاص لمشتركي النشرة",
                code: "SECRET_OFFER",
                type: "fixed",
                value: 100,
                enabled: false,
                // STATUS: DISABLED (Enabled is false)
            },
            {
                name: "كود المشاهير - حصري",
                code: "INFLUENCER_50",
                type: "percentage",
                value: 50,
                globalUsageLimit: 10,
                usedCount: 10,
                enabled: true,
                startDate: new Date("2026-02-01"),
                endDate: new Date("2026-02-28"),
                // STATUS: EXPIRED (Limit reached despite being in date range)
            },
            {
                name: "خصم نهاية الأسبوع",
                code: "WEEKEND10",
                type: "percentage",
                value: 10,
                minOrder: 100,
                enabled: true,
                startDate: new Date("2026-02-01"),
                endDate: new Date("2026-02-07"),
                // STATUS: ACTIVE (Active right now)
            }
        ]);

        console.log("✅ Seed finished successfully!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();