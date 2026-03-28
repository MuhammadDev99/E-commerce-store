// types.ts
import { product, coupon } from "./lib/auth-schema";
export type DisplayLanguage = 'arabic' | 'english'
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type Coupon = typeof coupon.$inferSelect
export type NewCoupon = typeof coupon.$inferInsert
export type CartItem = Product & { quantity: number }
export type ProductFormData = Omit<
  NewProduct,
  "id" | "userId" | "createdAt"
> & { stockQuantity: number; discount: number };

export const getEmptyProduct = (): NewProduct => ({
  title: "",
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

export type CouponRow = typeof coupon.$inferSelect;
export type CouponTableKey = Extract<keyof CouponRow, string> | "status";
export type CouponsTableHeader = TableHeaderFor<CouponRow, "status">;