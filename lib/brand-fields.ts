export type BrandRecord = {
  id: number;
  title: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
  updatedAt: Date | string;
};

export const BRAND_TITLE_MAX = 60;
export const BRAND_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

export function validateBrandCopy(title: string) {
  if (!title) {
    return "Name is required.";
  }
  if (title.length > BRAND_TITLE_MAX) {
    return `Name must be at most ${BRAND_TITLE_MAX} characters.`;
  }
  return null;
}
