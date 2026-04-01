import { products, coupons, orders, orderItems, user, reviews } from "@/db/schema";
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
export type CartItem = Product & {
  quantity: number
};

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

export type CouponsTableConfig = TableConfig<
  Coupon,
  keyof Coupon & string | 'status'
>;

export type ProductsAnalyticsTableConfig = TableConfig<ProductAnalytics>;

export type CustomersTableConfig = TableConfig<
  User & {
    totalOrders: number;
    totalSpent: number
  },
  keyof User & string | "contact" | "totalSpent" | "totalOrders"
>;

export type ReviewsTableConfig = TableConfig<
  { review: Review, productName: String, user: { name: string, email: string } },
  keyof Review & string | "customer" | "productName"
>;


export type RatedProduct = Product & Pick<Review, 'rate'>