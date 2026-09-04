import "server-only";

import { cache } from "react";
import { db } from "@/prisma/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCategoryBySlug, listCategories } from "@/lib/category";
import { listProductBrands } from "@/lib/product-brand";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  slugify,
  type ProductDetail,
  type ProductImageRecord,
  type ProductListItem,
  type ProductRecord,
} from "@/lib/product-fields";
import { listSizes } from "@/lib/size";
import {
  SORT_GAP,
  needsRebalance,
  rebalanceOrders,
  sortBetween,
} from "@/lib/sort-order";

const PRODUCT_FIELDS = [
  "id",
  "title",
  "slug",
  "metaTitle",
  "metaDescription",
  "description",
  "imageUrl",
  "sku",
  "itemNumber",
  "brandId",
  "categoryId",
  "sortOrder",
  "isPublished",
  "createdAt",
  "updatedAt",
] as const;

const PRODUCT_IMAGE_FIELDS = ["id", "productId", "imageUrl", "sortOrder"] as const;
const PRODUCT_BUCKET = "product";

export type Product = ProductRecord;
export type ProductImage = ProductImageRecord;
export type { ProductDetail, ProductListItem };

function ordered<T extends { sortOrder: number }>(rows: T[]) {
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder);
}

async function uniqueValue(
  field: "slug" | "sku" | "itemNumber",
  value: string,
  excludeId?: number,
) {
  const rows = await db.orm.public.Product.select("id", field).all();
  const taken = new Set(
    rows
      .filter((row) => row.id !== excludeId)
      .map((row) => row[field].toLowerCase()),
  );
  if (field === "slug") {
    const root = slugify(value) || "product";
    if (!taken.has(root)) {
      return root;
    }
    let index = 2;
    while (taken.has(`${root}-${index}`)) {
      index += 1;
    }
    return `${root}-${index}`;
  }
  if (taken.has(value.toLowerCase())) {
    throw new Error(
      field === "sku"
        ? "This SKU is already in use."
        : "This item number is already in use.",
    );
  }
  return value;
}

async function nextSortOrder(categoryId: number) {
  const rows = await db.orm.public.Product.select("sortOrder")
    .where({ categoryId })
    .all();
  if (rows.length === 0) {
    return SORT_GAP;
  }
  return Math.max(...rows.map((row) => row.sortOrder)) + SORT_GAP;
}

async function hydrate(rows: Product[]): Promise<ProductListItem[]> {
  const [brands, categories] = await Promise.all([
    listProductBrands(),
    listCategories(),
  ]);
  const brandMap = new Map(brands.map((row) => [row.id, row.title]));
  const categoryMap = new Map(
    categories.map((row) => [row.id, { title: row.title, slug: row.slug }]),
  );

  return rows.map((row) => {
    const category = categoryMap.get(row.categoryId);
    return {
      ...row,
      brandTitle: brandMap.get(row.brandId) ?? "Brand",
      categoryTitle: category?.title ?? "Category",
      categorySlug: category?.slug ?? "",
    };
  });
}

export async function listProducts() {
  const rows = await db.orm.public.Product.select(...PRODUCT_FIELDS).all();
  const hydrated = await hydrate(rows);
  return hydrated.sort(
    (left, right) =>
      left.categoryTitle.localeCompare(right.categoryTitle) ||
      left.sortOrder - right.sortOrder,
  );
}

export const listPublishedProductsByCategory = cache(async (categoryId: number) => {
  const rows = await db.orm.public.Product.select(...PRODUCT_FIELDS)
    .where({ categoryId, isPublished: true })
    .all();
  return ordered(await hydrate(rows));
});

export async function getProductById(id: number) {
  return db.orm.public.Product.select(...PRODUCT_FIELDS).where({ id }).first();
}

export const getPublishedProductBySlug = cache(async (
  categorySlug: string,
  productSlug: string,
) => {
  const rows = await db.orm.public.Product.select(...PRODUCT_FIELDS)
    .where({ slug: productSlug, isPublished: true })
    .all();
  const [hydrated] = await hydrate(rows);
  if (!hydrated || hydrated.categorySlug !== categorySlug) {
    return null;
  }
  const category = await getCategoryBySlug(categorySlug);
  if (!category?.isPublished) {
    return null;
  }
  return getProductDetail(hydrated.id);
});

export async function listProductImages(productId: number) {
  const rows = await db.orm.public.ProductImage.select(...PRODUCT_IMAGE_FIELDS)
    .where({ productId })
    .all();
  return ordered(rows);
}

export async function listProductSizeIds(productId: number) {
  const rows = await db.orm.public.ProductSize.select("sizeId")
    .where({ productId })
    .all();
  return rows.map((row) => row.sizeId);
}

export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const product = await getProductById(id);
  if (!product) {
    return null;
  }
  const [hydrated] = await hydrate([product]);
  const [gallery, sizeIds, sizes] = await Promise.all([
    listProductImages(id),
    listProductSizeIds(id),
    listSizes(),
  ]);
  const sizeMap = new Map(sizes.map((row) => [row.id, row.title]));
  return {
    ...hydrated,
    gallery,
    sizeIds,
    sizeTitles: sizeIds
      .map((sizeId) => sizeMap.get(sizeId))
      .filter((title): title is string => Boolean(title)),
  };
}

export async function countProductsForBrand(brandId: number) {
  const rows = await db.orm.public.Product.select("id").where({ brandId }).all();
  return rows.length;
}

export async function countProductsForCategory(categoryId: number) {
  const rows = await db.orm.public.Product.select("id")
    .where({ categoryId })
    .all();
  return rows.length;
}

async function replaceProductSizes(productId: number, sizeIds: number[]) {
  const current = await db.orm.public.ProductSize.select("id", "sizeId")
    .where({ productId })
    .all();
  await Promise.all(
    current.map((row) => db.orm.public.ProductSize.where({ id: row.id }).delete()),
  );
  await Promise.all(
    [...new Set(sizeIds)].map((sizeId) =>
      db.orm.public.ProductSize.create({ productId, sizeId }),
    ),
  );
}

async function addProductImages(productId: number, urls: string[]) {
  const existing = await listProductImages(productId);
  let order =
    existing.length === 0
      ? SORT_GAP
      : Math.max(...existing.map((row) => row.sortOrder)) + SORT_GAP;
  for (const imageUrl of urls) {
    await db.orm.public.ProductImage.create({
      productId,
      imageUrl,
      sortOrder: order,
    });
    order += SORT_GAP;
  }
}

export async function createProduct(input: {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  imageUrl: string;
  sku: string;
  itemNumber: string;
  brandId: number;
  categoryId: number;
  isPublished: boolean;
  sizeIds: number[];
  galleryUrls: string[];
}) {
  const slug = await uniqueValue("slug", input.slug || input.title);
  const sku = await uniqueValue("sku", input.sku);
  const itemNumber = await uniqueValue("itemNumber", input.itemNumber);
  await db.orm.public.Product.create({
    title: input.title,
    slug,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    description: input.description,
    imageUrl: input.imageUrl,
    sku,
    itemNumber,
    brandId: input.brandId,
    categoryId: input.categoryId,
    isPublished: input.isPublished,
    sortOrder: await nextSortOrder(input.categoryId),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const created = await db.orm.public.Product.select("id")
    .where({ slug })
    .first();
  if (!created) {
    throw new Error("Could not save product.");
  }
  await replaceProductSizes(created.id, input.sizeIds);
  await addProductImages(created.id, input.galleryUrls);
  return created.id;
}

export async function updateProduct(
  id: number,
  input: {
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    description: string;
    imageUrl: string;
    sku: string;
    itemNumber: string;
    brandId: number;
    categoryId: number;
    isPublished: boolean;
    sizeIds: number[];
    galleryUrls: string[];
    keepImageIds: number[];
  },
) {
  const current = await getProductById(id);
  if (!current) {
    throw new Error("Product not found.");
  }
  const slug = await uniqueValue("slug", input.slug || input.title, id);
  const sku = await uniqueValue("sku", input.sku, id);
  const itemNumber = await uniqueValue("itemNumber", input.itemNumber, id);
  const categoryChanged = input.categoryId !== current.categoryId;
  await db.orm.public.Product.where({ id }).update({
    title: input.title,
    slug,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    description: input.description,
    imageUrl: input.imageUrl,
    sku,
    itemNumber,
    brandId: input.brandId,
    categoryId: input.categoryId,
    isPublished: input.isPublished,
    ...(categoryChanged
      ? { sortOrder: await nextSortOrder(input.categoryId) }
      : {}),
    updatedAt: new Date(),
  });
  await replaceProductSizes(id, input.sizeIds);
  const gallery = await listProductImages(id);
  const removed = gallery.filter((row) => !input.keepImageIds.includes(row.id));
  await Promise.all(
    removed.map((row) => db.orm.public.ProductImage.where({ id: row.id }).delete()),
  );
  await removeProductMedia(removed.map((row) => row.imageUrl));
  await addProductImages(id, input.galleryUrls);
}

export async function deleteProduct(id: number) {
  const current = await getProductDetail(id);
  if (!current) {
    return;
  }
  const links = await db.orm.public.ProductSize.select("id")
    .where({ productId: id })
    .all();
  await Promise.all(
    links.map((row) => db.orm.public.ProductSize.where({ id: row.id }).delete()),
  );
  await Promise.all(
    current.gallery.map((row) =>
      db.orm.public.ProductImage.where({ id: row.id }).delete(),
    ),
  );
  await db.orm.public.Product.where({ id }).delete();
  await removeProductMedia([
    current.imageUrl,
    ...current.gallery.map((row) => row.imageUrl),
  ]);
}

export async function reorderProduct(input: {
  id: number;
  categoryId: number;
  beforeId: number | null;
  afterId: number | null;
}) {
  const current = await getProductById(input.id);
  if (!current) {
    throw new Error("Product not found.");
  }

  const inCategory = (await listProducts()).filter(
    (row) => row.categoryId === input.categoryId,
  );
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
    without.splice(insertAt, 0, {
      ...current,
      brandTitle: "",
      categoryTitle: "",
      categorySlug: "",
    });
    const orders = rebalanceOrders(without.length);
    await Promise.all(
      without.map((row, index) =>
        db.orm.public.Product.where({ id: row.id }).update({
          sortOrder: orders[index],
          updatedAt: new Date(),
        }),
      ),
    );
    return;
  }

  await db.orm.public.Product.where({ id: input.id }).update({
    sortOrder: next,
    updatedAt: new Date(),
  });
}

async function ensureProductBucket() {
  const admin = createAdminClient();
  const { data: existing, error: lookupError } =
    await admin.storage.getBucket(PRODUCT_BUCKET);

  if (existing) {
    return admin;
  }

  if (lookupError && !lookupError.message.toLowerCase().includes("not found")) {
    throw new Error(
      `Could not reach Storage. Check SUPABASE_SECRET_KEY. ${lookupError.message}`,
    );
  }

  const { error } = await admin.storage.createBucket(PRODUCT_BUCKET, {
    public: true,
    fileSizeLimit: "3MB",
    allowedMimeTypes: ["image/*"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(
      `Could not create the product Storage bucket. ${error.message}`,
    );
  }

  return admin;
}

export async function uploadProductImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error("File is larger than 3 MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const admin = await ensureProductBucket();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await admin.storage.from(PRODUCT_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    throw new Error(`Could not upload the image. ${error.message}`);
  }
  return admin.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl;
}

function productObjectPath(url: string | null | undefined) {
  if (!url) {
    return null;
  }
  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return decodeURIComponent(url.slice(index + marker.length));
}

export async function removeProductMedia(
  urls: Array<string | null | undefined>,
) {
  const paths = [...new Set(urls.map(productObjectPath).filter(Boolean))] as string[];
  if (paths.length === 0) {
    return;
  }
  const admin = createAdminClient();
  const { error } = await admin.storage.from(PRODUCT_BUCKET).remove(paths);
  if (error) {
    throw new Error(`Could not delete the file. ${error.message}`);
  }
}
