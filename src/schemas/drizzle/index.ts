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
    doublePrecision,
    numeric,
    varchar,
    decimal,
    uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { getTableColumns, sql } from "drizzle-orm";

export * from "./auth";

export const genderEnum = pgEnum("gender", ["Women", "Men", "Unisex"]);

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
    price: integer("price").notNull(),

    // Arrays
    images: text("images").array().notNull(),
    category: text("category").array().notNull(),
    tags: text("tags").array().notNull(),

    // Numbers
    stockQuantity: integer("stock_quantity").notNull().default(0),
    sizeMl: integer("size_ml").notNull(),
    discount: integer("discount").notNull().default(0),

    // Enum
    gender: genderEnum("gender").notNull(),

    // Relations and Metadata
    userId: text("user_id")
        .notNull()
        .references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const cartItems = pgTable("cart_items", {
    id: serial("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    productId: integer("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
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
    minOrder: integer("min_order").default(0),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    globalUsageLimit: integer("global_usage_limit"),
    customerUsageLimit: integer("customer_usage_limit").default(1),
    usedCount: integer("used_count").default(0),
    enabled: boolean("enabled").notNull().default(true),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const couponsWithStatus = pgView("coupons_with_status").as((qb) => {
    return qb
        .select({
            ...getTableColumns(coupons),
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

export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    orderReference: text("order_reference").notNull().unique(),
    userId: text("user_id").notNull().references(() => user.id),

    // Link to the address used for this order
    addressId: uuid("address_id").references(() => addresses.id),


    // Logistics specific
    otoOrderId: text("oto_order_id"),

    totalAmount: integer("total_amount").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    tapChargeId: text("tap_charge_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
        .notNull()
        .references(() => products.id),
    quantity: integer("quantity").notNull(),
    priceAtPurchase: integer("price_at_purchase").notNull(),
});


export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    productId: integer("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    rate: integer("rate").notNull(),
    title: text("title").notNull(),
    content: text('content'),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    unique("unique_user_product_review").on(table.userId, table.productId),
]);



export const userPreferences = pgTable("user_preferences", {
    userId: text("user_id")
        .primaryKey()
        .references(() => user.id, { onDelete: "cascade" }),
    defaultAddressId: uuid("default_address_id")
        .references(() => addresses.id, { onDelete: "set null" }),
});

// 1. Define the Enum for Address Types (Home, Work, Other)
export const addressTypeEnum = pgEnum("address_type", ["home", "work", "other"]);

export const addresses = pgTable("addresses", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id),

    // --- Data from Map (Auto-filled) ---
    region: text("region").notNull(),
    city: text("city").notNull(),
    district: text("district").notNull(),
    street: text("street").notNull(),

    // New Fields
    postalCode: varchar("postal_code", { length: 64 }), // KSA Postcodes are 5 digits (e.g., 11391)
    countryCode: varchar("country_code", { length: 2 }).default("SA").notNull(), // ISO-2 (e.g., "SA")

    // Accuracy: 10,8 is standard for sub-meter GPS precision
    latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),

    // --- Data from User (Manual Input) ---
    buildingNumber: varchar("building_number", { length: 64 }).notNull(),
    // unitNumber: varchar("unit_number", { length: 128 }),
    apartment_floor: varchar("apartment_floor", { length: 128 }),
    buildingName: varchar("building_name", { length: 255 }),
    shortCode: varchar("short_code", { length: 64 }),
    landmark: text("landmark"),

    // --- Classification & UX ---
    addressType: addressTypeEnum("address_type").default("home").notNull(),
    addressNickname: varchar("address_nickname", { length: 128 }),
    recipientName: text("recipient_name").notNull(),
    displayAddress: text("display_address").notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
    label: varchar("label", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});