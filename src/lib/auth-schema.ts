import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  // Custom Fields for your form
  phoneNumber: text("phoneNumber"),
  dateOfBirth: text("dateOfBirth"),
  role: text("role").notNull().default("user"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const genderEnum = pgEnum("gender", ["Women", "Men", "Unisex"]);

export const product = pgTable("product", {
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


export const cartItem = pgTable("cart_item", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => [
  unique("unique_user_product").on(table.userId, table.productId),
]);

export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "fixed", "free_shipping"]);

export const coupon = pgTable("coupon", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g., RAMADAN25
  type: couponTypeEnum("type").notNull(),
  value: integer("value"), // 20 for 20% or 2000 for 20.00 SAR (store in cents/halalas)
  minOrder: integer("minOrder").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  globalUsageLimit: integer("globalUsageLimit"),
  customerUsageLimit: integer("customerUsageLimit").default(1),
  usedCount: integer("usedCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});


// auth-schema.ts
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
    .references(() => product.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: integer("priceAtPurchase").notNull(), // To keep record if price changes later
});