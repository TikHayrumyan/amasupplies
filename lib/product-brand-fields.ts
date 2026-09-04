export type ProductBrandRecord = {
  id: number;
  title: string;
  sortOrder: number;
  updatedAt: Date | string;
};

export const PRODUCT_BRAND_TITLE_MAX = 60;

export function validateProductBrandCopy(title: string) {
  if (!title) {
    return "Name is required.";
  }
  if (title.length > PRODUCT_BRAND_TITLE_MAX) {
    return `Name must be at most ${PRODUCT_BRAND_TITLE_MAX} characters.`;
  }
  return null;
}
