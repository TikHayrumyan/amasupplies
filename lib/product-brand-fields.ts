import { slugify } from "@/lib/category-fields";

export type ProductBrandRecord = {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
  updatedAt: Date | string;
};

export const PRODUCT_BRAND_TITLE_MAX = 60;

export { slugify };

export function validateProductBrandCopy(title: string, slug: string) {
  if (!title) {
    return "Name is required.";
  }
  if (title.length > PRODUCT_BRAND_TITLE_MAX) {
    return `Name must be at most ${PRODUCT_BRAND_TITLE_MAX} characters.`;
  }
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens.";
  }
  return null;
}
