"use server";
import { orderItems, orders, user } from "@/lib/auth-schema";
import { db } from "@/db";
import { cartItem, coupon, product, product as productTable } from "@/lib/auth-schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CartItem, Coupon, CouponsTableConfig, CustomersTableConfig, NewProduct, Order, OrdersTableConfig, PageDataOptions, PageDataResponse, PageItems, Product, ProductsAnalyticsTableConfig } from "@/types";
import { and, asc, count, desc, eq, getTableColumns, ilike, or, SQL, sql } from "drizzle-orm";
import { getPaginatedTableData, requireAdminAuth } from "./admin-helpers";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { User } from "better-auth";

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



export async function getCoupons(options: PageDataOptions): Promise<PageDataResponse<CouponsTableConfig['row']>> {
  // 1. Use abstracted security check
  await requireAdminAuth();

  const query = options['q']
  const sortColumn = options['sortCol']
  const sortDirection = options['sortDir']
  const searchColumn = options['searchCol']
  const page = Number(options['page'] ?? '0')
  const pageSize = Number(options['pageSize'] ?? '10')
  const validPage = Math.max(1, page);
  const offset = (validPage - 1) * pageSize;

  // 2. Table-Specific Filter Logic
  let filters: SQL<unknown> | undefined = undefined;

  if (query && query.trim() !== "") {
    const q = `%${query.trim()}%`;
    const exactQuery = query.trim();

    switch (searchColumn) {
      case "code": filters = ilike(coupon.code, q); break;
      case "name": filters = ilike(coupon.name, q); break;
      case "type":
        if ("قيمة ثابتة".includes(exactQuery)) filters = eq(coupon.type, "fixed");
        else if ("نسبة مئوية".includes(exactQuery)) filters = eq(coupon.type, "percentage");
        else if ("شحن مجاني".includes(exactQuery)) filters = eq(coupon.type, "free_shipping");
        else filters = ilike(coupon.type, q);
        break;
      case "value":
        filters = sql`CAST(${coupon.value} AS TEXT) ILIKE ${q}`; break;
      case "usedCount":
        filters = sql`CAST(${coupon.usedCount} AS TEXT) ILIKE ${q}`; break;
      case "status":
        const isExpired = sql`(${coupon.endDate} IS NOT NULL AND ${coupon.endDate} < NOW())`;
        const isFull = sql`(${coupon.globalUsageLimit} IS NOT NULL AND ${coupon.usedCount} >= ${coupon.globalUsageLimit})`;
        if ("مفعل".includes(exactQuery)) filters = sql`NOT (${isExpired} OR ${isFull})`;
        else if ("معطل".includes(exactQuery)) filters = sql`(${isExpired} OR ${isFull})`;
        break;
      default:
        filters = or(ilike(coupon.code, q), ilike(coupon.name, q));
    }
  }

  // 3. Table-Specific Sorting Logic
  let orderByCol;
  switch (sortColumn) {
    case "code": orderByCol = coupon.code; break;
    case "name": orderByCol = coupon.name; break;
    case "type": orderByCol = coupon.type; break;
    case "value": orderByCol = coupon.value; break;
    case "usedCount": orderByCol = coupon.usedCount; break;
    case "status":
      orderByCol = sql`(${coupon.endDate} IS NOT NULL AND ${coupon.endDate} < NOW()) OR (${coupon.globalUsageLimit} IS NOT NULL AND ${coupon.usedCount} >= ${coupon.globalUsageLimit})`;
      break;
    case "createdAt":
    default:
      orderByCol = coupon.createdAt; break;
  }

  const orderFn = sortDirection === "asc" ? asc : desc;

  // 4. Use abstracted Paginated Query runner
  return await getPaginatedTableData(coupon, {
    page,
    pageSize,
    filters,
    orderBy: orderFn(orderByCol),
  });
}


// export async function getOrdersPageData(options: PageDataOptions<OrdersTableConfig['keys']>): Promise<PageDataResponse<OrdersTableConfig['row']>> {
//   const {
//     page,
//     pageSize,
//     query,
//     searchColumn,
//     sortColumn = "createdAt",
//     sortDirection = "desc"
//   } = options;

//   const validPage = Math.max(1, page);
//   const offset = (validPage - 1) * pageSize;

//   // 2. Build Filters
//   // We allow searching by Order Reference OR Customer Name OR Customer Email
//   let filters = undefined;
//   if (query && query.trim() !== "") {
//     const q = `%${query.trim()}%`;
//     filters = or(
//       ilike(orders.orderReference, q),
//       ilike(user.name, q),
//       ilike(user.email, q)
//     );
//   }

//   // 3. Handle Dynamic Sorting (Fixed with AnyPgColumn)
//   let orderByCol: AnyPgColumn;
//   switch (sortColumn) {
//     case "totalAmount":
//       orderByCol = orders.totalAmount;
//       break;
//     case "status":
//       orderByCol = orders.status;
//       break;
//     case "orderReference":
//       orderByCol = orders.orderReference;
//       break;
//     case "id":
//       orderByCol = orders.id;
//       break;
//     case "createdAt":
//     default:
//       orderByCol = orders.createdAt;
//       break;
//   }
//   const orderFn = sortDirection === "asc" ? asc : desc;

//   // 4. Execution
//   // We run the data fetch and the count in parallel for performance
//   const [data, [countResult]] = await Promise.all([
//     db
//       .select({
//         order: orders,
//         customer: user, // Selects all user columns automatically
//       })
//       .from(orders)
//       .innerJoin(user, eq(orders.userId, user.id))
//       .where(filters)
//       .limit(pageSize)
//       .offset(offset)
//       .orderBy(orderFn(orderByCol)),

//     db
//       .select({ value: sql<number>`count(*)` })
//       .from(orders)
//       // We join here too so the count reflects the search filters (like user name)
//       .innerJoin(user, eq(orders.userId, user.id))
//       .where(filters),
//   ]);

//   return {
//     items: data as OrdersTableConfig['row'][],
//     totalItems: Number(countResult.value),
//     totalPages: Math.ceil(Number(countResult.value) / pageSize),
//   };
// }

export async function getOrdersPageData(options: PageDataOptions): Promise<PageDataResponse<OrdersTableConfig['row']>> {

  const query = options['q']
  const sortColumn = options['sortCol']
  const sortDirection = options['sortDir']
  const searchColumn = options['searchCol'] as OrdersTableConfig['keys']
  const page = Number(options['page'])
  const pageSize = Number(options['pageSize'])
  const validPage = Math.max(1, page);
  const offset = (validPage - 1) * pageSize;

  // 2. Build Filters
  let filters = undefined;
  if (searchColumn && query && query.trim() !== "") {
    const q = `%${query.trim()}%`;
    if (searchColumn === 'customer') {
      filters = or(ilike(user.name, q), ilike(user.email, q))
    }
    else if (Object.keys(orders).includes(searchColumn)) {
      filters = ilike(orders[searchColumn], q)
    }
  }

  // 3. Handle Dynamic Sorting (Fixed with AnyPgColumn)
  let orderByCol: AnyPgColumn;
  switch (sortColumn) {
    case "totalAmount":
      orderByCol = orders.totalAmount;
      break;
    case "status":
      orderByCol = orders.status;
      break;
    case "orderReference":
      orderByCol = orders.orderReference;
      break;
    case "id":
      orderByCol = orders.id;
      break;
    case "createdAt":
    default:
      orderByCol = orders.createdAt;
      break;
  }
  const orderFn = sortDirection === "asc" ? asc : desc;

  // 4. Execution
  // We run the data fetch and the count in parallel for performance
  const [data, [countResult]] = await Promise.all([
    db
      .select({
        order: orders,
        customer: user, // Selects all user columns automatically
      })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .where(filters)
      .limit(pageSize)
      .offset(offset)
      .orderBy(orderFn(orderByCol)),

    db
      .select({ value: sql<number>`count(*)` })
      .from(orders)
      // We join here too so the count reflects the search filters (like user name)
      .innerJoin(user, eq(orders.userId, user.id))
      .where(filters),
  ]);

  return {
    items: data as OrdersTableConfig['row'][],
    totalItems: Number(countResult.value),
    totalPages: Math.ceil(Number(countResult.value) / pageSize),
  };
}


export async function getCustomersPageData(
  options: PageDataOptions
): Promise<PageDataResponse<CustomersTableConfig['row']>> {
  const query = options['q'];
  const sortColumn = options['sortCol'];
  const sortDirection = options['sortDir'] || "desc";
  const searchColumn = options['searchCol'];
  const page = Math.max(1, Number(options['page'] || 1));
  const pageSize = Number(options['pageSize'] || 10);
  const offset = (page - 1) * pageSize;

  // 1. Get all base columns from the user table
  const userColumns = getTableColumns(user);

  // 2. Define our calculated aggregate columns
  // We use cast to integer because count/sum often return strings in PG drivers
  const totalOrders = sql<number>`cast(count(${orders.id}) as integer)`.as("totalOrders");
  const totalSpent = sql<number>`cast(coalesce(sum(${orders.totalAmount}), 0) as integer)`.as("totalSpent");

  // 3. Build Search Filters
  let filters = undefined;
  if (query && searchColumn) {
    const q = `%${query}%`
    if (searchColumn in user) {
      filters = ilike(user[searchColumn as keyof User], q);
    }
    if (searchColumn === 'contact') {
      filters = or(ilike(user.email, q), ilike(user.name, q), ilike(user.phoneNumber, q));
    }
  }

  // 4. Build Sorting Logic
  const orderFn = sortDirection === "asc" ? asc : desc;
  let orderByExpression = desc(user.createdAt);;

  if (sortColumn === "totalOrders") {
    orderByExpression = orderFn(totalOrders);
  } else if (sortColumn === "totalSpent") {
    orderByExpression = orderFn(totalSpent);
  } else if (sortColumn && sortColumn in user) {
    orderByExpression = orderFn(user[sortColumn as keyof User]);
  }

  // 5. Execute Query
  const [data, countResult] = await Promise.all([
    db
      .select({
        ...userColumns,
        totalOrders,
        totalSpent,
      })
      .from(user)
      .leftJoin(orders, eq(user.id, orders.userId))
      .where(filters)
      .groupBy(user.id)
      .orderBy(orderByExpression)
      .limit(pageSize)
      .offset(offset),

    db
      .select({ count: sql<number>`cast(count(distinct ${user.id}) as integer)` })
      .from(user)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count ?? 0;

  return {
    // Now 'data' is an array of flat objects matching the CustomersTableConfig['row'] type
    items: data as CustomersTableConfig['row'][],
    totalItems: totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}



export async function getProductsAnalyticsAdmin(
  options: PageDataOptions
): Promise<PageDataResponse<ProductsAnalyticsTableConfig['row']>> {
  // 1. Security Check
  await requireAdminAuth();

  // 2. Parse Options
  const query = options['q'];
  const sortColumn = options['sortCol'];
  const sortDirection = options['sortDir'] || "desc";
  const searchColumn = options['searchCol'];
  const page = Math.max(1, Number(options['page'] || 1));
  const pageSize = Number(options['pageSize'] || 10);
  const offset = (page - 1) * pageSize;

  // 3. Define Columns and Aggregates
  const productColumns = getTableColumns(productTable);

  // Calculate total units sold
  const totalOrdered = sql<number>`cast(coalesce(sum(${orderItems.quantity}), 0) as integer)`.as("totalOrdered");

  // Calculate total revenue (quantity * price at the time of purchase)
  const totalRevenue = sql<number>`cast(coalesce(sum(${orderItems.quantity} * ${orderItems.priceAtPurchase}), 0) as integer)`.as("totalRevenue");

  // 4. Build Filters
  let filters: SQL | undefined = undefined;
  if (query && query.trim() !== "") {
    const q = `%${query.trim()}%`;

    // If a specific search column is provided and exists in product table
    if (searchColumn && searchColumn in productTable) {
      filters = ilike(productTable[searchColumn as keyof Product], q);
    } else {
      // Default search: Name or Description
      filters = or(
        ilike(productTable.name, q),
        ilike(productTable.description, q)
      );
    }
  }

  // 5. Build Sorting Logic
  const orderFn = sortDirection === "asc" ? asc : desc;
  let orderByExpression: SQL;

  // Handle calculated columns vs table columns
  if (sortColumn === "totalOrdered") {
    orderByExpression = orderFn(totalOrdered);
  } else if (sortColumn === "totalRevenue") {
    orderByExpression = orderFn(totalRevenue);
  } else if (sortColumn && sortColumn in productTable) {
    orderByExpression = orderFn(productTable[sortColumn as keyof Product]);
  } else {
    orderByExpression = desc(productTable.createdAt);
  }

  // 6. Execute Queries in Parallel
  const [data, countResult] = await Promise.all([
    db
      .select({
        ...productColumns,
        totalOrdered,
        totalRevenue,
      })
      .from(productTable)
      // Left join orderItems so products with 0 sales still show up
      .leftJoin(orderItems, eq(productTable.id, orderItems.productId))
      .where(filters)
      .groupBy(productTable.id)
      .orderBy(orderByExpression)
      .limit(pageSize)
      .offset(offset),

    db
      .select({ count: count() })
      .from(productTable)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count ?? 0;

  return {
    items: data as ProductsAnalyticsTableConfig['row'][],
    totalItems: totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}