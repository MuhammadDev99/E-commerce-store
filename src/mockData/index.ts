import { Product } from "@/types";

// Load products from perfumes.json
const englishProducts: Product[] = require("./perfumes.json");
const arabicProducts: Product[] = require("./perfumes_arabic.json");
export const MOCK_PRODUCTS: Product[] = englishProducts.map((enProduct) => {
  // Find the matching Arabic product by ID
  const arProduct = arabicProducts.find((ar) => ar.id === enProduct.id);

  // Return the English product, but spread the Arabic one over it if it exists
  return {
    ...enProduct,
    // We only spread if arProduct is found to avoid errors
    ...(arProduct
      ? {
        title: arProduct.name,
        description: arProduct.description,
        category: arProduct.category,
        tags: arProduct.tags,
      }
      : {}),
  };
});

// export const MOCK_PRODUCTS: Product[] = require("./perfumes.json");
