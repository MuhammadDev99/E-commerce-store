"use server";
import { orderItems, orders, reviews, user } from "@/db/schema";
import { db } from "@/db";
import { cartItems, coupons, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CartItem, Coupon, CouponsTableConfig, CustomersTableConfig, NewProduct, NewReview, Order, OrdersTableConfig, PageDataOptions, PageDataResponse, PageItems, Product, ProductsAnalyticsTableConfig, RatedProduct, Review, ReviewsTableConfig } from "@/types";
import { and, asc, count, desc, eq, getTableColumns, ilike, or, SQL, sql } from "drizzle-orm";
import { getPaginatedTableData, requireAdminAuth } from "./admin-helpers";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { User } from "@/types/index";
import { revalidatePath } from "next/cache";
import { NotFoundError } from "@/errors";

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

  await db.insert(products).values({
    ...productData,
    userId: session.user.id,
  });

  return { success: true };
}

export async function getProducts(): Promise<Product[]> {
  const productItems = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return productItems;
}
// // Calculate total units sold
// const totalOrdered = sql<number>`cast(coalesce(sum(${orderItems.quantity}), 0) as integer)`.as("totalOrdered");

// // Calculate total revenue (quantity * price at the time of purchase)
// const totalRevenue = sql<number>`cast(coalesce(sum(${orderItems.quantity} * ${orderItems.priceAtPurchase}), 0) as integer)`.as("totalRevenue");


// export async function getRatedProductById(id: number): Promise<RatedProduct> {
//   const productRating = sql<number>`cast(coalesce(,0))`
//   const [result] = await db.select().from(product).where(eq(product.id, id))
//   if (!result) {
//     throw new Error(`Product with ID ${id} not found`);
//   }
//   return result;
// }

export async function getRatedProductById(id: number): Promise<RatedProduct> {
  // Use getTableColumns to avoid listing every column manually. 
  // This makes the code maintainable if you add new columns to the product table later. 
  const [result] = await db
    .select({
      ...getTableColumns(products),
      // We calculate the average rating. 
      // We cast to integer (or numeric) and coalesce to 0 so we never return null.
      rate: sql<number>`cast(coalesce(avg(${reviews.rate}), 0) as decimal(10,2))`.as("rate"),
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

export async function getCartItems(): Promise<CartItem[]> {
  // 1. Get the session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Auth Check - Bubble up error
  if (!session) {
    throw new Error("You must be logged in to view your cart.");
  }

  // 3. Join cartItem with products
  const items = await db
    .select({
      // We select the whole product plus the quantity from the cart row
      product: products,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .where(eq(cartItems.userId, session.user.id))
    .innerJoin(products, eq(cartItems.productId, products.id));

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
      total: sql<number>`sum(${cartItems.quantity})`,
    })
    .from(cartItems)
    .where(eq(cartItems.userId, session.user.id));

  return Number(result[0]?.total) || 0;
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


export async function createCouponDB(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Only admins can create coupons.");
  }

  await db.insert(coupons).values({
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


export async function getCouponsPaged(page: number, pageSize: number): Promise<Coupon[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

  return await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.createdAt))
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
  const [result] = await db.select({ value: count() }).from(coupons);
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
      case "code": filters = ilike(coupons.code, q); break;
      case "name": filters = ilike(coupons.name, q); break;
      case "type":
        if ("قيمة ثابتة".includes(exactQuery)) filters = eq(coupons.type, "fixed");
        else if ("نسبة مئوية".includes(exactQuery)) filters = eq(coupons.type, "percentage");
        else if ("شحن مجاني".includes(exactQuery)) filters = eq(coupons.type, "free_shipping");
        else filters = ilike(coupons.type, q);
        break;
      case "value":
        filters = sql`CAST(${coupons.value} AS TEXT) ILIKE ${q}`; break;
      case "usedCount":
        filters = sql`CAST(${coupons.usedCount} AS TEXT) ILIKE ${q}`; break;
      case "status":
        const isExpired = sql`(${coupons.endDate} IS NOT NULL AND ${coupons.endDate} < NOW())`;
        const isFull = sql`(${coupons.globalUsageLimit} IS NOT NULL AND ${coupons.usedCount} >= ${coupons.globalUsageLimit})`;
        if ("مفعل".includes(exactQuery)) filters = sql`NOT (${isExpired} OR ${isFull})`;
        else if ("معطل".includes(exactQuery)) filters = sql`(${isExpired} OR ${isFull})`;
        break;
      default:
        filters = or(ilike(coupons.code, q), ilike(coupons.name, q));
    }
  }

  // 3. Table-Specific Sorting Logic
  let orderByCol;
  switch (sortColumn) {
    case "code": orderByCol = coupons.code; break;
    case "name": orderByCol = coupons.name; break;
    case "type": orderByCol = coupons.type; break;
    case "value": orderByCol = coupons.value; break;
    case "usedCount": orderByCol = coupons.usedCount; break;
    case "status":
      orderByCol = sql`(${coupons.endDate} IS NOT NULL AND ${coupons.endDate} < NOW()) OR (${coupons.globalUsageLimit} IS NOT NULL AND ${coupons.usedCount} >= ${coupons.globalUsageLimit})`;
      break;
    case "createdAt":
    default:
      orderByCol = coupons.createdAt; break;
  }

  const orderFn = sortDirection === "asc" ? asc : desc;

  // 4. Use abstracted Paginated Query runner
  return await getPaginatedTableData(coupons, {
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
  const productColumns = getTableColumns(products);

  // Calculate total units sold
  const totalOrdered = sql<number>`cast(coalesce(sum(${orderItems.quantity}), 0) as integer)`.as("totalOrdered");

  // Calculate total revenue (quantity * price at the time of purchase)
  const totalRevenue = sql<number>`cast(coalesce(sum(${orderItems.quantity} * ${orderItems.priceAtPurchase}), 0) as integer)`.as("totalRevenue");

  // 4. Build Filters
  let filters: SQL | undefined = undefined;
  if (query && query.trim() !== "") {
    const q = `%${query.trim()}%`;

    // If a specific search column is provided and exists in product table
    if (searchColumn && searchColumn in products) {
      filters = ilike(products[searchColumn as keyof Product], q);
    } else {
      // Default search: Name or Description
      filters = or(
        ilike(products.name, q),
        ilike(products.description, q)
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
  } else if (sortColumn && sortColumn in products) {
    orderByExpression = orderFn(products[sortColumn as keyof Product]);
  } else {
    orderByExpression = desc(products.createdAt);
  }

  // 6. Execute Queries in Parallel
  const [data, countResult] = await Promise.all([
    db
      .select({
        ...productColumns,
        totalOrdered,
        totalRevenue,
      })
      .from(products)
      // Left join orderItems so products with 0 sales still show up
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .where(filters)
      .groupBy(products.id)
      .orderBy(orderByExpression)
      .limit(pageSize)
      .offset(offset),

    db
      .select({ count: count() })
      .from(products)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count ?? 0;

  return {
    items: data as ProductsAnalyticsTableConfig['row'][],
    totalItems: totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}


export async function addReviewDB(data: NewReview) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("يجب تسجيل الدخول لإضافة تقييم");
  }

  const userId = session.user.id;

  // 1. Purchase Check (Same as before)
  const purchase = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orderItems.productId, data.productId),
        eq(orders.status, "paid")
      )
    )
    .limit(1);

  if (purchase.length === 0) {
    throw new Error("عذراً، يمكنك تقييم المنتجات التي قمت بشرائها فقط.");
  }

  // 2. Upsert Logic with updatedAt
  await db
    .insert(reviews)
    .values({
      ...data,
      userId: userId,
      // createdAt and updatedAt will use defaultNow() automatically on first insert
    })
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.productId],
      set: {
        rate: data.rate,
        title: data.title,
        content: data.content,
        // Manually update the timestamp on conflict
        updatedAt: sql`now()`,
      },
    });

  revalidatePath(`/product/${data.productId}`);
  return { success: true };
}

// export async function getReviewsPageData(
//   options: PageDataOptions
// ): Promise<PageDataResponse<ReviewsTableConfig['row']>> {
//   // 1. Security Check
//   await requireAdminAuth();

//   // 2. Parse Options
//   const query = options['q'];
//   const sortColumn = options['sortCol'];
//   const sortDirection = options['sortDir'] || "desc";
//   const searchColumn = options['searchCol'];
//   const page = Math.max(1, Number(options['page'] || 1));
//   const pageSize = Number(options['pageSize'] || 10);
//   const offset = (page - 1) * pageSize;

//   const getFilterFn = () => {
//     if (searchColumn && query && query.trim() !== "") {
//       const q = `%${query.trim()}%`;

//       if (searchColumn in reviews) {
//         return ilike(reviews[searchColumn as keyof Review], q);
//       }
//       if (searchColumn === 'customer') {
//         return or(
//           ilike(user.name, q),
//           ilike(user.email, q)
//         );
//       }
//     }
//   }

//   const getOrderFn = () => {
//     const orderFn = sortDirection === "asc" ? asc : desc;
//     let orderByExpression: SQL;

//     if (sortColumn === "customer") {
//       return orderByExpression = orderFn(user.name);
//     }
//     if (sortColumn === "productName") {
//       return orderByExpression = orderFn(product.name);
//     }
//     if (sortColumn && sortColumn in products) {
//       return orderByExpression = orderFn(products[sortColumn as keyof Product]);
//     }
//     return desc(reviews.createdAt);
//   }


//   const [data, countResult] = await Promise.all([
//     db
//       .select({
//         review: reviews,
//         user: {
//           name: user.name,
//           email: user.email,
//         },
//         productName: product.name,
//       })
//       .from(reviews)
//       .innerJoin(user, eq(reviews.userId, user.id))
//       .innerJoin(product, eq(reviews.productId, product.id))
//       .where(getFilterFn())
//       .offset(offset)
//       .orderBy(getOrderFn()),

//     db
//       .select({ count: count() })
//       .from(reviews)
//       .where(getFilterFn())
//   ]);

//   const totalItems = countResult[0]?.count ?? 0;

//   return {
//     items: data as ReviewsTableConfig['row'][],
//     totalItems: totalItems,
//     totalPages: Math.ceil(totalItems / pageSize),
//   };
// }

export async function getReviewsPageData(
  options: PageDataOptions
): Promise<PageDataResponse<ReviewsTableConfig['row']>> {
  // 1. Security Check
  await requireAdminAuth();

  // 2. Destructure Options with Safe Defaults
  const {
    q: query = "",
    sortCol = "updatedAt",
    sortDir = "desc",
    searchCol,
    page = "1",
    pageSize = "10"
  } = options;

  const limit = Math.max(1, Number(pageSize) || 10);
  const offset = (Math.max(1, Number(page) || 1) - 1) * limit;

  // 3. Declarative Filter Configuration
  // This replaces the nested if/else statements. It's easier to read and extend.
  const searchStrategies: Record<string, (searchTerm: string) => SQL> = {
    customer: (term) => or(ilike(user.name, term), ilike(user.email, term))!,
    productName: (term) => ilike(products.name, term),
    content: (term) => ilike(reviews.content, term),
    title: (term) => ilike(reviews.title, term),
  };

  const safeQuery = query.trim();
  const filters = safeQuery && searchCol && searchStrategies[searchCol]
    ? searchStrategies[searchCol](`%${safeQuery}%`)
    : undefined;

  // 4. Declarative Sorting Configuration
  // Maps the URL string directly to the Drizzle column definition.
  const sortMap: Record<string, AnyPgColumn | SQL> = {
    customer: user.name,
    productName: products.name,
    rate: reviews.rate,
    isVisible: reviews.isVisible,
    updatedAt: reviews.updatedAt,
    createdAt: reviews.createdAt,
  };

  // Safe fallback to createdAt if an invalid sortCol is provided in the URL
  const orderColumn = sortMap[sortCol] ?? reviews.updatedAt;
  const orderByExpression = sortDir === "asc" ? asc(orderColumn) : desc(orderColumn);

  // 5. Execute Queries in Parallel
  const [data, [countResult]] = await Promise.all([
    db
      .select({
        review: reviews,
        user: { name: user.name, email: user.email },
        productName: products.name,
      })
      .from(reviews)
      .innerJoin(user, eq(reviews.userId, user.id))
      .innerJoin(products, eq(reviews.productId, products.id))
      .where(filters)
      .limit(limit)
      .offset(offset)
      .orderBy(orderByExpression),

    db
      .select({ count: count() })
      .from(reviews)
      .innerJoin(user, eq(reviews.userId, user.id))
      .innerJoin(products, eq(reviews.productId, products.id))
      .where(filters)
  ]);

  const totalItems = countResult?.count ?? 0;

  return {
    items: data as ReviewsTableConfig['row'][],
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
}



export async function updateReviewVisibility(
  reviewId: number,
  visibility: boolean,
  tx: typeof db = db
) {
  await requireAdminAuth();
  const [updatedReview] = await tx.update(reviews).set({ isVisible: visibility }).where(eq(reviews.id, reviewId)).returning({ id: reviews.id, isVisible: reviews.isVisible })

  if (!updatedReview) {
    throw new Error(`Review with ID ${reviewId} not found.`);
  }

  return updatedReview;
}


export async function getUserById(userId: string): Promise<User> {
  // 1. Destructure the first element directly from the array result
  // 2. Use .limit(1) to tell Postgres to stop searching immediately
  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  // 3. Logic check: If undefined, bubble the specific error
  if (!foundUser) {
    throw new NotFoundError("User", userId);
  }

  return foundUser;
}