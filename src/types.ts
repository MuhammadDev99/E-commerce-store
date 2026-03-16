import { product } from "./lib/auth-schema";

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type ProductFormData = Omit<
  NewProduct,
  "id" | "userId" | "createdAt"
> & { stockQuantity: number; discount: number };

// Use a function instead of a constant (Best Practice)
// This ensures you get a "fresh" object every time you reset the form
export const getEmptyProduct = (): ProductFormData => ({
  title: "",
  description: "",
  price: 0,
  images: [],
  stockQuantity: 0,
  category: [],
  gender: "Men", // Default value
  sizeMl: 0,
  tags: [],
  discount: 0,
});
export type MessageUI = {
  title: string;
  content: string;
  durationMs: number;
  type: "error" | "warning" | "info" | "success";
  id?: number;
};
