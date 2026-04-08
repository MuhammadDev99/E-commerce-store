'use server'
import { db } from "@/db";
import { cartItems, coupons, couponsWithStatus, orderItems, orders, products, reviews, user } from "@/schemas/drizzle";
import { NotFoundError } from "@/errors";
import { auth } from "@/lib/auth";
import { CartItem, CartItemsTableConfig, Coupon, CouponsTableConfig, CouponWithStatus, CustomersTableConfig, NewCoupon, NewProduct, NewReview, OrderItem, OrderItemsTableConfig, OrdersTableConfig, PageDataOptions, PageDataResponse, PageItems, Product, ProductsAnalyticsTableConfig, Review, ReviewsTableConfig, User } from "@/types";
import { adminAction } from "@/utils/admin-guard";
import { and, asc, count, desc, eq, getTableColumns, ilike, or, SQL, sql } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
export const upsertProduct = adminAction(async (data: NewProduct) => {
    return await db.insert(products).values(data).onConflictDoUpdate({
        target: [products.name],
        set: data
    })
})

export const upsertCoupon = adminAction(async (data: NewCoupon): Promise<Coupon> => {
    const hasId = typeof data.id === 'number';
    const [result] = await db
        .insert(coupons)
        .values(data)
        .onConflictDoUpdate({
            target: [hasId ? coupons.id : coupons.code],
            set: { ...data, updatedAt: sql`now()` }
        }).returning()
    return result
})


export const getCouponsPaged = adminAction(async (
    paginationOptions: PageDataOptions
): Promise<PageDataResponse<CouponsTableConfig['row']>> => {

    const {
        query, sortColumn, sortDirection, searchColumn, pageSize, offset
    } = parsePageDataOptions(paginationOptions);


    const whereClause = (() => {
        const conditions = [];

        if (query?.trim() && searchColumn) {
            const searchTerm = `%${query.trim()}%`; // 'searchTerm' is clearer than 'q'
            if (searchColumn in couponsWithStatus) {
                // Casting numeric columns to text for partial matching
                conditions.push(sql`CAST(${couponsWithStatus[searchColumn as keyof CouponWithStatus]} AS TEXT) ILIKE ${searchTerm}`);
            }
        }

        return and(...conditions);
    })()

    const orderByClause = (() => {
        const applyDirection = sortDirection === "asc" ? asc : desc;

        if (sortColumn) {
            if (sortColumn in couponsWithStatus) {
                return applyDirection(couponsWithStatus[sortColumn as keyof CouponWithStatus]);
            }
        }
        return desc(couponsWithStatus.updatedAt);
    })()

    const [pagedRows, totalCountResult] = await Promise.all([
        db
            .select()
            .from(couponsWithStatus)
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(pageSize)
            .offset(offset),

        db
            .select({ count: count() })
            .from(couponsWithStatus)
            .where(whereClause)
    ]);

    const totalItems = totalCountResult[0]?.count ?? 0;

    return {
        items: pagedRows as CouponsTableConfig['row'][],
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
    };
})

export const getCustomersPaged = adminAction(async (
    options: PageDataOptions
): Promise<PageDataResponse<CustomersTableConfig['row']>> => {
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
    const totalOrders = sql<number> `cast(count(${orders.id}) as integer)`.as("totalOrders");
    const totalSpent = sql<number> `cast(coalesce(sum(${orders.totalAmount}), 0) as integer)`.as("totalSpent");

    // 3. Build Search Filters
    let filters = undefined;
    if (query && searchColumn) {
        const q = `%${query}%`;
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
            .select({ count: sql<number> `cast(count(distinct ${user.id}) as integer)` })
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
)


export const getProductsAnalticsPaged = adminAction(async (
    options: PageDataOptions
): Promise<PageDataResponse<ProductsAnalyticsTableConfig['row']>> => {
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
    const totalOrdered = sql<number> `cast(coalesce(sum(${orderItems.quantity}), 0) as integer)`.as("totalOrdered");

    // Calculate total revenue (quantity * price at the time of purchase)
    const totalRevenue = sql<number> `cast(coalesce(sum(${orderItems.quantity} * ${orderItems.priceAtPurchase}), 0) as integer)`.as("totalRevenue");

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
)
export const getReviewsPaged = adminAction(async (
    options: PageDataOptions, userId?: string
): Promise<PageDataResponse<ReviewsTableConfig['row']>> => {

    // 2. Destructure Options with Safe Defaults
    const {
        q: query = "", sortCol = "updatedAt", sortDir = "desc", searchCol, page = "1", pageSize = "10"
    } = options;

    const limit = Math.max(1, Number(pageSize) || 10);
    const offset = (Math.max(1, Number(page) || 1) - 1) * limit;

    // 3. Declarative Filter Configuration
    const searchStrategies: Record<string, (searchTerm: string) => SQL> = {
        customer: (term) => or(ilike(user.name, term), ilike(user.email, term))!,
        productName: (term) => ilike(products.name, term),
        content: (term) => ilike(reviews.content, term),
        title: (term) => ilike(reviews.title, term),
    };

    const safeQuery = query.trim();

    // Build dynamic filter conditions
    const filterConditions = [];

    // Filter by userId if provided
    if (userId) {
        filterConditions.push(eq(reviews.userId, userId));
    }

    // Filter by search query if provided
    if (safeQuery && searchCol && searchStrategies[searchCol]) {
        filterConditions.push(searchStrategies[searchCol](`%${safeQuery}%`));
    }

    // Combine all active conditions
    const filters = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // 4. Declarative Sorting Configuration
    const sortMap: Record<string, AnyPgColumn | SQL> = {
        customer: user.name,
        productName: products.name,
        rate: reviews.rate,
        isVisible: reviews.isVisible,
        updatedAt: reviews.updatedAt,
        createdAt: reviews.createdAt,
    };

    const orderColumn = sortMap[sortCol] ?? reviews.updatedAt;
    const orderByExpression = sortDir === "asc" ? asc(orderColumn) : desc(orderColumn);

    // 5. Execute Queries in Parallel
    const [data, [countResult]] = await Promise.all([
        db
            .select({
                review: reviews,
                user: { name: user.name, email: user.email, id: user.id },
                product: { name: products.name, id: products.id },
            })
            .from(reviews)
            .innerJoin(user, eq(reviews.userId, user.id))
            .innerJoin(products, eq(reviews.productId, products.id))
            .where(filters) // Applies the combined AND filters here
            .limit(limit)
            .offset(offset)
            .orderBy(orderByExpression),

        db
            .select({ count: count() })
            .from(reviews)
            .innerJoin(user, eq(reviews.userId, user.id))
            .innerJoin(products, eq(reviews.productId, products.id))
            .where(filters) // And also to the count query
    ]);

    const totalItems = countResult?.count ?? 0;

    return {
        items: data as ReviewsTableConfig['row'][],
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
    };
}
)


export const updateReviewVisibility = adminAction(async (
    reviewId: number,
    visibility: boolean,
    tx: typeof db = db
) => {
    const [updatedReview] = await tx.update(reviews).set({ isVisible: visibility }).where(eq(reviews.id, reviewId)).returning({ id: reviews.id, isVisible: reviews.isVisible });

    if (!updatedReview) {
        throw new Error(`Review with ID ${reviewId} not found.`);
    }

    return updatedReview;
}
)

export const getUserById = adminAction(async (userId: string): Promise<User> => {
    const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

    if (!foundUser) {
        throw new NotFoundError("User", userId);
    }

    return foundUser;
})

export const getReviewById = adminAction(async (reviewId: number): Promise<{ review: Review; user: User; }> => {
    const [foundReview] = await db.select({ review: reviews, user: user }).from(reviews).innerJoin(user, eq(user.id, reviews.userId)).where(eq(reviews.id, reviewId)).limit(1);
    if (!foundReview) {
        throw new NotFoundError("Review", reviewId);
    }

    return foundReview;
})
export const getCouponById = adminAction(async (couponId: number): Promise<CouponWithStatus> => {
    const [found] = await db.select().from(couponsWithStatus).where(eq(couponsWithStatus.id, couponId)).limit(1);
    if (!found) {
        throw new NotFoundError("Coupon", couponId);
    }

    return found;
})
function parsePageDataOptions(options: PageDataOptions) {
    const query = options['q'];
    const sortColumn = options['sortCol'];
    const sortDirection = options['sortDir'] || "desc";
    const searchColumn = options['searchCol'];
    const page = Math.max(1, Number(options['page'] || 1));
    const pageSize = Number(options['pageSize'] || 10);
    const offset = (page - 1) * pageSize;
    return { query, sortColumn, sortDirection, searchColumn, page, pageSize, offset };
}
export const getOrderItemsPaged = adminAction(async (
    paginationOptions: PageDataOptions, // More specific than 'options'
    orderId: string
): Promise<PageDataResponse<OrderItemsTableConfig['row']>> => {

    const {
        query, sortColumn, sortDirection, searchColumn, pageSize, offset
    } = parsePageDataOptions(paginationOptions);

    const targetOrderId = Number(orderId);

    // Renamed to reflect that it builds a SQL 'WHERE' condition
    const buildWhereClause = () => {
        const conditions = [eq(orderItems.orderId, targetOrderId)];

        if (query?.trim() && searchColumn) {
            const searchTerm = `%${query.trim()}%`; // 'searchTerm' is clearer than 'q'

            if (searchColumn === "name") {
                conditions.push(ilike(products.name, searchTerm));
            } else if (searchColumn in orderItems) {
                // Casting numeric columns to text for partial matching
                conditions.push(sql`CAST(${orderItems[searchColumn as keyof OrderItem]} AS TEXT) ILIKE ${searchTerm}`);
            }
        }

        return and(...conditions);
    };

    // Renamed from orderFunction to buildOrderBy
    const buildOrderBy = () => {
        const applyDirection = sortDirection === "asc" ? asc : desc; // 'applyDirection' describes the action

        if (sortColumn) {
            if (sortColumn in orderItems) {
                return applyDirection(orderItems[sortColumn as keyof OrderItem]);
            }
            if (sortColumn === "name") {
                return applyDirection(products.name);
            }
        }
        // Default fallback
        return desc(orderItems.priceAtPurchase);
    };

    const whereClause = buildWhereClause();
    const orderByClause = buildOrderBy();

    const [pagedRows, totalCountResult] = await Promise.all([
        db
            .select({
                item: orderItems,
                product: {
                    id: products.id,
                    name: products.name
                },
                orderCreatedAt: orders.createdAt
            })
            .from(orderItems)
            .leftJoin(products, eq(products.id, orderItems.productId))
            .leftJoin(orders, eq(orders.id, orderItems.orderId))
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(pageSize)
            .offset(offset),

        db
            .select({ count: count() })
            .from(orderItems)
            .leftJoin(products, eq(products.id, orderItems.productId))
            .leftJoin(orders, eq(orders.id, orderItems.orderId))
            .where(whereClause)
    ]);

    const totalItems = totalCountResult[0]?.count ?? 0;

    return {
        items: pagedRows as OrderItemsTableConfig['row'][],
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
    };
})

export async function getPaginatedTableData<TTable extends { $inferSelect: any; }>(
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
export async function getOrdersPageData(options: PageDataOptions, userId?: string): Promise<PageDataResponse<OrdersTableConfig['row']>> {

    const query = options['q'];
    const sortColumn = options['sortCol'];
    const sortDirection = options['sortDir'];
    const searchColumn = options['searchCol'] as OrdersTableConfig['keys'];
    const page = Number(options['page']);
    const pageSize = Number(options['pageSize']);
    const validPage = Math.max(1, page);
    const offset = (validPage - 1) * pageSize;

    // 2. Build Filters
    const filterConditions = [];

    // If a userId is provided, restrict results to ONLY this user
    if (userId) {
        filterConditions.push(eq(orders.userId, userId));
    }

    // If a search query is provided, add the search constraints
    if (searchColumn && query && query.trim() !== "") {
        const q = `%${query.trim()}%`;
        if (searchColumn === 'customer') {
            filterConditions.push(or(ilike(user.name, q), ilike(user.email, q)));
        }
        else if (Object.keys(orders).includes(searchColumn)) {
            filterConditions.push(ilike(orders[searchColumn], q));
        }
    }

    // Combine all conditions safely using AND
    const filters = filterConditions.length > 0 ? and(...filterConditions) : undefined;


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
                customer: user,
            })
            .from(orders)
            .innerJoin(user, eq(orders.userId, user.id))
            .where(filters) // Applies both user filter AND search queries
            .limit(pageSize)
            .offset(offset)
            .orderBy(orderFn(orderByCol)),

        db
            .select({ value: sql<number> `count(*)` })
            .from(orders)
            .innerJoin(user, eq(orders.userId, user.id))
            .where(filters), // Same filters applied to the count query
    ]);

    return {
        items: data as OrdersTableConfig['row'][],
        totalItems: Number(countResult.value),
        totalPages: Math.ceil(Number(countResult.value) / pageSize),
    };
}

export const getCartItemsPageData = adminAction(async (options: PageDataOptions, userId?: string): Promise<PageDataResponse<CartItemsTableConfig['row']>> => {
    const {
        query, sortColumn, sortDirection, searchColumn, pageSize, offset
    } = parsePageDataOptions(options);

    const orderByClause = (() => {
        const applyDirection = sortDirection === "asc" ? asc : desc;

        if (sortColumn) {
            if (sortColumn in cartItems) {
                return applyDirection(cartItems[sortColumn as keyof CartItem]);
            }
            if (sortColumn === "name") {
                return applyDirection(products.name);
            }
            if (sortColumn === "price") {
                return applyDirection(products.price);
            }
        }
        // Default fallback
        return desc(products.price);
    })()

    const whereClause = (() => {
        const conditions = userId ? [eq(cartItems.userId, userId)] : [];

        if (query?.trim() && searchColumn) {
            const searchTerm = `%${query.trim()}%`;
            if (searchColumn in cartItems) {
                conditions.push(sql`CAST(${cartItems[searchColumn as keyof CartItem]} AS TEXT) ILIKE ${searchTerm}`);
            }
            if (searchColumn === "name") {
                conditions.push(ilike(products.name, searchTerm));
            }
        }

        return and(...conditions);
    })()

    const [pagedRows, totalCountResult] = await Promise.all([
        db
            .select({
                cartItem: cartItems,
                product: products
            })
            .from(cartItems)
            .leftJoin(products, eq(products.id, cartItems.productId))
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(pageSize)
            .offset(offset),

        db
            .select({ count: count() })
            .from(cartItems)
            .leftJoin(products, eq(products.id, cartItems.productId))
            .where(whereClause)
    ]);

    const totalItems = totalCountResult[0]?.count ?? 0;

    return {
        items: pagedRows as CartItemsTableConfig['row'][],
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
    };
})