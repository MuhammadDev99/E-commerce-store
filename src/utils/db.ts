"use server";

import { db } from "@/db";
import { product as productTable } from "@/lib/auth-schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Product, ProductFormData } from "@/types";

export async function addProductDB(productData: ProductFormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Security Check: Authenticated?
  if (!session) throw new Error("Unauthorized");

  // 2. Security Check: Admin Role?
  if (session.user.role !== "admin") {
    throw new Error("Permission denied: Only admins can add products.");
  }

  // 3. Insert into Database
  const { ...data } = productData;

  await db.insert(productTable).values({
    title: data.title,
    description: data.description,
    price: data.price,
    images: data.images, // Drizzle handles the string[] -> PG Array conversion
    stockQuantity: data.stockQuantity,
    category: data.category,
    gender: data.gender,
    sizeMl: data.sizeMl,
    tags: data.tags,
    discount: data.discount,
    userId: session.user.id, // Securely set the owner from the session
  });

  return { success: true };
}
