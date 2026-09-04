import "server-only";

import { db } from "@/prisma/db";
import {
  SORT_GAP,
  needsRebalance,
  rebalanceOrders,
  sortBetween,
} from "@/lib/sort-order";
import { slugify, type ProductBrandRecord } from "@/lib/product-brand-fields";

const PRODUCT_BRAND_FIELDS = ["id", "title", "slug", "sortOrder", "updatedAt"] as const;

export type ProductBrand = ProductBrandRecord;

function ordered(rows: ProductBrand[]) {
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function listProductBrands() {
  const rows = await db.orm.public.ProductBrand.select(
    ...PRODUCT_BRAND_FIELDS,
  ).all();
  return ordered(rows);
}

export async function getProductBrandById(id: number) {
  return db.orm.public.ProductBrand.select(...PRODUCT_BRAND_FIELDS)
    .where({ id })
    .first();
}

export async function getProductBrandBySlug(slug: string) {
  return db.orm.public.ProductBrand.select(...PRODUCT_BRAND_FIELDS)
    .where({ slug })
    .first();
}

async function uniqueSlug(base: string, excludeId?: number) {
  const root = slugify(base) || "brand";
  const rows = await db.orm.public.ProductBrand.select("id", "slug").all();
  const taken = new Set(
    rows.filter((row) => row.id !== excludeId).map((row) => row.slug),
  );
  if (!taken.has(root)) {
    return root;
  }
  let index = 2;
  while (taken.has(`${root}-${index}`)) {
    index += 1;
  }
  return `${root}-${index}`;
}

async function nextSortOrder() {
  const rows = await db.orm.public.ProductBrand.select("sortOrder").all();
  if (rows.length === 0) {
    return SORT_GAP;
  }
  return Math.max(...rows.map((row) => row.sortOrder)) + SORT_GAP;
}

export async function createProductBrand(title: string, slug: string) {
  const taken = await db.orm.public.ProductBrand.select("id")
    .where({ title })
    .first();
  if (taken) {
    throw new Error("This brand already exists.");
  }
  await db.orm.public.ProductBrand.create({
    title,
    slug: await uniqueSlug(slug || title),
    sortOrder: await nextSortOrder(),
    updatedAt: new Date(),
  });
}

export async function updateProductBrand(id: number, title: string, slug: string) {
  const taken = await db.orm.public.ProductBrand.select("id")
    .where({ title })
    .first();
  if (taken && taken.id !== id) {
    throw new Error("This brand already exists.");
  }
  await db.orm.public.ProductBrand.where({ id }).update({
    title,
    slug: await uniqueSlug(slug || title, id),
    updatedAt: new Date(),
  });
}

export async function deleteProductBrand(id: number) {
  const { countProductsForBrand } = await import("@/lib/product");
  if ((await countProductsForBrand(id)) > 0) {
    throw new Error("This brand is used by products.");
  }
  await db.orm.public.ProductBrand.where({ id }).delete();
}

export async function reorderProductBrand(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}) {
  const current = await getProductBrandById(input.id);
  if (!current) {
    throw new Error("Brand not found.");
  }

  const before =
    input.beforeId == null ? null : await getProductBrandById(input.beforeId);
  const after =
    input.afterId == null ? null : await getProductBrandById(input.afterId);

  const next = sortBetween(before?.sortOrder ?? null, after?.sortOrder ?? null);

  if (needsRebalance(before?.sortOrder ?? null, after?.sortOrder ?? null, next)) {
    const rows = await listProductBrands();
    const without = rows.filter((row) => row.id !== input.id);
    const insertAt = input.beforeId
      ? without.findIndex((row) => row.id === input.beforeId) + 1
      : 0;
    without.splice(insertAt, 0, current);
    const orders = rebalanceOrders(without.length);
    await Promise.all(
      without.map((row, index) =>
        db.orm.public.ProductBrand.where({ id: row.id }).update({
          sortOrder: orders[index],
          updatedAt: new Date(),
        }),
      ),
    );
    return;
  }

  await db.orm.public.ProductBrand.where({ id: input.id }).update({
    sortOrder: next,
    updatedAt: new Date(),
  });
}
