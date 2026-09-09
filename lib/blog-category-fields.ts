import { slugify } from "@/lib/category-fields";

export type BlogCategoryRecord = {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
  updatedAt: Date | string;
};

export const BLOG_CATEGORY_TITLE_MAX = 60;

export { slugify };

export function validateBlogCategoryCopy(title: string, slug: string) {
  if (!title) {
    return "Name is required.";
  }
  if (title.length > BLOG_CATEGORY_TITLE_MAX) {
    return `Name must be at most ${BLOG_CATEGORY_TITLE_MAX} characters.`;
  }
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens.";
  }
  return null;
}
