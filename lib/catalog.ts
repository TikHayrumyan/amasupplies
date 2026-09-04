import "server-only";

import { db } from "@/prisma/db";
import {
  catalogFacetVisible,
  type CatalogFacet,
  type CatalogFilters,
} from "@/lib/catalog-fields";
import { listPublishedProductsByCategory, type ProductListItem } from "@/lib/product";
import { listProductTypesByCategory } from "@/lib/product-type";
import { listSizes } from "@/lib/size";

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

export async function getCategoryCatalog(
  categoryId: number,
  raw: CatalogFilters,
) {
  const [products, types, sizes] = await Promise.all([
    listPublishedProductsByCategory(categoryId),
    listProductTypesByCategory(categoryId),
    listSizes(),
  ]);

  const productIds = new Set(products.map((row) => row.id));
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

  const catalog: CatalogProduct[] = products.map((product) => ({
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

  const typeItems = types
    .filter((row) => typeSlugs.has(row.slug))
    .map((row) => ({ slug: row.slug, title: row.title, sortOrder: row.sortOrder }));

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

  return {
    products: catalog.filter((row) => matches(row, filters)),
    total: catalog.length,
    filters,
    facets: {
      types: catalogFacetVisible(typeFacets, filters.type) ? typeFacets : [],
      brands: catalogFacetVisible(brandFacets, filters.brand) ? brandFacets : [],
      sizes: catalogFacetVisible(sizeFacets, filters.size) ? sizeFacets : [],
    },
  };
}
