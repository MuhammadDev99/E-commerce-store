import {
    pgTable,
    text,
    timestamp,
    boolean,
    serial,
    integer,
    pgEnum,
    unique,
    pgView,
} from "drizzle-orm/pg-core";
import { account, session, user, verification } from "./auth";
import { getTableColumns, sql } from "drizzle-orm";
export { user, session, verification, account }

export const genderEnum = pgEnum("gender", ["Women", "Men", "Unisex"]);

export const products = pgTable("product", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),

    // 2. Arrays: Use .array() for string[]
    images: text("images").array().notNull(),
    category: text("category").array().notNull(),
    tags: text("tags").array().notNull(),

    // 3. Numbers: Use integer
    stockQuantity: integer("stockQuantity").notNull().default(0),
    sizeMl: integer("sizeMl").notNull(),
    discount: integer("discount").notNull().default(0),

    // 4. Use the Enum defined above
    gender: genderEnum("gender").notNull(),

    // 5. Relations and Metadata
    userId: text("userId")
        .notNull()
        .references(() => user.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});


export const cartItems = pgTable("cart_item", {
    id: serial("id").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    productId: integer("productId")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => [
    unique("unique_user_product").on(table.userId, table.productId),
]);

export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "fixed", "free_shipping"]);

export const coupons = pgTable("coupons", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull().unique(),
    type: couponTypeEnum("type").notNull(),
    value: integer("value"),
    minOrder: integer("minOrder").default(0),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    globalUsageLimit: integer("globalUsageLimit"),
    customerUsageLimit: integer("customerUsageLimit").default(1),
    usedCount: integer("usedCount").default(0),
    enabled: boolean("enabled").notNull().default(true),
    updatedAt: timestamp("updatedAt").defaultNow(),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const couponsWithStatus = pgView("coupons_with_status").as((qb) => {
    return qb
        .select({
            // This spreads all existing columns from the coupons table
            ...getTableColumns(coupons),

            // Then you just add your custom dynamic column
            status: sql<"active" | "disabled" | "expired" | "scheduled">`
        CASE 
          WHEN ${coupons.enabled} IS FALSE THEN 'disabled'
          WHEN ${coupons.endDate} IS NOT NULL AND ${coupons.endDate} < NOW() THEN 'expired'
          WHEN ${coupons.globalUsageLimit} IS NOT NULL AND ${coupons.usedCount} >= ${coupons.globalUsageLimit} THEN 'expired'
          WHEN ${coupons.startDate} IS NOT NULL AND ${coupons.startDate} > NOW() THEN 'scheduled'
          ELSE 'active'
        END`.as("status"),
        })
        .from(coupons);
});
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "failed"]);
// 1. The Main Order Table (High level)
export const orders = pgTable("orders", {
    id: serial("id").primaryKey(), // Real DB Primary Key (1, 2, 3...)
    orderReference: text("order_reference").notNull().unique(), // The ORD-ABC-123 for Tap
    userId: text("userId").notNull().references(() => user.id),
    totalAmount: integer("totalAmount").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"), tapChargeId: text("tap_charge_id"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// 2. The Order Items Table (Links products to the order)
export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("orderId")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }), // Links to the order above
    productId: integer("productId")
        .notNull()
        .references(() => products.id),
    quantity: integer("quantity").notNull(),
    priceAtPurchase: integer("priceAtPurchase").notNull(), // To keep record if price changes later
});


export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    userId: text("userId").notNull().references(() => user.id),
    productId: integer("productId")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    rate: integer("rate").notNull(),
    title: text("title").notNull(),
    content: text('content'),
    isVisible: boolean("isVisible").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    // Add this line:
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => [
    unique("unique_user_product_review").on(table.userId, table.productId),
]);