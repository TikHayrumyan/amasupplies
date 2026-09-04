import "server-only";

import { db } from "@/prisma/db";
import {
  SORT_GAP,
  needsRebalance,
  rebalanceOrders,
  sortBetween,
} from "@/lib/sort-order";
import { slugify, type SizeRecord } from "@/lib/size-fields";

const SIZE_FIELDS = ["id", "title", "slug", "sortOrder", "updatedAt"] as const;

export type Size = SizeRecord;

function ordered(rows: Size[]) {
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function listSizes() {
  const rows = await db.orm.public.Size.select(...SIZE_FIELDS).all();
  return ordered(rows);
}

export async function getSizeById(id: number) {
  return db.orm.public.Size.select(...SIZE_FIELDS).where({ id }).first();
}

export async function getSizeBySlug(slug: string) {
  return db.orm.public.Size.select(...SIZE_FIELDS).where({ slug }).first();
}

async function uniqueSlug(base: string, excludeId?: number) {
  const root = slugify(base) || "size";
  const rows = await db.orm.public.Size.select("id", "slug").all();
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
  const rows = await db.orm.public.Size.select("sortOrder").all();
  if (rows.length === 0) {
    return SORT_GAP;
  }
  return Math.max(...rows.map((row) => row.sortOrder)) + SORT_GAP;
}

export async function createSize(title: string, slug: string) {
  const taken = await db.orm.public.Size.select("id").where({ title }).first();
  if (taken) {
    throw new Error("This size already exists.");
  }
  await db.orm.public.Size.create({
    title,
    slug: await uniqueSlug(slug || title),
    sortOrder: await nextSortOrder(),
    updatedAt: new Date(),
  });
}

export async function updateSize(id: number, title: string, slug: string) {
  const taken = await db.orm.public.Size.select("id").where({ title }).first();
  if (taken && taken.id !== id) {
    throw new Error("This size already exists.");
  }
  await db.orm.public.Size.where({ id }).update({
    title,
    slug: await uniqueSlug(slug || title, id),
    updatedAt: new Date(),
  });
}

export async function countProductsForSize(sizeId: number) {
  const rows = await db.orm.public.ProductSize.select("id")
    .where({ sizeId })
    .all();
  return rows.length;
}

export async function deleteSize(id: number) {
  if ((await countProductsForSize(id)) > 0) {
    throw new Error("This size is used by products.");
  }
  await db.orm.public.Size.where({ id }).delete();
}

export async function reorderSize(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}) {
  const current = await getSizeById(input.id);
  if (!current) {
    throw new Error("Size not found.");
  }

  const before =
    input.beforeId == null ? null : await getSizeById(input.beforeId);
  const after =
    input.afterId == null ? null : await getSizeById(input.afterId);

  const next = sortBetween(before?.sortOrder ?? null, after?.sortOrder ?? null);

  if (needsRebalance(before?.sortOrder ?? null, after?.sortOrder ?? null, next)) {
    const rows = await listSizes();
    const without = rows.filter((row) => row.id !== input.id);
    const insertAt = input.beforeId
      ? without.findIndex((row) => row.id === input.beforeId) + 1
      : 0;
    without.splice(insertAt, 0, current);
    const orders = rebalanceOrders(without.length);
    await Promise.all(
      without.map((row, index) =>
        db.orm.public.Size.where({ id: row.id }).update({
          sortOrder: orders[index],
          updatedAt: new Date(),
        }),
      ),
    );
    return;
  }

  await db.orm.public.Size.where({ id: input.id }).update({
    sortOrder: next,
    updatedAt: new Date(),
  });
}
