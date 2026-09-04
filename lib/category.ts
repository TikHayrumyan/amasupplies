import "server-only";

import { cache } from "react";
import { db } from "@/prisma/db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CATEGORY_IMAGE_MAX_BYTES,
  slugify,
  type CategoryRecord,
} from "@/lib/category-fields";
import {
  SORT_GAP,
  needsRebalance,
  rebalanceOrders,
  sortBetween,
} from "@/lib/sort-order";

const CATEGORY_FIELDS = [
  "id",
  "title",
  "slug",
  "description",
  "imageUrl",
  "sortOrder",
  "isPublished",
  "updatedAt",
] as const;

const CATEGORY_BUCKET = "category";

export type Category = CategoryRecord;

function ordered(rows: Category[]) {
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function listCategories() {
  const rows = await db.orm.public.Category.select(...CATEGORY_FIELDS).all();
  return ordered(rows);
}

export const listPublishedCategories = cache(async () => {
  const rows = await db.orm.public.Category.select(...CATEGORY_FIELDS)
    .where({ isPublished: true })
    .all();
  return ordered(rows);
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return db.orm.public.Category.select(...CATEGORY_FIELDS)
    .where({ slug })
    .first();
});

export async function getCategoryById(id: number) {
  return db.orm.public.Category.select(...CATEGORY_FIELDS)
    .where({ id })
    .first();
}

async function uniqueSlug(base: string, excludeId?: number) {
  const root = slugify(base) || "category";
  const rows = await db.orm.public.Category.select("id", "slug").all();
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
  const rows = await db.orm.public.Category.select("sortOrder").all();
  if (rows.length === 0) {
    return SORT_GAP;
  }
  return Math.max(...rows.map((row) => row.sortOrder)) + SORT_GAP;
}

export async function createCategory(input: {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
}) {
  const slug = await uniqueSlug(input.slug || input.title);
  await db.orm.public.Category.create({
    title: input.title,
    slug,
    description: input.description,
    imageUrl: input.imageUrl,
    isPublished: input.isPublished,
    sortOrder: await nextSortOrder(),
    updatedAt: new Date(),
  });
}

export async function updateCategory(
  id: number,
  input: {
    title: string;
    slug: string;
    description: string;
    imageUrl: string;
    isPublished: boolean;
  },
) {
  const slug = await uniqueSlug(input.slug || input.title, id);
  await db.orm.public.Category.where({ id }).update({
    title: input.title,
    slug,
    description: input.description,
    imageUrl: input.imageUrl,
    isPublished: input.isPublished,
    updatedAt: new Date(),
  });
}

export async function deleteCategory(id: number) {
  const current = await getCategoryById(id);
  if (!current) {
    return;
  }
  const { countProductsForCategory } = await import("@/lib/product");
  const { deleteProductTypesForCategory } = await import("@/lib/product-type");
  if ((await countProductsForCategory(id)) > 0) {
    throw new Error("This category still has products.");
  }
  await deleteProductTypesForCategory(id);
  await db.orm.public.Category.where({ id }).delete();
  await removeCategoryMedia([current.imageUrl]);
}

export async function reorderCategory(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}) {
  const current = await getCategoryById(input.id);
  if (!current) {
    throw new Error("Category not found.");
  }

  const before =
    input.beforeId == null ? null : await getCategoryById(input.beforeId);
  const after =
    input.afterId == null ? null : await getCategoryById(input.afterId);

  const next = sortBetween(before?.sortOrder ?? null, after?.sortOrder ?? null);

  if (needsRebalance(before?.sortOrder ?? null, after?.sortOrder ?? null, next)) {
    const rows = await listCategories();
    const without = rows.filter((row) => row.id !== input.id);
    const insertAt = input.beforeId
      ? without.findIndex((row) => row.id === input.beforeId) + 1
      : 0;
    without.splice(insertAt, 0, current);
    const orders = rebalanceOrders(without.length);
    await Promise.all(
      without.map((row, index) =>
        db.orm.public.Category.where({ id: row.id }).update({
          sortOrder: orders[index],
          updatedAt: new Date(),
        }),
      ),
    );
    return;
  }

  await db.orm.public.Category.where({ id: input.id }).update({
    sortOrder: next,
    updatedAt: new Date(),
  });
}

async function ensureCategoryBucket() {
  const admin = createAdminClient();
  const { data: existing, error: lookupError } =
    await admin.storage.getBucket(CATEGORY_BUCKET);

  if (existing) {
    return admin;
  }

  if (lookupError && !lookupError.message.toLowerCase().includes("not found")) {
    throw new Error(
      `Could not reach Storage. Check SUPABASE_SECRET_KEY. ${lookupError.message}`,
    );
  }

  const { error } = await admin.storage.createBucket(CATEGORY_BUCKET, {
    public: true,
    fileSizeLimit: "3MB",
    allowedMimeTypes: ["image/*"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(
      `Could not create the category Storage bucket. ${error.message}`,
    );
  }

  return admin;
}

export async function uploadCategoryImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }
  if (file.size > CATEGORY_IMAGE_MAX_BYTES) {
    throw new Error("File is larger than 3 MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const admin = await ensureCategoryBucket();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}.${ext}`;
  const { error } = await admin.storage.from(CATEGORY_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    throw new Error(`Could not upload the image. ${error.message}`);
  }
  return admin.storage.from(CATEGORY_BUCKET).getPublicUrl(path).data.publicUrl;
}

function categoryObjectPath(url: string | null | undefined) {
  if (!url) {
    return null;
  }
  const marker = `/storage/v1/object/public/${CATEGORY_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return decodeURIComponent(url.slice(index + marker.length));
}

export async function removeCategoryMedia(urls: Array<string | null | undefined>) {
  const paths = [...new Set(urls.map(categoryObjectPath).filter(Boolean))] as string[];
  if (paths.length === 0) {
    return;
  }
  const admin = createAdminClient();
  const { error } = await admin.storage.from(CATEGORY_BUCKET).remove(paths);
  if (error) {
    throw new Error(`Could not delete the file. ${error.message}`);
  }
}
