"use server";

import { db } from "@/db";
import { cartItem, coupon, product, product as productTable } from "@/lib/auth-schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CartItem, Coupon, CouponTableKey, NewProduct, PageItems, Product } from "@/types";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";

export async function addProductDB(productData: NewProduct) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Check: Authenticated?
  if (!session) throw new Error("Unauthorized");

  // 2. Security Check: Admin Role?
  if (session.user.role !== "admin") {
    throw new Error("Permission denied: Only admins can add products.");
  }

  await db.insert(productTable).values({
    ...productData,
    userId: session.user.id,
  });

  return { success: true };
}

export async function getProducts(): Promise<Product[]> {
  const products = await db
    .select()
    .from(product)
    .orderBy(desc(product.createdAt));

  return products;
}

export async function getProductById(id: number): Promise<Product> {
  const [result] = await db.select().from(product).where(eq(product.id, id))
  if (!result) {
    throw new Error(`Product with ID ${id} not found`);
  }
  return result;
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
    .insert(cartItem)
    .values({
      userId: session.user.id,
      productId: product.id,
      quantity: quantity,
    })
    .onConflictDoUpdate({
      target: [cartItem.userId, cartItem.productId], // Matches our unique constraint
      set: {
        // sql helper is used to increment the existing value in the DB
        quantity: sql`${cartItem.quantity} + ${quantity}`,
      },
    });

  return { success: true };
}

export async function getCartItems(): Promise<CartItem[]> {
  // 1. Get the session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Auth Check - Bubble up error
  if (!session) {
    throw new Error("You must be logged in to view your cart.");
  }

  // 3. Join cartItem with productTable
  const items = await db
    .select({
      // We select the whole product plus the quantity from the cart row
      product: productTable,
      quantity: cartItem.quantity,
    })
    .from(cartItem)
    .where(eq(cartItem.userId, session.user.id))
    .innerJoin(productTable, eq(cartItem.productId, productTable.id));

  // 4. Format the result
  // Drizzle returns an array of { product: {...}, quantity: 1 }
  // We map it so it's a single flat object for your UI
  return items.map((item) => ({
    ...item.product,
    quantity: item.quantity,
  }));
}


export async function getCartCount(): Promise<number> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return 0;

  const result = await db
    .select({
      total: sql<number>`sum(${cartItem.quantity})`,
    })
    .from(cartItem)
    .where(eq(cartItem.userId, session.user.id));

  return Number(result[0]?.total) || 0;
}


// 1. Update quantity
export async function updateCartItemQuantityDB(productId: number, quantity: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  await db.update(cartItem).set({ quantity }).where(
    and(eq(cartItem.userId, session.user.id), eq(cartItem.productId, productId))
  );
  return { success: true };
}

// 2. Remove item
export async function removeItemFromCartDB(productId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  await db.delete(cartItem).where(
    and(eq(cartItem.userId, session.user.id), eq(cartItem.productId, productId))
  );
  return { success: true };
}


export async function createCouponDB(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Only admins can create coupons.");
  }

  await db.insert(coupon).values({
    name: data.name,
    code: data.code.toUpperCase(),
    type: data.type,
    value: data.value ? Number(data.value) : 0,
    minOrder: data.minOrder ? Number(data.minOrder) : 0,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    globalUsageLimit: data.globalUsageLimit ? Number(data.globalUsageLimit) : null,
    customerUsageLimit: data.customerUsageLimit ? Number(data.customerUsageLimit) : 1,
  });

  return { success: true };
}

// 2. Validate a coupon code for a customer
export async function validateCouponDB(code: string, cartTotal: number) {
  const result = await db
    .select()
    .from(coupon)
    .where(eq(coupon.code, code.toUpperCase()))
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


export async function getCouponsPaged(page: number, pageSize: number): Promise<Coupon[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  return await db
    .select()
    .from(coupon)
    .orderBy(desc(coupon.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

/**
 * The function requested by your UI
 */
export async function getCouponPagesAdmin(pageSize: number = 10): Promise<PageItems<Coupon>[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  // 1. Get total count
  const [result] = await db.select({ value: count() }).from(coupon);
  const totalItems = result.value;
  const totalPages = Math.ceil(totalItems / pageSize);

  // 2. Generate the page objects
  const pages: PageItems<Coupon>[] = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push({
      pageNumber: i,
      totalItems,
      totalPages,
      // We bind the specific page number to the fetcher function
      getData: async () => {
        'use server'; // Ensure this is treated as a server action
        return getCouponsPaged(i, pageSize);
      }
    });
  }

  return pages;
}



export async function getCouponsAdmin(options: {
  page: number;
  pageSize: number;
  query?: string;
  searchColumn?: string; // Keep this flexible or use CouponTableKey
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}) {
  // 1. Security Check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required.");
  }

  const { page, pageSize, query, searchColumn, sortColumn = "createdAt", sortDirection = "desc" } = options;

  // 2. Pagination Math
  const validPage = Math.max(1, page);
  const offset = (validPage - 1) * pageSize;

  // 3. Dynamic Filter Building (RESTORED)
  let filters = undefined;

  if (query && query.trim() !== "") {
    const q = `%${query.trim()}%`;
    const exactQuery = query.trim();

    switch (searchColumn) {
      case "code":
        filters = ilike(coupon.code, q);
        break;

      case "name":
        filters = ilike(coupon.name, q);
        break;

      case "type":
        // Map Arabic search terms to Database Enum values
        if ("قيمة ثابتة".includes(exactQuery)) filters = eq(coupon.type, "fixed");
        else if ("نسبة مئوية".includes(exactQuery)) filters = eq(coupon.type, "percentage");
        else if ("شحن مجاني".includes(exactQuery)) filters = eq(coupon.type, "free_shipping");
        // Fallback to searching the raw enum string
        else filters = ilike(coupon.type, q);
        break;

      case "value":
        // Numeric columns must be cast to TEXT for ILIKE to work in Postgres
        filters = sql`CAST(${coupon.value} AS TEXT) ILIKE ${q}`;
        break;

      case "usedCount":
        filters = sql`CAST(${coupon.usedCount} AS TEXT) ILIKE ${q}`;
        break;

      case "status":
        // Replicate "Active" logic: Not expired AND not reached usage limit
        const isExpired = sql`(${coupon.endDate} IS NOT NULL AND ${coupon.endDate} < NOW())`;
        const isFull = sql`(${coupon.globalUsageLimit} IS NOT NULL AND ${coupon.usedCount} >= ${coupon.globalUsageLimit})`;

        if ("مفعل".includes(exactQuery)) {
          filters = sql`NOT (${isExpired} OR ${isFull})`;
        } else if ("معطل".includes(exactQuery)) {
          filters = sql`(${isExpired} OR ${isFull})`;
        }
        break;

      default:
        // Default behavior: Search code OR name
        filters = or(ilike(coupon.code, q), ilike(coupon.name, q));
    }
  }

  // 4. Dynamic Sorting Block
  let orderByCol;
  switch (sortColumn) {
    case "code": orderByCol = coupon.code; break;
    case "name": orderByCol = coupon.name; break;
    case "type": orderByCol = coupon.type; break;
    case "value": orderByCol = coupon.value; break;
    case "usedCount": orderByCol = coupon.usedCount; break;
    case "status":
      // Sorts statuses visually separating them using their database boolean expression
      orderByCol = sql`(${coupon.endDate} IS NOT NULL AND ${coupon.endDate} < NOW()) OR (${coupon.globalUsageLimit} IS NOT NULL AND ${coupon.usedCount} >= ${coupon.globalUsageLimit})`;
      break;
    case "createdAt":
    default:
      orderByCol = coupon.createdAt;
      break;
  }

  const orderFn = sortDirection === "asc" ? asc : desc;

  // 5. Database Queries
  const [data, [countResult]] = await Promise.all([
    // Fetch the actual rows
    db
      .select()
      .from(coupon)
      .where(filters)
      .limit(pageSize)
      .offset(offset)
      .orderBy(orderFn(orderByCol)), // Apply Sorting

    // Fetch total count for pagination buttons
    db
      .select({ value: count() })
      .from(coupon)
      .where(filters), // Apply Filters
  ]);

  return {
    items: data,
    totalItems: countResult.value,
    totalPages: Math.ceil(countResult.value / pageSize),
  };
}