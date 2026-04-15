import { products, coupons, orders, orderItems, user, reviews, couponsWithStatus, cartItems, addresses, userPreferences } from "@/schemas/drizzle";
/**
 * 7. UI & FEEDBACK TYPES
 * Types strictly used for user interface states.
 */
export type MessageUI = {
  id?: number;
  title?: string;
  content?: string;
  type: "error" | "warning" | "info" | "success";
  durationMs?: number;
};


/**
 * 1. GLOBAL PRIMITIVES & LITERALS
 * Simple, low-level constants used across the application.
 */
export type DisplayLanguage = 'arabic' | 'english';
export type PageDataURLParams = 'searchCol' | 'sortCol' | 'sortDir' | 'pageSize' | 'page' | 'q';

/**
 * 2. DATABASE SCHEMA TYPES (Source of Truth)
 * Direct mappings from Drizzle schema for Select and Insert operations.
 */


// Users
export type User = typeof user.$inferSelect;

// Products
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Coupons
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

// CouponsWithStatus
export type CouponWithStatus = typeof couponsWithStatus.$inferSelect;
// Orders
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// Order Items
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// Review
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

/**
 * 3. DOMAIN & EXTENDED MODELS
 * Types that extend the base database schemas for specific business logic.
 */
export type CartItem = typeof cartItems.$inferSelect;
export type CartItemWithProduct = { cartItem: CartItem, product: Product };
export type ProductAnalytics = Product & {
  totalOrdered: number;
  totalRevenue: number;
};



/**
 * 4. API & PAGINATION UTILITIES
 * Standard structures for handling lists and server responses.
 */
export type PageDataOptions = {
  [key in PageDataURLParams]?: string
};

export type PageDataResponse<T> = {
  items: T[];
  totalItems: number;
  totalPages: number;
};

export type PageItems<T> = {
  pageNumber: number;
  totalItems: number;
  totalPages: number;
  getData: () => Promise<T[]>;
};

/**
 * 5. DATA TABLE INFRASTRUCTURE (Generics)
 * Abstract definitions for building dynamic UI tables.
 */
export interface TableHeader<V extends string = string> {
  display: string;
  value: V;
  searchable?: boolean;
  sortable?: boolean;
  hidden?: boolean;
}

export type TableHeaderFor<T, K extends string = never> = TableHeader<
  Extract<keyof T, string> | K
>;

export interface TableConfig<R = any, K extends string = keyof R & string, H = TableHeader<K>> {
  row: R;
  keys: K;
  headers: H;
}

/**
 * 6. SPECIFIC TABLE CONFIGURATIONS
 * Implementations of TableConfig for specific dashboard views.
 */
export type OrdersTableConfig = TableConfig<
  { order: Order; customer: User },
  keyof Order & string | 'customer'
>;
export type CartItemsTableConfig = TableConfig<
  { cartItem: CartItem, product: Product },
  keyof CartItem & string | 'name' | 'price'
>;
export type CouponsTableConfig = TableConfig<
  CouponWithStatus
>;

export type ProductsAnalyticsTableConfig = TableConfig<ProductAnalytics>;
export type OrderItemsTableConfig = TableConfig<
  { item: OrderItem, product: Pick<Product, 'id' | 'name'>, orderCreatedAt: Date },
  keyof OrderItem & string | 'name'
>;
export type CustomersTableConfig = TableConfig<
  User & {
    totalOrders: number;
    totalSpent: number
  },
  keyof User & string | "contact" | "totalSpent" | "totalOrders"
>;

export type ReviewsTableConfig = TableConfig<
  { review: Review, product: { name: string, id: number }, user: { id: string, name: string, email: string } },
  keyof Review & string | "customer" | "productName"
>;


export type RatedProduct = Product & Pick<Review, 'rate'>

export type CustomerStats = {
  orders: number
  spent: number
  reviews: number
  cart: number
}


export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
export type UserPreferences = typeof userPreferences.$inferSelect


// export const deliveryAddresses = pgTable("delivery_addresses", {
//     id: serial("id").primaryKey(),
//     lat: numeric("lat", { precision: 10, scale: 7 }).notNull(),
//     lon: numeric("lon", { precision: 10, scale: 7 }).notNull(),
//     road: text("road").notNull(),
//     houseNumber: text("house_number"),
//     suburb: text("suburb"),
//     city: text("city").notNull(),
//     state: text("state"),
//     postcode: text("postcode"),
//     countryCode: varchar("country_code", { length: 2 }).notNull(),
//     createdAt: timestamp("created_at").defaultNow(),
// });
// export type deliveryAddresses = pgTable("delivery_addresses", {
//     id: serial("id").primaryKey(),
//     lat: numeric("lat", { precision: 10, scale: 7 }).notNull(),
//     lon: numeric("lon", { precision: 10, scale: 7 }).notNull(),
//     road: text("road").notNull(),
//     houseNumber: text("house_number"),
//     suburb: text("suburb"),
//     city: text("city").notNull(),
//     state: text("state"),
//     postcode: text("postcode"),
//     countryCode: varchar("country_code", { length: 2 }).notNull(),
//     createdAt: timestamp("created_at").defaultNow(),
// });

export type OSMAddress = {
  amenity?: string; // Found in your JSON
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  province?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  "ISO3166-2-lvl4"?: string;
  // OSM adds many dynamic keys (e.g., 'state_district', 'house_number')
  // This index signature prevents crashes when new keys appear
  [key: string]: string | undefined;
}

export type OSMPlace = {
  place_id: number;
  licence: string;
  osm_type: "node" | "way" | "relation"; // More specific than just 'string'
  osm_id: number;
  lat: string;
  lon: string;
  class: string; // Changed from 'category' to 'class' to match your JSON
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: OSMAddress;
  boundingbox: [string, string, string, string]; // Correctly typed as a 4-item tuple
}


export interface FormElementRef {
  value: string
  error: string | undefined
  validate: () => boolean
  focus: () => void
}

export type UserProfile = {
  phoneNumber?: string;
  firstName?: string
  lastName?: string
  nationality?: string
  dateOfBirth?: Date;
  sex?: 'male' | 'female'
}