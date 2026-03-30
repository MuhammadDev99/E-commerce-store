import { count, SQL } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// 1. Reusable Admin Security Check
export async function requireAdminAuth() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required.");
    }
    return session;
}

// 2. Reusable Paginated Fetcher for ANY table
// By enforcing `{ $inferSelect: any }`, we know it's a Drizzle table!
export async function getPaginatedTableData<TTable extends { $inferSelect: any }>(
    table: TTable,
    options: {
        page: number;
        pageSize: number;
        filters?: SQL<unknown>;
        orderBy: SQL<unknown>;
    }
) {
    const validPage = Math.max(1, options.page);
    const offset = (validPage - 1) * options.pageSize;

    const [data, [countResult]] = await Promise.all([
        // Fetch the actual rows
        // We cast to 'any' to stop Drizzle from panicking over the generic table
        db
            .select()
            .from(table as any)
            .where(options.filters)
            .limit(options.pageSize)
            .offset(offset)
            .orderBy(options.orderBy),

        // Fetch total count for pagination buttons
        db
            .select({ value: count() })
            .from(table as any)
            .where(options.filters),
    ]);

    return {
        // We elegantly map the response back to the specific Table's Select Model!
        items: data as TTable["$inferSelect"][],
        totalItems: countResult.value,
        totalPages: Math.ceil(countResult.value / options.pageSize),
    };
}