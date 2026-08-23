export type CategoryRecord = {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
  updatedAt: Date | string;
};

export const CATEGORY_TITLE_MAX = 60;
export const CATEGORY_DESCRIPTION_MAX = 160;
export const CATEGORY_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validateCategoryCopy(title: string, slug: string, description: string) {
  if (!title) {
    return "Title is required.";
  }
  if (title.length > CATEGORY_TITLE_MAX) {
    return `Title must be at most ${CATEGORY_TITLE_MAX} characters.`;
  }
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens.";
  }
  if (description.length > CATEGORY_DESCRIPTION_MAX) {
    return `Description must be at most ${CATEGORY_DESCRIPTION_MAX} characters.`;
  }
  return null;
}
