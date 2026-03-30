// types.ts
import { product, coupon, orders, orderItems, user } from "./lib/auth-schema";

export type DisplayLanguage = 'arabic' | 'english'

// --- Product Types ---
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type ProductAnalytics = Product & {
  totalOrdered: number;
  totalRevenue: number;
}
export type ProductAnalyticsTableKey = Extract<keyof ProductAnalytics, string>;
export type ProductAnalyticsTableHeader = TableHeaderFor<ProductAnalytics>;

// Composite type for UI (Order + its specific items)
export type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product })[];
};

// --- Cart Types ---
export type CartItem = Product & { quantity: number }

export const getEmptyProduct = (): NewProduct => ({
  name: "",
  description: "",
  price: 0,
  images: [],
  stockQuantity: 0,
  category: [],
  gender: "Men",
  sizeMl: 0,
  tags: [],
  discount: 0,
  userId: ""
});

export type MessageUI = {
  title: string;
  content: string;
  durationMs: number;
  type: "error" | "warning" | "info" | "success";
  id?: number;
};

export type PageItems<T> = {
  pageNumber: number;
  totalItems: number;
  totalPages: number;
  getData: () => Promise<T[]>;
}





// --- Coupon Types ---
export type Coupon = typeof coupon.$inferSelect
export type NewCoupon = typeof coupon.$inferInsert
export type CouponTableKey = Extract<keyof Coupon, string> | "status";
export type CouponsTableHeader = TableHeaderFor<Coupon, "status">;

// --- Order Types ---
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderKeys = Extract<keyof Order, string>;
export type OrdersTableHeader = TableHeaderFor<Order>;
// type OrderTableKey = "id" | "createdAt" | "orderReference" | "userId" | "totalAmount" | "status" | "tapChargeId"
// type OrdersTableHeader = TableHeader<"id" | "createdAt" | "userId" | 
// "orderReference" | "totalAmount" | "status" | "tapChargeId">
export type User = typeof user.$inferSelect;
export type OrderWithUser = {
  order: Order;
  customer: User;
};


// export type PageDataOptions<T> = {
//   page: number;
//   pageSize: number;
//   searchParams: { [key: string]: string | undefined }
// }
export type PageDataOptions = { [key: string]: string | undefined }
}
export type PageDataResponse<T> = { items: T[]; totalItems: number; totalPages: number }

export interface TableHeader<V extends string = string> {
  display: string;
  value: V;
  searchable?: boolean;
  sortable?: boolean;
  databaseSupport?: boolean;
  hidden?: boolean;
}

export type TableHeaderFor<T, K extends string = never> = TableHeader<
  Extract<keyof T, string> | K
>;


// The base "Contract" for any table
export interface TableConfig<R = any, K extends string = keyof R & string, H = TableHeader<K>> {
  row: R;
  keys: K;
  headers: H;
}

export type OrdersTableConfig = TableConfig<
  { order: Order; customer: User },
  keyof Order & string | 'customer'
>;

export type CouponsTableConfig = TableConfig<
  Coupon,
  keyof Coupon & string | 'status'
>;

export type PageDataURLParams = 'searchCol' | 'sortCol' | 'sortDir' | 'pageSize' | 'page' | 'q'