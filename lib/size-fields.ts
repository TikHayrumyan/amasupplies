import { slugify } from "@/lib/category-fields";

export type SizeRecord = {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
  updatedAt: Date | string;
};

export const SIZE_TITLE_MAX = 40;

export { slugify };

export function validateSizeCopy(title: string, slug: string) {
  if (!title) {
    return "Name is required.";
  }
  if (title.length > SIZE_TITLE_MAX) {
    return `Name must be at most ${SIZE_TITLE_MAX} characters.`;
  }
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens.";
  }
  return null;
}
