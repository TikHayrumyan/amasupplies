import { slugify } from "@/lib/category-fields";
import type { RelatedProductOption } from "@/lib/product-fields";

export type BlogPostRecord = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  authorName: string;
  categoryId: number;
  sortOrder: number;
  isPublished: boolean;
  publishedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type BlogPostListItem = BlogPostRecord & {
  categoryTitle: string;
  categorySlug: string;
};

export type BlogPostDetail = BlogPostListItem & {
  relatedIds: number[];
};

export type { RelatedProductOption };

export const BLOG_TITLE_MAX = 80;
export const BLOG_EXCERPT_MAX = 200;
export const BLOG_META_TITLE_MAX = 60;
export const BLOG_META_DESCRIPTION_MAX = 160;
export const BLOG_AUTHOR_MAX = 60;
export const BLOG_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const BLOG_RELATED_MAX = 8;
export const BLOG_DEFAULT_AUTHOR = "AMA Supplies";

export { slugify };

export function validateBlogPostCopy(input: {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  authorName: string;
  categoryId: number;
}) {
  if (!input.title) {
    return "Title is required.";
  }
  if (input.title.length > BLOG_TITLE_MAX) {
    return `Title must be at most ${BLOG_TITLE_MAX} characters.`;
  }
  if (!input.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens.";
  }
  if (!input.excerpt) {
    return "Excerpt is required.";
  }
  if (input.excerpt.length > BLOG_EXCERPT_MAX) {
    return `Excerpt must be at most ${BLOG_EXCERPT_MAX} characters.`;
  }
  if (input.metaTitle.length > BLOG_META_TITLE_MAX) {
    return `Meta title must be at most ${BLOG_META_TITLE_MAX} characters.`;
  }
  if (input.metaDescription.length > BLOG_META_DESCRIPTION_MAX) {
    return `Meta description must be at most ${BLOG_META_DESCRIPTION_MAX} characters.`;
  }
  if (!input.authorName) {
    return "Author is required.";
  }
  if (input.authorName.length > BLOG_AUTHOR_MAX) {
    return `Author must be at most ${BLOG_AUTHOR_MAX} characters.`;
  }
  if (!input.categoryId) {
    return "Category is required.";
  }
  return null;
}

export function toBlogDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBlogDate(value: Date | string) {
  const date = toBlogDate(value);
  if (!date) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function toIsoDate(value: Date | string) {
  return toBlogDate(value)?.toISOString();
}
