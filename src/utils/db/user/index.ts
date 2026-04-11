'use server'
import { db } from "@/db";
import { addresses, cartItems, coupons, products, reviews, userPreferences } from "@/schemas/drizzle";
import { auth } from "@/lib/auth";
import { Address, CartItem, CartItemWithProduct, NewAddress, Product, RatedProduct, UserPreferences } from "@/types";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { headers } from "next/headers";


export async function getProducts(): Promise<Product[]> {
    const productItems = await db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt));

    return productItems;
} export async function getRatedProductById(id: number): Promise<RatedProduct> {
    // Use getTableColumns to avoid listing every column manually. 
    // This makes the code maintainable if you add new columns to the product table later. 
    const [result] = await db
        .select({
            ...getTableColumns(products),
            // We calculate the average rating. 
            // We cast to integer (or numeric) and coalesce to 0 so we never return null.
            rate: sql<number> `cast(coalesce(avg(${reviews.rate}), 0) as decimal(10,2))`.as("rate"),
        })
        .from(products)
        // Left join is crucial: it ensures the product is returned even if it has 0 reviews.
        .leftJoin(reviews, eq(products.id, reviews.productId))
        .where(eq(products.id, id))
        .groupBy(products.id);

    if (!result) {
        throw new Error(`Product with ID ${id} not found`);
    }

    return result as RatedProduct;
}
export async function getCartItems(): Promise<CartItemWithProduct[]> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("You must be logged in to view your cart.");
    }

    const items = await db
        .select({ cartItem: cartItems, product: products })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, session.user.id))


    return items;
}
export async function getCartCount(): Promise<number> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return 0;

    const result = await db
        .select({
            total: sql<number> `sum(${cartItems.quantity})`,
        })
        .from(cartItems)
        .where(eq(cartItems.userId, session.user.id));

    return Number(result[0]?.total) || 0;
}
export async function addItemToCartDB(product: Product, quantity: number = 1) {
    // 1. Get the session
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // 2. Auth Check - Bubble up error if not logged in
    if (!session) {
        throw new Error("Authentication required: Please log in to add items to your cart.");
    }

    // 3. Perform Upsert
    // This will insert the item OR, if the userId+productId combo exists, 
    // it will increment the quantity instead.
    await db
        .insert(cartItems)
        .values({
            userId: session.user.id,
            productId: product.id,
            quantity: quantity,
        })
        .onConflictDoUpdate({
            target: [cartItems.userId, cartItems.productId], // Matches our unique constraint
            set: {
                // sql helper is used to increment the existing value in the DB
                quantity: sql`${cartItems.quantity} + ${quantity}`,
            },
        });

    return { success: true };
}
// 1. Update quantity



export async function updateCartItemQuantityDB(productId: number, quantity: number) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");
    await db.update(cartItems).set({ quantity }).where(
        and(eq(cartItems.userId, session.user.id), eq(cartItems.productId, productId))
    );
    return { success: true };
}
// 2. Remove item



export async function removeItemFromCartDB(productId: number) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");
    await db.delete(cartItems).where(
        and(eq(cartItems.userId, session.user.id), eq(cartItems.productId, productId))
    );
    return { success: true };
}
// 2. Validate a coupon code for a customer

export async function validateCouponDB(code: string, cartTotal: number) {
    const result = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, code.toUpperCase()))
        .limit(1);

    const cp = result[0];

    if (!cp) throw new Error("الكوبون غير موجود");

    // Check Dates
    const now = new Date();
    if (cp.startDate && now < cp.startDate) throw new Error("هذا الكوبون لم يبدأ بعد");
    if (cp.endDate && now > cp.endDate) throw new Error("هذا الكوبون منتهي الصلاحية");

    // Check Usage Limits
    if (cp.globalUsageLimit && cp.usedCount! >= cp.globalUsageLimit) {
        throw new Error("وصل الكوبون للحد الأقصى من الاستخدام");
    }

    // Check Min Order
    if (cartTotal < cp.minOrder!) {
        throw new Error(`الحد الأدنى لاستخدام هذا الكوبون هو ${cp.minOrder} ر.س`);
    }

    return cp; // Return coupon data to apply discount in UI
}
async function getUserId(): Promise<string> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");
    return session.user.id
}
export async function upsertAddress(address: NewAddress): Promise<Address> {
    const userId = await getUserId();

    // 1. Prepare data, ensuring userId is forced to the current user
    const insertData = {
        ...address,
        userId,
        updatedAt: new Date(),
    };

    // 2. Execute Upsert
    const [upserted] = await db
        .insert(addresses)
        .values(insertData)
        .onConflictDoUpdate({
            target: addresses.id,
            set: insertData,
            // THIS IS THE SECURITY KEY:
            // Only perform the update if the existing address row belongs to this user.
            where: eq(addresses.userId, userId),
        })
        .returning();

    // 3. Handle result
    if (!upserted) {
        throw new Error("Unauthorized: You do not own this address or update failed.");
    }

    return upserted;
}
export async function setDefaultAddressId(addressId: string): Promise<UserPreferences> {
    const userId = await getUserId();

    // We use insert().onConflictDoUpdate() so that:
    // 1. If no preference exists, it creates the row.
    // 2. If a row for this userId exists, it updates the addressId.
    const [preferences] = await db
        .insert(userPreferences)
        .values({
            userId: userId,
            defaultAddressId: addressId,
        })
        .onConflictDoUpdate({
            target: userPreferences.userId,
            set: { defaultAddressId: addressId },
        }).returning()
    if (!preferences) {
        throw new Error("Failed to set default address.");
    }
    return preferences;
}


export async function getAddresses(): Promise<Address[]> {
    const userId = await getUserId()
    const items = await db.select().from(addresses).where(eq(addresses.userId, userId))
    return items
}
export async function deleteAddressById(addressId: string): Promise<Address> {
    const userId = await getUserId();

    // Perform the deletion with a security check on userId
    const [deletedAddress] = await db
        .delete(addresses)
        .where(
            and(
                eq(addresses.id, addressId),
                eq(addresses.userId, userId)
            )
        )
        .returning();

    // Optional: Throw an error if nothing was deleted (e.g., ID doesn't exist or wrong user)
    if (!deletedAddress) {
        throw new Error("Address not found");
    }

    return deletedAddress;
}