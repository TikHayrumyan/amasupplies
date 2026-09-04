import "server-only";

import { listPublishedProducts } from "@/lib/product";
import type { ProductListItem } from "@/lib/product-fields";
import {
  normalizeSearchQuery,
  scoreSearchHit,
  type SearchHit,
} from "@/lib/search-fields";

export async function searchPublishedProducts(
  rawQuery: string,
  limit?: number,
): Promise<{ products: ProductListItem[]; total: number }> {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) {
    return { products: [], total: 0 };
  }

  const ranked = (await listPublishedProducts())
    .map((product) => ({ product, score: scoreSearchHit(product, query) }))
    .filter((row) => row.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.product.title.localeCompare(right.product.title),
    );

  const products = ranked.map((row) => row.product);
  return {
    products: limit ? products.slice(0, limit) : products,
    total: ranked.length,
  };
}

export function toSearchHit(product: ProductListItem): SearchHit {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    imageUrl: product.imageUrl,
    brandTitle: product.brandTitle,
    categorySlug: product.categorySlug,
    itemNumber: product.itemNumber,
  };
}
