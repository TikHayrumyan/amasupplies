import "server-only";

import { cache } from "react";
import { db } from "@/prisma/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { listBlogCategories } from "@/lib/blog-category";
import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_RELATED_MAX,
  slugify,
  type BlogPostDetail,
  type BlogPostListItem,
  type BlogPostRecord,
} from "@/lib/blog-fields";
import { listPublishedProducts } from "@/lib/product";
import type { ProductListItem } from "@/lib/product-fields";
import {
  SORT_GAP,
  needsRebalance,
  rebalanceOrders,
  sortBetween,
} from "@/lib/sort-order";

const POST_FIELDS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "imageUrl",
  "metaTitle",
  "metaDescription",
  "authorName",
  "categoryId",
  "sortOrder",
  "isPublished",
  "publishedAt",
  "createdAt",
  "updatedAt",
] as const;

const BLOG_BUCKET = "blog";

export type BlogPost = BlogPostRecord;
export type { BlogPostDetail, BlogPostListItem };

function ordered<T extends { sortOrder: number }>(rows: T[]) {
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder);
}

async function uniqueSlug(value: string, excludeId?: number) {
  const rows = await db.orm.public.BlogPost.select("id", "slug").all();
  const taken = new Set(
    rows.filter((row) => row.id !== excludeId).map((row) => row.slug),
  );
  const root = slugify(value) || "post";
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
  const rows = await db.orm.public.BlogPost.select("sortOrder").all();
  if (rows.length === 0) {
    return SORT_GAP;
  }
  return Math.max(...rows.map((row) => row.sortOrder)) + SORT_GAP;
}

async function hydrate(rows: BlogPost[]): Promise<BlogPostListItem[]> {
  const categories = await listBlogCategories();
  const categoryMap = new Map(
    categories.map((row) => [row.id, { title: row.title, slug: row.slug }]),
  );
  return rows.map((row) => {
    const category = categoryMap.get(row.categoryId);
    return {
      ...row,
      categoryTitle: category?.title ?? "Category",
      categorySlug: category?.slug ?? "",
    };
  });
}

export async function listBlogPosts() {
  const rows = await db.orm.public.BlogPost.select(...POST_FIELDS).all();
  return ordered(await hydrate(rows));
}

export const listPublishedBlogPosts = cache(async (categorySlug?: string) => {
  const rows = await db.orm.public.BlogPost.select(...POST_FIELDS)
    .where({ isPublished: true })
    .all();
  const hydrated = ordered(await hydrate(rows));
  if (!categorySlug) {
    return hydrated;
  }
  return hydrated.filter((row) => row.categorySlug === categorySlug);
});

export async function getBlogPostById(id: number) {
  return db.orm.public.BlogPost.select(...POST_FIELDS).where({ id }).first();
}

export async function listBlogRelatedProductIds(postId: number) {
  const rows = await db.orm.public.BlogPostProduct.select(
    "productId",
    "sortOrder",
  )
    .where({ postId })
    .all();
  return [...rows]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((row) => row.productId);
}

export async function getBlogPostDetail(
  id: number,
): Promise<BlogPostDetail | null> {
  const post = await getBlogPostById(id);
  if (!post) {
    return null;
  }
  const [hydrated] = await hydrate([post]);
  return {
    ...hydrated,
    relatedIds: await listBlogRelatedProductIds(id),
  };
}

export const getPublishedBlogPostBySlug = cache(async (slug: string) => {
  const rows = await db.orm.public.BlogPost.select(...POST_FIELDS)
    .where({ slug, isPublished: true })
    .all();
  const [post] = rows;
  if (!post) {
    return null;
  }
  return getBlogPostDetail(post.id);
});

export async function listBlogRelatedPublishedProducts(postId: number) {
  const relatedIds = await listBlogRelatedProductIds(postId);
  if (relatedIds.length === 0) {
    return [];
  }
  const published = await listPublishedProducts();
  const byId = new Map(published.map((row) => [row.id, row]));
  return relatedIds
    .map((id) => byId.get(id))
    .filter((row): row is ProductListItem => Boolean(row));
}

export function sanitizeBlogRelatedIds(
  relatedIds: number[],
  catalogIds: Set<number>,
) {
  const seen = new Set<number>();
  const next: number[] = [];
  for (const id of relatedIds) {
    if (!catalogIds.has(id) || seen.has(id) || next.length >= BLOG_RELATED_MAX) {
      continue;
    }
    seen.add(id);
    next.push(id);
  }
  return next;
}

async function replaceBlogRelated(postId: number, relatedIds: number[]) {
  const current = await db.orm.public.BlogPostProduct.select("id")
    .where({ postId })
    .all();
  await Promise.all(
    current.map((row) =>
      db.orm.public.BlogPostProduct.where({ id: row.id }).delete(),
    ),
  );
  await Promise.all(
    relatedIds.map((productId, index) =>
      db.orm.public.BlogPostProduct.create({
        postId,
        productId,
        sortOrder: (index + 1) * SORT_GAP,
      }),
    ),
  );
}

export async function createBlogPost(input: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  authorName: string;
  categoryId: number;
  isPublished: boolean;
  relatedIds: number[];
}) {
  const slug = await uniqueSlug(input.slug || input.title);
  const now = new Date();
  await db.orm.public.BlogPost.create({
    title: input.title,
    slug,
    excerpt: input.excerpt,
    content: input.content,
    imageUrl: input.imageUrl,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    authorName: input.authorName,
    categoryId: input.categoryId,
    isPublished: input.isPublished,
    sortOrder: await nextSortOrder(),
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const created = await db.orm.public.BlogPost.select("id").where({ slug }).first();
  if (!created) {
    throw new Error("Could not save post.");
  }
  await replaceBlogRelated(created.id, input.relatedIds);
  return created.id;
}

export async function updateBlogPost(
  id: number,
  input: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
    authorName: string;
    categoryId: number;
    isPublished: boolean;
    relatedIds: number[];
  },
) {
  const current = await getBlogPostById(id);
  if (!current) {
    throw new Error("Post not found.");
  }
  await db.orm.public.BlogPost.where({ id }).update({
    title: input.title,
    slug: await uniqueSlug(input.slug || input.title, id),
    excerpt: input.excerpt,
    content: input.content,
    imageUrl: input.imageUrl,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    authorName: input.authorName,
    categoryId: input.categoryId,
    isPublished: input.isPublished,
    publishedAt:
      input.isPublished && !current.isPublished
        ? new Date()
        : current.publishedAt,
    updatedAt: new Date(),
  });
  await replaceBlogRelated(id, input.relatedIds);
}

export async function deleteBlogPost(id: number) {
  const current = await getBlogPostById(id);
  if (!current) {
    return;
  }
  const links = await db.orm.public.BlogPostProduct.select("id")
    .where({ postId: id })
    .all();
  await Promise.all(
    links.map((row) =>
      db.orm.public.BlogPostProduct.where({ id: row.id }).delete(),
    ),
  );
  await db.orm.public.BlogPost.where({ id }).delete();
  await removeBlogMedia([current.imageUrl]);
}

export async function reorderBlogPost(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}) {
  const current = await getBlogPostById(input.id);
  if (!current) {
    throw new Error("Post not found.");
  }

  const rows = await listBlogPosts();
  const before =
    input.beforeId == null
      ? null
      : rows.find((row) => row.id === input.beforeId) ?? null;
  const after =
    input.afterId == null
      ? null
      : rows.find((row) => row.id === input.afterId) ?? null;

  const next = sortBetween(before?.sortOrder ?? null, after?.sortOrder ?? null);

  if (needsRebalance(before?.sortOrder ?? null, after?.sortOrder ?? null, next)) {
    const without = rows.filter((row) => row.id !== input.id);
    const insertAt = input.beforeId
      ? without.findIndex((row) => row.id === input.beforeId) + 1
      : 0;
    without.splice(insertAt, 0, {
      ...current,
      categoryTitle: "",
      categorySlug: "",
    });
    const orders = rebalanceOrders(without.length);
    await Promise.all(
      without.map((row, index) =>
        db.orm.public.BlogPost.where({ id: row.id }).update({
          sortOrder: orders[index],
          updatedAt: new Date(),
        }),
      ),
    );
    return;
  }

  await db.orm.public.BlogPost.where({ id: input.id }).update({
    sortOrder: next,
    updatedAt: new Date(),
  });
}

async function ensureBlogBucket() {
  const admin = createAdminClient();
  const { data: existing, error: lookupError } =
    await admin.storage.getBucket(BLOG_BUCKET);

  if (existing) {
    return admin;
  }

  if (lookupError && !lookupError.message.toLowerCase().includes("not found")) {
    throw new Error(
      `Could not reach Storage. Check SUPABASE_SECRET_KEY. ${lookupError.message}`,
    );
  }

  const { error } = await admin.storage.createBucket(BLOG_BUCKET, {
    public: true,
    fileSizeLimit: "3MB",
    allowedMimeTypes: ["image/*"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(
      `Could not create the blog Storage bucket. ${error.message}`,
    );
  }

  return admin;
}

export async function uploadBlogImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }
  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    throw new Error("File is larger than 3 MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const admin = await ensureBlogBucket();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await admin.storage.from(BLOG_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    throw new Error(`Could not upload the image. ${error.message}`);
  }
  return admin.storage.from(BLOG_BUCKET).getPublicUrl(path).data.publicUrl;
}

function blogObjectPath(url: string | null | undefined) {
  if (!url) {
    return null;
  }
  const marker = `/storage/v1/object/public/${BLOG_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return decodeURIComponent(url.slice(index + marker.length));
}

export async function removeBlogMedia(
  urls: Array<string | null | undefined>,
) {
  const paths = [...new Set(urls.map(blogObjectPath).filter(Boolean))] as string[];
  if (paths.length === 0) {
    return;
  }
  const admin = createAdminClient();
  const { error } = await admin.storage.from(BLOG_BUCKET).remove(paths);
  if (error) {
    throw new Error(`Could not delete the file. ${error.message}`);
  }
}
