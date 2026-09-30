import "server-only";

import { db } from "@/prisma/db";
import { cacheStorefront } from "@/lib/cache";
import {
  catalogFacetVisible,
  type CatalogFacet,
  type CatalogFilters,
  type CatalogQuery,
  type CatalogSort,
} from "@/lib/catalog-fields";
import { getCategoryBySlug, listPublishedCategories } from "@/lib/category";
import {
  listPublishedProducts,
  listPublishedProductsByCategory,
  type ProductListItem,
} from "@/lib/product";
import { listProductTypes, listProductTypesByCategory } from "@/lib/product-type";
import { listSizes } from "@/lib/size";

export const ALL_PRODUCTS_SLUG = "all";

type CatalogProduct = ProductListItem & { sizeSlugs: string[] };

function matches(
  product: CatalogProduct,
  filters: CatalogFilters,
  skip?: keyof CatalogFilters,
) {
  if (skip !== "type" && filters.type && product.typeSlug !== filters.type) {
    return false;
  }
  if (skip !== "brand" && filters.brand && product.brandSlug !== filters.brand) {
    return false;
  }
  if (
    skip !== "size" &&
    filters.size &&
    !product.sizeSlugs.includes(filters.size)
  ) {
    return false;
  }
  return true;
}

function facetFrom(
  items: Array<{ slug: string; title: string; sortOrder: number }>,
  counts: Map<string, number>,
): CatalogFacet[] {
  return items
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      count: counts.get(item.slug) ?? 0,
    }))
    .filter((item) => item.count > 0);
}

export const getCatalog = cacheStorefront(async function getCatalog(
  slug: string,
  raw: CatalogQuery,
) {
  const category =
    slug === ALL_PRODUCTS_SLUG ? null : await getCategoryBySlug(slug);
  if (slug !== ALL_PRODUCTS_SLUG && (!category || !category.isPublished)) {
    return null;
  }

  const [products, types, sizes, publishedCategories] = await Promise.all([
    category
      ? listPublishedProductsByCategory(category.id)
      : listPublishedProducts(),
    category ? listProductTypesByCategory(category.id) : listProductTypes(),
    listSizes(),
    category ? Promise.resolve([]) : listPublishedCategories(),
  ]);
  const publishedSlugs = new Set(publishedCategories.map((row) => row.slug));
  const visible = category
    ? products
    : products.filter((product) => publishedSlugs.has(product.categorySlug));

  const productIds = new Set(visible.map((row) => row.id));
  const sizeLinks =
    productIds.size === 0
      ? []
      : (await db.orm.public.ProductSize.select("productId", "sizeId").all()).filter(
          (row) => productIds.has(row.productId),
        );

  const sizeSlugById = new Map(sizes.map((row) => [row.id, row.slug]));
  const sizeIdsByProduct = new Map<number, number[]>();
  for (const link of sizeLinks) {
    const current = sizeIdsByProduct.get(link.productId) ?? [];
    current.push(link.sizeId);
    sizeIdsByProduct.set(link.productId, current);
  }

  const catalog: CatalogProduct[] = visible.map((product) => ({
    ...product,
    sizeSlugs: (sizeIdsByProduct.get(product.id) ?? [])
      .map((sizeId) => sizeSlugById.get(sizeId))
      .filter((slug): slug is string => Boolean(slug)),
  }));

  const typeSlugs = new Set(catalog.map((row) => row.typeSlug).filter(Boolean));
  const brandSlugs = new Set(catalog.map((row) => row.brandSlug).filter(Boolean));
  const sizeSlugs = new Set(catalog.flatMap((row) => row.sizeSlugs));

  const filters: CatalogFilters = {
    type: raw.type && typeSlugs.has(raw.type) ? raw.type : null,
    brand: raw.brand && brandSlugs.has(raw.brand) ? raw.brand : null,
    size: raw.size && sizeSlugs.has(raw.size) ? raw.size : null,
  };

  function countBy(
    skip: keyof CatalogFilters,
    slugOf: (product: CatalogProduct) => string[],
  ) {
    const counts = new Map<string, number>();
    for (const product of catalog) {
      if (!matches(product, filters, skip)) {
        continue;
      }
      for (const slug of new Set(slugOf(product))) {
        if (!slug) {
          continue;
        }
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }
    return counts;
  }

  const typeItems = [
    ...new Map(
      types
        .filter((row) => typeSlugs.has(row.slug))
        .map((row) => [
          row.slug,
          { slug: row.slug, title: row.title, sortOrder: row.sortOrder },
        ]),
    ).values(),
  ];

  const brandItems = [
    ...new Map(
      catalog
        .filter((row) => row.brandSlug)
        .map((row) => [
          row.brandSlug,
          { slug: row.brandSlug, title: row.brandTitle, sortOrder: 0 },
        ]),
    ).values(),
  ].sort((left, right) => left.title.localeCompare(right.title));

  const usedSizeSlugs = sizeSlugs;
  const sizeItems = sizes
    .filter((row) => usedSizeSlugs.has(row.slug))
    .map((row) => ({ slug: row.slug, title: row.title, sortOrder: row.sortOrder }));

  const typeFacets = facetFrom(typeItems, countBy("type", (row) => [row.typeSlug ?? ""]));
  const brandFacets = facetFrom(
    brandItems,
    countBy("brand", (row) => [row.brandSlug]),
  );
  const sizeFacets = facetFrom(sizeItems, countBy("size", (row) => row.sizeSlugs));

  const filtered = sortCatalog(
    catalog.filter((row) => matches(row, filters)),
    raw.sort,
  );

  return {
    category,
    products: filtered,
    total: catalog.length,
    filters,
    sort: raw.sort,
    facets: {
      types: catalogFacetVisible(typeFacets, filters.type) ? typeFacets : [],
      brands: catalogFacetVisible(brandFacets, filters.brand) ? brandFacets : [],
      sizes: catalogFacetVisible(sizeFacets, filters.size) ? sizeFacets : [],
    },
  };
}, ["catalog"]);

function sortCatalog(products: CatalogProduct[], sort: CatalogSort) {
  const rows = [...products];
  if (sort === "az") {
    return rows.sort(
      (left, right) =>
        left.title.localeCompare(right.title) || left.sortOrder - right.sortOrder,
    );
  }
  if (sort === "za") {
    return rows.sort(
      (left, right) =>
        right.title.localeCompare(left.title) || left.sortOrder - right.sortOrder,
    );
  }
  return rows.sort(
    (left, right) =>
      left.categoryTitle.localeCompare(right.categoryTitle) ||
      left.sortOrder - right.sortOrder,
  );
}
