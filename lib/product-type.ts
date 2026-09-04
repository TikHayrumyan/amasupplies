import "server-only";

import { db } from "@/prisma/db";
import {
  SORT_GAP,
  needsRebalance,
  rebalanceOrders,
  sortBetween,
} from "@/lib/sort-order";
import { slugify, type ProductTypeRecord } from "@/lib/product-type-fields";

const TYPE_FIELDS = [
  "id",
  "categoryId",
  "title",
  "slug",
  "sortOrder",
  "updatedAt",
] as const;

export type ProductType = ProductTypeRecord;

function ordered(rows: ProductType[]) {
  return [...rows].sort(
    (left, right) =>
      left.categoryId - right.categoryId || left.sortOrder - right.sortOrder,
  );
}

export async function listProductTypes() {
  const rows = await db.orm.public.ProductType.select(...TYPE_FIELDS).all();
  return ordered(rows);
}

export async function listProductTypesByCategory(categoryId: number) {
  const rows = await db.orm.public.ProductType.select(...TYPE_FIELDS)
    .where({ categoryId })
    .all();
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getProductTypeById(id: number) {
  return db.orm.public.ProductType.select(...TYPE_FIELDS).where({ id }).first();
}

async function uniqueSlug(categoryId: number, base: string, excludeId?: number) {
  const root = slugify(base) || "type";
  const rows = await db.orm.public.ProductType.select("id", "slug")
    .where({ categoryId })
    .all();
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

async function nextSortOrder(categoryId: number) {
  const rows = await db.orm.public.ProductType.select("sortOrder")
    .where({ categoryId })
    .all();
  if (rows.length === 0) {
    return SORT_GAP;
  }
  return Math.max(...rows.map((row) => row.sortOrder)) + SORT_GAP;
}

async function assertUniqueTitle(
  categoryId: number,
  title: string,
  excludeId?: number,
) {
  const rows = await db.orm.public.ProductType.select("id", "title")
    .where({ categoryId })
    .all();
  const taken = rows.some(
    (row) => row.id !== excludeId && row.title.toLowerCase() === title.toLowerCase(),
  );
  if (taken) {
    throw new Error("This type already exists in the category.");
  }
}

export async function createProductType(
  categoryId: number,
  title: string,
  slug: string,
) {
  await assertUniqueTitle(categoryId, title);
  await db.orm.public.ProductType.create({
    categoryId,
    title,
    slug: await uniqueSlug(categoryId, slug || title),
    sortOrder: await nextSortOrder(categoryId),
    updatedAt: new Date(),
  });
}

export async function updateProductType(
  id: number,
  title: string,
  slug: string,
) {
  const current = await getProductTypeById(id);
  if (!current) {
    throw new Error("Type not found.");
  }
  await assertUniqueTitle(current.categoryId, title, id);
  await db.orm.public.ProductType.where({ id }).update({
    title,
    slug: await uniqueSlug(current.categoryId, slug || title, id),
    updatedAt: new Date(),
  });
}

export async function countProductsForType(typeId: number) {
  const rows = await db.orm.public.Product.select("id").where({ typeId }).all();
  return rows.length;
}

export async function deleteProductType(id: number) {
  if ((await countProductsForType(id)) > 0) {
    throw new Error("This type is used by products.");
  }
  await db.orm.public.ProductType.where({ id }).delete();
}

export async function deleteProductTypesForCategory(categoryId: number) {
  const rows = await listProductTypesByCategory(categoryId);
  await Promise.all(
    rows.map((row) => db.orm.public.ProductType.where({ id: row.id }).delete()),
  );
}

export async function resolveProductTypeId(
  categoryId: number,
  typeId: number | null,
) {
  const types = await listProductTypesByCategory(categoryId);
  if (types.length === 0) {
    return null;
  }
  if (!typeId) {
    throw new Error("Type is required.");
  }
  if (!types.some((row) => row.id === typeId)) {
    throw new Error("Choose a type in this category.");
  }
  return typeId;
}

export async function reorderProductType(input: {
  id: number;
  categoryId: number;
  beforeId: number | null;
  afterId: number | null;
}) {
  const current = await getProductTypeById(input.id);
  if (!current || current.categoryId !== input.categoryId) {
    throw new Error("Type not found.");
  }

  const inCategory = await listProductTypesByCategory(input.categoryId);
  const before =
    input.beforeId == null
      ? null
      : inCategory.find((row) => row.id === input.beforeId) ?? null;
  const after =
    input.afterId == null
      ? null
      : inCategory.find((row) => row.id === input.afterId) ?? null;

  const next = sortBetween(before?.sortOrder ?? null, after?.sortOrder ?? null);

  if (needsRebalance(before?.sortOrder ?? null, after?.sortOrder ?? null, next)) {
    const without = inCategory.filter((row) => row.id !== input.id);
    const insertAt = input.beforeId
      ? without.findIndex((row) => row.id === input.beforeId) + 1
      : 0;
    without.splice(insertAt, 0, current);
    const orders = rebalanceOrders(without.length);
    await Promise.all(
      without.map((row, index) =>
        db.orm.public.ProductType.where({ id: row.id }).update({
          sortOrder: orders[index],
          updatedAt: new Date(),
        }),
      ),
    );
    return;
  }

  await db.orm.public.ProductType.where({ id: input.id }).update({
    sortOrder: next,
    updatedAt: new Date(),
  });
}
