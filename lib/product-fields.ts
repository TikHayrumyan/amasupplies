import { slugify } from "@/lib/category-fields";

export type ProductRecord = {
  id: number;
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
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ProductImageRecord = {
  id: number;
  productId: number;
  imageUrl: string;
  sortOrder: number;
};

export type ProductListItem = ProductRecord & {
  brandTitle: string;
  brandSlug: string;
  categoryTitle: string;
  categorySlug: string;
  typeTitle: string | null;
  typeSlug: string | null;
};

export type ProductDetail = ProductListItem & {
  gallery: ProductImageRecord[];
  sizeIds: number[];
  sizeTitles: string[];
};

export const PRODUCT_TITLE_MAX = 80;
export const PRODUCT_META_TITLE_MAX = 60;
export const PRODUCT_META_DESCRIPTION_MAX = 160;
export const PRODUCT_SKU_MAX = 60;
export const PRODUCT_ITEM_NUMBER_MAX = 60;
export const PRODUCT_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

export { slugify };

export function validateProductCopy(input: {
  title: string;
  slug: string;
  sku: string;
  itemNumber: string;
  metaTitle: string;
  metaDescription: string;
  categoryId: number;
  brandId: number;
  typeId: number;
  typeRequired: boolean;
}) {
  if (!input.title) {
    return "Title is required.";
  }
  if (input.title.length > PRODUCT_TITLE_MAX) {
    return `Title must be at most ${PRODUCT_TITLE_MAX} characters.`;
  }
  if (!input.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens.";
  }
  if (!input.sku) {
    return "SKU is required.";
  }
  if (input.sku.length > PRODUCT_SKU_MAX) {
    return `SKU must be at most ${PRODUCT_SKU_MAX} characters.`;
  }
  if (!input.itemNumber) {
    return "Item number is required.";
  }
  if (input.itemNumber.length > PRODUCT_ITEM_NUMBER_MAX) {
    return `Item number must be at most ${PRODUCT_ITEM_NUMBER_MAX} characters.`;
  }
  if (input.metaTitle.length > PRODUCT_META_TITLE_MAX) {
    return `Meta title must be at most ${PRODUCT_META_TITLE_MAX} characters.`;
  }
  if (input.metaDescription.length > PRODUCT_META_DESCRIPTION_MAX) {
    return `Meta description must be at most ${PRODUCT_META_DESCRIPTION_MAX} characters.`;
  }
  if (!input.categoryId) {
    return "Category is required.";
  }
  if (!input.brandId) {
    return "Brand is required.";
  }
  if (input.typeRequired && !input.typeId) {
    return "Type is required.";
  }
  return null;
}

export function isEmptyHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() === "";
}

const ALLOWED_HTML_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
]);

export function sanitizeProductHtml(html: string) {
  if (!html) {
    return "";
  }
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name: string) => {
      const tagName = name.toLowerCase();
      if (!ALLOWED_HTML_TAGS.has(tagName)) {
        return "";
      }
      if (tag.startsWith("</")) {
        return `</${tagName}>`;
      }
      if (tagName === "br") {
        return "<br>";
      }
      return `<${tagName}>`;
    });
}
