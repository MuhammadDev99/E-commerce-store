// 1. ALL imports must be at the top
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Define your types if necessary
// import { Product } from "@/types"; 

/**
 * DATABASE FUNCTIONS
 */
export async function getProducts() {
    // Your logic to fetch products goes here
    // Example: return await db.select().from(products);
}

/**
 * AUTH LOGIC
 */
export async function requireAdminAuth() {
    // In Next.js 15/16, headers() is asynchronous
    const headerList = await headers();
    const session = await auth.api.getSession({
        headers: headerList
    });

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required.");
    }

    return session;
}

/**
 * HOF ENFORCEMENT
 */
type ActionFn<T extends any[], R> = (...args: T) => Promise<R>;

export function adminAction<T extends any[], R>(fn: ActionFn<T, R>): ActionFn<T, R> {
    return async (...args: T): Promise<R> => {
        await requireAdminAuth();

        try {
            return await fn(...args);
        } catch (error) {
            console.error(`[ADMIN_ACTION_FAILURE]:`, error);
            throw error;
        }
    };
}