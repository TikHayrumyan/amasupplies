"use server";

import { searchPublishedProducts, toSearchHit } from "@/lib/search";

export async function suggestProducts(query: string, limit: number) {
  const { products, total } = await searchPublishedProducts(query, limit);
  return {
    hits: products.map(toSearchHit),
    total,
  };
}
