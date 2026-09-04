export const SEARCH_MIN_LENGTH = 1;
export const SEARCH_QUERY_MAX = 80;
export const SEARCH_PANEL_LIMIT = 8;
export const SEARCH_OVERLAY_LIMIT = 24;

export type SearchHit = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string;
  brandTitle: string;
  categorySlug: string;
  itemNumber: string;
};

export function normalizeSearchQuery(value: string) {
  return value.trim().slice(0, SEARCH_QUERY_MAX);
}

export function productSearchHref(hit: Pick<SearchHit, "categorySlug" | "slug">) {
  return `/products/${hit.categorySlug}/${hit.slug}`;
}

export function scoreSearchHit(
  product: {
    title: string;
    sku: string;
    itemNumber: string;
    brandTitle: string;
  },
  query: string,
) {
  const q = query.toLowerCase();
  const title = product.title.toLowerCase();
  const sku = product.sku.toLowerCase();
  const item = product.itemNumber.toLowerCase();
  const brand = product.brandTitle.toLowerCase();

  if (title === q || sku === q || item === q) {
    return 100;
  }
  if (title.startsWith(q)) {
    return 90;
  }
  if (sku.startsWith(q) || item.startsWith(q)) {
    return 80;
  }
  if (title.includes(q)) {
    return 70;
  }
  if (brand.startsWith(q)) {
    return 60;
  }
  if (sku.includes(q) || item.includes(q) || brand.includes(q)) {
    return 50;
  }
  return 0;
}
