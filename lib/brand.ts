import "server-only";

import { db } from "@/prisma/db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BRAND_IMAGE_MAX_BYTES,
  type BrandRecord,
} from "@/lib/brand-fields";
import {
  SORT_GAP,
  needsRebalance,
  rebalanceOrders,
  sortBetween,
} from "@/lib/sort-order";

const BRAND_FIELDS = [
  "id",
  "title",
  "imageUrl",
  "sortOrder",
  "isPublished",
  "updatedAt",
] as const;

const BRAND_BUCKET = "brand";

export type Brand = BrandRecord;

function ordered(rows: Brand[]) {
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function listBrands() {
  const rows = await db.orm.public.Brand.select(...BRAND_FIELDS).all();
  return ordered(rows);
}

export async function listPublishedBrands() {
  const rows = await db.orm.public.Brand.select(...BRAND_FIELDS)
    .where({ isPublished: true })
    .all();
  return ordered(rows);
}

export async function getBrandById(id: number) {
  return db.orm.public.Brand.select(...BRAND_FIELDS).where({ id }).first();
}

async function nextSortOrder() {
  const rows = await db.orm.public.Brand.select("sortOrder").all();
  if (rows.length === 0) {
    return SORT_GAP;
  }
  return Math.max(...rows.map((row) => row.sortOrder)) + SORT_GAP;
}

export async function createBrand(input: {
  title: string;
  imageUrl: string;
  isPublished: boolean;
}) {
  await db.orm.public.Brand.create({
    title: input.title,
    imageUrl: input.imageUrl,
    isPublished: input.isPublished,
    sortOrder: await nextSortOrder(),
    updatedAt: new Date(),
  });
}

export async function updateBrand(
  id: number,
  input: {
    title: string;
    imageUrl: string;
    isPublished: boolean;
  },
) {
  await db.orm.public.Brand.where({ id }).update({
    title: input.title,
    imageUrl: input.imageUrl,
    isPublished: input.isPublished,
    updatedAt: new Date(),
  });
}

export async function deleteBrand(id: number) {
  const current = await getBrandById(id);
  if (!current) {
    return;
  }
  await db.orm.public.Brand.where({ id }).delete();
  await removeBrandMedia([current.imageUrl]);
}

export async function reorderBrand(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}) {
  const current = await getBrandById(input.id);
  if (!current) {
    throw new Error("Brand not found.");
  }

  const before =
    input.beforeId == null ? null : await getBrandById(input.beforeId);
  const after =
    input.afterId == null ? null : await getBrandById(input.afterId);

  const next = sortBetween(before?.sortOrder ?? null, after?.sortOrder ?? null);

  if (needsRebalance(before?.sortOrder ?? null, after?.sortOrder ?? null, next)) {
    const rows = await listBrands();
    const without = rows.filter((row) => row.id !== input.id);
    const insertAt = input.beforeId
      ? without.findIndex((row) => row.id === input.beforeId) + 1
      : 0;
    without.splice(insertAt, 0, current);
    const orders = rebalanceOrders(without.length);
    await Promise.all(
      without.map((row, index) =>
        db.orm.public.Brand.where({ id: row.id }).update({
          sortOrder: orders[index],
          updatedAt: new Date(),
        }),
      ),
    );
    return;
  }

  await db.orm.public.Brand.where({ id: input.id }).update({
    sortOrder: next,
    updatedAt: new Date(),
  });
}

async function ensureBrandBucket() {
  const admin = createAdminClient();
  const { data: existing, error: lookupError } =
    await admin.storage.getBucket(BRAND_BUCKET);

  if (existing) {
    return admin;
  }

  if (lookupError && !lookupError.message.toLowerCase().includes("not found")) {
    throw new Error(
      `Could not reach Storage. Check SUPABASE_SECRET_KEY. ${lookupError.message}`,
    );
  }

  const { error } = await admin.storage.createBucket(BRAND_BUCKET, {
    public: true,
    fileSizeLimit: "3MB",
    allowedMimeTypes: ["image/*"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(
      `Could not create the brand Storage bucket. ${error.message}`,
    );
  }

  return admin;
}

export async function uploadBrandImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }
  if (file.size > BRAND_IMAGE_MAX_BYTES) {
    throw new Error("File is larger than 3 MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const admin = await ensureBrandBucket();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${Date.now()}.${ext}`;
  const { error } = await admin.storage.from(BRAND_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    throw new Error(`Could not upload the image. ${error.message}`);
  }
  return admin.storage.from(BRAND_BUCKET).getPublicUrl(path).data.publicUrl;
}

function brandObjectPath(url: string | null | undefined) {
  if (!url) {
    return null;
  }
  const marker = `/storage/v1/object/public/${BRAND_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return decodeURIComponent(url.slice(index + marker.length));
}

export async function removeBrandMedia(urls: Array<string | null | undefined>) {
  const paths = [...new Set(urls.map(brandObjectPath).filter(Boolean))] as string[];
  if (paths.length === 0) {
    return;
  }
  const admin = createAdminClient();
  const { error } = await admin.storage.from(BRAND_BUCKET).remove(paths);
  if (error) {
    throw new Error(`Could not delete the file. ${error.message}`);
  }
}
