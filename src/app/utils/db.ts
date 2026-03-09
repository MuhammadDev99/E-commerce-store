"use server";

import { db } from "@/db";
import { product as productTable } from "@/lib/auth-schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Product } from "@/types";

export async function addProductDB(productData: Product) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Check if logged in
  if (!session) throw new Error("Unauthorized");

  // 2. Check if they are the owner/admin
  if (session.user.role !== "admin") {
    throw new Error("Permission denied: Only admins can add products.");
  }

  // 3. Proceed with insert
  await db.insert(productTable).values({
    ...productData,
    userId: session.user.id,
  });

  return { success: true };
}
