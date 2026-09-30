import "server-only";

import { cache } from "react";
import { db } from "@/prisma/db";
import { query } from "@/prisma/sql";
import { cacheStorefront } from "@/lib/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  slugify,
  RELATED_PRODUCT_MAX,
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
  "typeId",
  "sortOrder",
  "isPublished",
  "isBestSeller",
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

const PRODUCT_LIST_SQL = `
SELECT
  p.id,
  p.title,
  p.slug,
  p."metaTitle",
  p."metaDescription",
  p.description,
  p."imageUrl",
  p.sku,
  p."itemNumber",
  p."brandId",
  p."categoryId",
  p."typeId",
  p."sortOrder",
  p."isPublished",
  p."isBestSeller",
  p."createdAt",
  p."updatedAt",
  COALESCE(b.title, 'Brand') AS "brandTitle",
  COALESCE(b.slug, '') AS "brandSlug",
  c.title AS "categoryTitle",
  c.slug AS "categorySlug",
  t.title AS "typeTitle",
  t.slug AS "typeSlug"
FROM product p
JOIN category c ON c.id = p."categoryId"
LEFT JOIN product_brand b ON b.id = p."brandId"
LEFT JOIN product_type t ON t.id = p."typeId"
`;

type ProductListFilter = {
  published?: boolean;
  bestSeller?: boolean;
  publishedCategory?: boolean;
  categoryId?: number;
  id?: number;
  slug?: string;
  categorySlug?: string;
};

async function listProductItems(filter: ProductListFilter = {}) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filter.published) {
    clauses.push(`p."isPublished" = true`);
  }
  if (filter.bestSeller) {
    clauses.push(`p."isBestSeller" = true`);
  }
  if (filter.publishedCategory) {
    clauses.push(`c."isPublished" = true`);
  }
  if (filter.categoryId != null) {
    values.push(filter.categoryId);
    clauses.push(`p."categoryId" = $${values.length}`);
  }
  if (filter.id != null) {
    values.push(filter.id);
    clauses.push(`p.id = $${values.length}`);
  }
  if (filter.slug != null) {
    values.push(filter.slug);
    clauses.push(`p.slug = $${values.length}`);
  }
  if (filter.categorySlug != null) {
    values.push(filter.categorySlug);
    clauses.push(`c.slug = $${values.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return query<ProductListItem>(`${PRODUCT_LIST_SQL} ${where}`, values);
}

export async function listProducts() {
  const rows = await listProductItems();
  return rows.sort(
    (left, right) =>
      left.categoryTitle.localeCompare(right.categoryTitle) ||
      left.sortOrder - right.sortOrder,
  );
}

export const listPublishedProducts = cacheStorefront(async () => {
  return listProductItems({ published: true });
}, ["published-products-join"]);

function updatedAtTime(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export const listBestSellers = cacheStorefront(async () => {
  const rows = await listProductItems({
    published: true,
    bestSeller: true,
    publishedCategory: true,
  });
  return rows.sort(
    (left, right) =>
      updatedAtTime(right.updatedAt) - updatedAtTime(left.updatedAt) ||
      left.sortOrder - right.sortOrder,
  );
}, ["published-best-sellers-join"]);

export const listPublishedProductsByCategory = cacheStorefront(
  async (categoryId: number) => {
    return ordered(
      await listProductItems({ categoryId, published: true }),
    );
  },
  ["published-products-by-category-join"],
);

export const getProductById = cache(async (id: number) => {
  return db.orm.public.Product.select(...PRODUCT_FIELDS).where({ id }).first();
});

export const getPublishedProductBySlug = cacheStorefront(
  async (categorySlug: string, productSlug: string) => {
    const [product] = await listProductItems({
      published: true,
      publishedCategory: true,
      slug: productSlug,
      categorySlug,
    });
    if (!product) {
      return null;
    }
    return getProductDetail(product.id);
  },
  ["published-product-by-slug-join"],
);

export const listProductImages = cache(async (productId: number) => {
  const rows = await db.orm.public.ProductImage.select(...PRODUCT_IMAGE_FIELDS)
    .where({ productId })
    .all();
  return ordered(rows);
});

export const listProductSizeIds = cache(async (productId: number) => {
  const rows = await db.orm.public.ProductSize.select("sizeId")
    .where({ productId })
    .all();
  return rows.map((row) => row.sizeId);
});

export const listRelatedProductIds = cache(async (productId: number) => {
  const rows = await db.orm.public.ProductRelated.select(
    "relatedProductId",
    "sortOrder",
  )
    .where({ productId })
    .all();
  return [...rows]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((row) => row.relatedProductId);
});

export const listRelatedPublishedProducts = cacheStorefront(
  async (productId: number) => {
    const relatedIds = await listRelatedProductIds(productId);
    if (relatedIds.length === 0) {
      return [];
    }
    const published = await listPublishedProducts();
    const byId = new Map(published.map((row) => [row.id, row]));
    return relatedIds
      .map((id) => byId.get(id))
      .filter((row): row is ProductListItem => Boolean(row));
  },
  ["related-published-products-join"],
);

export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const [product] = await listProductItems({ id });
  if (!product) {
    return null;
  }
  const [gallery, sizeIds, sizes, relatedIds] = await Promise.all([
    listProductImages(id),
    listProductSizeIds(id),
    listSizes(),
    listRelatedProductIds(id),
  ]);
  const sizeMap = new Map(sizes.map((row) => [row.id, row.title]));
  return {
    ...product,
    gallery,
    sizeIds,
    sizeTitles: sizeIds
      .map((sizeId) => sizeMap.get(sizeId))
      .filter((title): title is string => Boolean(title)),
    relatedIds,
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

export function sanitizeRelatedProductIds(
  relatedIds: number[],
  productId: number,
  catalogIds: Set<number>,
) {
  const seen = new Set<number>();
  const next: number[] = [];
  for (const id of relatedIds) {
    if (
      id === productId ||
      !catalogIds.has(id) ||
      seen.has(id) ||
      next.length >= RELATED_PRODUCT_MAX
    ) {
      continue;
    }
    seen.add(id);
    next.push(id);
  }
  return next;
}

async function replaceProductRelated(productId: number, relatedIds: number[]) {
  const current = await db.orm.public.ProductRelated.select("id")
    .where({ productId })
    .all();
  await Promise.all(
    current.map((row) =>
      db.orm.public.ProductRelated.where({ id: row.id }).delete(),
    ),
  );
  await Promise.all(
    relatedIds.map((relatedProductId, index) =>
      db.orm.public.ProductRelated.create({
        productId,
        relatedProductId,
        sortOrder: (index + 1) * SORT_GAP,
      }),
    ),
  );
}

async function clearProductRelated(productId: number) {
  const [outgoing, incoming] = await Promise.all([
    db.orm.public.ProductRelated.select("id").where({ productId }).all(),
    db.orm.public.ProductRelated.select("id")
      .where({ relatedProductId: productId })
      .all(),
  ]);
  const ids = new Set([...outgoing, ...incoming].map((row) => row.id));
  await Promise.all(
    [...ids].map((id) => db.orm.public.ProductRelated.where({ id }).delete()),
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
  typeId: number | null;
  isPublished: boolean;
  isBestSeller: boolean;
  sizeIds: number[];
  relatedIds: number[];
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
    typeId: input.typeId,
    isPublished: input.isPublished,
    isBestSeller: input.isBestSeller,
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
  await replaceProductRelated(created.id, input.relatedIds);
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
    typeId: number | null;
    isPublished: boolean;
    isBestSeller: boolean;
    sizeIds: number[];
    relatedIds: number[];
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
    typeId: input.typeId,
    isPublished: input.isPublished,
    isBestSeller: input.isBestSeller,
    ...(categoryChanged
      ? { sortOrder: await nextSortOrder(input.categoryId) }
      : {}),
    updatedAt: new Date(),
  });
  await replaceProductSizes(id, input.sizeIds);
  await replaceProductRelated(id, input.relatedIds);
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
  await clearProductRelated(id);
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
      brandSlug: "",
      categoryTitle: "",
      categorySlug: "",
      typeTitle: null,
      typeSlug: null,
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
