import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";

/**
 * Generates a random numeric string of a specific length.
 */
export function generateNumericString(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        // Use crypto for better randomness if available, else Math.random
        result += Math.floor(Math.random() * 10).toString();
    }
    // Avoid leading zeros to prevent issues with Excel/CSV 
    if (result.startsWith('0')) {
        return '1' + result.substring(1);
    }
    return result;
}

/**
 * Retries a generation function until the value is unique in a specific table/column.
 */
export async function generateUniqueRef<
    TTable extends PgTable<any>,
    TColumn extends AnyPgColumn
>(options: {
    table: TTable;
    column: TColumn;
    length?: number;
    prefix?: string;
}): Promise<string> {
    const { table, column, length = 10, prefix = "" } = options;

    let isUnique = false;
    let finalRef = "";

    while (!isUnique) {
        const candidate = prefix + generateNumericString(length);

        // We use 'as any' on table and column inside the query 
        // because Drizzle's internal query builder types are too complex 
        // to handle generic table inputs comfortably.
        const [existing] = await db
            .select({ val: column })
            .from(table as any)
            .where(eq(column as any, candidate))
            .limit(1);

        if (!existing) {
            finalRef = candidate;
            isUnique = true;
        }
    }

    return finalRef;
}